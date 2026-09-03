import { RecordingSession, RecordingMarker } from '../types';

export interface AudioLevelData {
  volume: number; // 0 to 100
  frequencyData: number[];
}

export type AudioLevelCallback = (data: AudioLevelData) => void;
export type ChunkSavedCallback = (chunkIndex: number, totalBytes: number) => void;

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;

  private currentSession: RecordingSession | null = null;
  private chunkIndex = 0;
  private isRecording = false;
  private isPaused = false;
  private startTime = 0;
  private pausedDuration = 0;
  private pauseStartTime = 0;

  private onLevelUpdate: AudioLevelCallback | null = null;
  private onChunkSaved: ChunkSavedCallback | null = null;

  /**
   * Check if Opus audio recording is supported
   */
  public getBestMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'audio/webm';
  }

  /**
   * Start a new recording session
   */
  public async startRecording(options: {
    title?: string;
    noteId?: string;
    noteTitle?: string;
    sourceType: 'microphone' | 'system' | 'mixed';
    deviceId?: string;
    onLevelUpdate?: AudioLevelCallback;
    onChunkSaved?: ChunkSavedCallback;
  }): Promise<RecordingSession> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress');
    }

    this.onLevelUpdate = options.onLevelUpdate || null;
    this.onChunkSaved = options.onChunkSaved || null;
    this.chunkIndex = 0;
    this.pausedDuration = 0;
    this.isPaused = false;

    // 1. Obtain MediaStream
    let stream: MediaStream;
    if (options.sourceType === 'system') {
      try {
        // Capture system/display audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true, // required by some browsers to get audio
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        });
        // If display media gave video track, mute/disable video to save CPU
        stream.getVideoTracks().forEach(t => (t.enabled = false));
      } catch (err: any) {
        throw new Error('فشل التقاط صوت النظام / مشاركة الشاشة: ' + (err.message || 'تم إلغاء الإذن'));
      }
    } else {
      // Microphone capture (Opus 24kbps voice optimized: mono, echo cancellation, noise suppression)
      const constraints: MediaStreamConstraints = {
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          deviceId: options.deviceId ? { exact: options.deviceId } : undefined,
        },
        video: false,
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    }

    this.mediaStream = stream;

    // 2. Setup Web Audio API Analyser for live visualizer and level meter
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
      this.startLevelLoop();
    } catch (e) {
      console.warn('AudioContext analysis not available:', e);
    }

    // 3. Initiate Server Session
    const mimeType = this.getBestMimeType();
    const res = await fetch('/api/recordings/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: options.title,
        noteId: options.noteId,
        noteTitle: options.noteTitle,
        sourceType: options.sourceType,
        mimeType,
        bitrate: 24000, // 24 kbps mono Opus voice
      }),
    });

    if (!res.ok) {
      this.cleanupStream();
      throw new Error('Failed to initialize server recording session');
    }

    const { session } = await res.json();
    this.currentSession = session;
    this.startTime = Date.now();
    this.isRecording = true;

    // 4. Initialize MediaRecorder with 24kbps Opus
    const recorderOptions: MediaRecorderOptions = {
      mimeType,
      audioBitsPerSecond: 24000, // ~24 kbps voice profile (15MB for 90min)
    };

    try {
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
    } catch {
      // Fallback if specific options not supported
      this.mediaRecorder = new MediaRecorder(stream);
    }

    // 5. CRASH SAFETY: Chunk handler (fires every 3 seconds)
    this.mediaRecorder.ondataavailable = async (e: BlobEvent) => {
      if (e.data && e.data.size > 0 && this.currentSession) {
        const currentChunkIdx = this.chunkIndex++;
        const currentDuration = this.getElapsedTime();
        try {
          // Convert Blob to Base64
          const base64Data = await this.blobToBase64(e.data);
          const chunkRes = await fetch(`/api/recordings/${this.currentSession.id}/chunk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chunkIndex: currentChunkIdx,
              data: base64Data,
              timestamp: currentDuration,
            }),
          });
          if (chunkRes.ok) {
            const result = await chunkRes.json();
            if (this.onChunkSaved) {
              this.onChunkSaved(currentChunkIdx, result.totalBytes || 0);
            }
          }
        } catch (err) {
          console.warn('Failed to upload audio chunk safely:', err);
        }
      }
    };

    // Start recording with 3000ms (3s) timeslices for continuous crash-safe flushing
    this.mediaRecorder.start(3000);

    return this.currentSession;
  }

  /**
   * Pause recording
   */
  public pauseRecording() {
    if (!this.isRecording || this.isPaused || !this.mediaRecorder) return;
    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
    this.isPaused = true;
    this.pauseStartTime = Date.now();
  }

  /**
   * Resume recording
   */
  public resumeRecording() {
    if (!this.isRecording || !this.isPaused || !this.mediaRecorder) return;
    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
    if (this.pauseStartTime > 0) {
      this.pausedDuration += Date.now() - this.pauseStartTime;
      this.pauseStartTime = 0;
    }
    this.isPaused = false;
  }

  /**
   * Mark Moment / Bookmark current timestamp
   */
  public async markMoment(label: string = 'علامة موضع مهم'): Promise<RecordingMarker | null> {
    if (!this.currentSession) return null;
    const timestamp = this.getElapsedTime();

    try {
      const res = await fetch(`/api/recordings/${this.currentSession.id}/marker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp, label }),
      });
      if (res.ok) {
        const { marker } = await res.json();
        return marker;
      }
    } catch (e) {
      console.warn('Error marking moment:', e);
    }

    return {
      id: 'm_' + Date.now(),
      timestamp,
      label,
      createdAt: Date.now(),
    };
  }

  /**
   * Associate block typed in note with active recording
   */
  public async logBlockCaptured(blockId: string, contentSnippet: string, overrideTimestamp?: number): Promise<void> {
    if (!this.currentSession) return;
    const timestamp = overrideTimestamp !== undefined ? overrideTimestamp : this.getElapsedTime();
    try {
      await fetch(`/api/recordings/${this.currentSession.id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, timestamp, contentSnippet }),
      });
    } catch (e) {
      console.warn('Error logging block capture:', e);
    }
  }

  /**
   * Stop and finalize recording session
   */
  public async stopRecording(): Promise<RecordingSession | null> {
    if (!this.isRecording || !this.currentSession) return null;

    const totalDuration = this.getElapsedTime();
    const sessionId = this.currentSession.id;

    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Request any final data
      try {
        this.mediaRecorder.requestData();
      } catch {}
      this.mediaRecorder.stop();
    }

    this.cleanupStream();
    this.isRecording = false;
    this.isPaused = false;

    // Wait a brief moment for final ondataavailable to deliver
    await new Promise(r => setTimeout(r, 400));

    // Finalize on server
    try {
      const res = await fetch(`/api/recordings/${sessionId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: totalDuration }),
      });
      if (res.ok) {
        const { session } = await res.json();
        this.currentSession = null;
        return session;
      }
    } catch (err) {
      console.error('Error finalizing recording:', err);
    }

    const session = this.currentSession;
    this.currentSession = null;
    return session;
  }

  /**
   * Get live elapsed seconds
   */
  public getElapsedTime(): number {
    if (!this.isRecording || this.startTime === 0) return 0;
    const now = this.isPaused ? this.pauseStartTime : Date.now();
    const elapsedMs = Math.max(0, now - this.startTime - this.pausedDuration);
    return Math.floor(elapsedMs / 1000);
  }

  public getSession(): RecordingSession | null {
    return this.currentSession;
  }

  public isActive(): boolean {
    return this.isRecording;
  }

  public isPausedState(): boolean {
    return this.isPaused;
  }

  // Visualizer loop
  private startLevelLoop() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.isRecording) return;
      if (this.analyser && this.onLevelUpdate && !this.isPaused) {
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const volume = Math.min(100, Math.round((avg / 255) * 160));
        const freqArray = Array.from(dataArray.slice(0, 16));
        this.onLevelUpdate({ volume, frequencyData: freqArray });
      }
      this.animFrameId = requestAnimationFrame(update);
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  private cleanupStream() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const audioRecorder = new AudioRecorderService();
