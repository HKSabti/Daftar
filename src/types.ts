export type Direction = 'auto' | 'rtl' | 'ltr';
export type AppLanguage = 'ar' | 'en';

export interface VaultInfo {
  id: string;
  name: string;
  path: string;
  description?: string;
  createdAt: number;
  noteCount: number;
}

export type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bullet-list'
  | 'numbered-list'
  | 'toggle-list'
  | 'checkbox'
  | 'code'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'table'
  | 'image'
  | 'math'
  | 'gradebook'
  | 'exam'
  | 'quran'
  | 'teacher-log'
  | 'kanban';

export interface GradeStudent {
  id: string;
  name: string;
  nationalId?: string;
  scores: Record<string, number>; // assignmentId -> score
  attendance?: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
}

export interface GradeColumn {
  id: string;
  title: string;
  maxScore: number;
  weight?: number;
}

export interface GradebookData {
  title: string;
  subject: string;
  className: string;
  semester: string;
  columns: GradeColumn[];
  students: GradeStudent[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[]; // for multiple-choice
  correctAnswer: string | number; // index or text or boolean string
  points: number;
  explanation?: string;
}

export interface ExamData {
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  totalPoints: number;
  questions: ExamQuestion[];
  userAnswers?: Record<string, string | number>;
  submitted?: boolean;
  score?: number;
}

export interface QuranVerseData {
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  verseNumber: number;
  textUthmani: string;
  tafsir?: string;
  notes?: string;
}

export interface TeacherLogData {
  date: string;
  teacherName: string;
  department: string;
  subject: string;
  topic: string;
  period: number;
  classroom: string;
  observations: string;
  evaluations: {
    preparation: number; // 1-5
    engagement: number; // 1-5
    timeManagement: number; // 1-5
    classroomControl: number; // 1-5
  };
  recommendations: string;
  hodSignature?: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface KanbanData {
  columns: KanbanColumn[];
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  // Metadata for complex blocks
  checked?: boolean; // For checkbox
  isOpen?: boolean; // For toggle-list
  summary?: string; // For toggle-list header
  language?: string; // For code block
  calloutType?: 'note' | 'scholarly' | 'warning' | 'quote' | 'marginalia' | 'quran' | 'exam' | 'teacher';
  calloutTitle?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  imageUrl?: string;
  imageCaption?: string;
  mathFormula?: string;
  // Interactive Educational & Notion Modules
  gradebookData?: GradebookData;
  examData?: ExamData;
  quranData?: QuranVerseData;
  teacherLogData?: TeacherLogData;
  kanbanData?: KanbanData;
  // Phase 2: Live Recording Anchors
  recordingId?: string;
  recordingTimestamp?: number; // seconds from recording start
}

export interface RecordingMarker {
  id: string;
  timestamp: number; // in seconds
  label: string;
  createdAt: number;
}

export interface RecordingCapturedBlock {
  blockId: string;
  timestamp: number;
  contentSnippet: string;
}

export interface RecordingSession {
  id: string;
  vaultId: string;
  noteId?: string;
  noteTitle?: string;
  title: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  audioPath: string; // e.g. "attachments/recordings/rec_123.webm"
  audioUrl?: string;
  mimeType: string;
  bitrate: number;
  sizeBytes: number;
  sourceType: 'microphone' | 'system' | 'mixed';
  isFinalized: boolean;
  chunkCount: number;
  markers: RecordingMarker[];
  capturedBlocks: RecordingCapturedBlock[];
  waveformPeaks?: number[];
}

export interface StorageStatus {
  availableBytes: number;
  totalBytes: number;
  freeSpaceReadable: string;
  isLowSpace: boolean;
  estimatedHoursRemaining: number;
}

export interface NoteItem {
  id: string;
  vaultId: string;
  title: string;
  folder: string; // e.g. "root" or "studies/optics"
  path: string;
  content: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
  tags: string[];
  outgoingLinks: string[];
  direction: Direction;
  pinned?: boolean;
  icon?: string; // Notion-style emoji or icon e.g. "📊", "📖", "📝"
  coverUrl?: string; // Notion-style page header banner image
}

export interface NoteFolder {
  id: string;
  name: string;
  path: string;
  parentPath: string | null;
}

export interface SearchMatch {
  field: 'title' | 'content' | 'tag';
  snippet: string;
  start: number;
  length: number;
}

export interface SearchResult {
  noteId: string;
  noteTitle: string;
  notePath: string;
  score: number;
  matches: SearchMatch[];
}

export interface BacklinkItem {
  sourceNoteId: string;
  sourceNoteTitle: string;
  sourceNotePath: string;
  excerpt: string;
  targetLink: string;
}

export interface TagIndexItem {
  tag: string;
  count: number;
  notes: {
    id: string;
    title: string;
    path: string;
  }[];
}

// ================= PHASE 5: SYNC, CLOUD, AUTH & BACKUP TYPES =================

export type SyncProvider = 'google-drive' | 'icloud' | 'local-backup';
export type SyncState = 'synced' | 'pending' | 'syncing' | 'conflicted' | 'offline' | 'error';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'apple' | 'local';
  createdAt: number;
}

export interface SyncConflict {
  id: string;
  fileId: string;
  filePath: string;
  fileName: string;
  vaultId: string;
  localContent: string;
  remoteContent: string;
  localUpdatedAt: number;
  remoteUpdatedAt: number;
  resolved: boolean;
  mergedContent?: string;
}

export interface SyncStatusInfo {
  provider: SyncProvider;
  state: SyncState;
  lastSyncedAt: number | null;
  pendingUploadCount: number;
  pendingDownloadCount: number;
  conflictsCount: number;
  isOnline: boolean;
  driveFolderId?: string;
  vaultPath?: string;
  selectiveSyncAudio: boolean; // if false, audio recordings are not synced to cloud
  evictedFilesCount?: number; // for iCloud placeholder/evicted detection
}

export interface BackupSchedule {
  enabled: boolean;
  intervalHours: number; // e.g. 6, 12, 24, 168 (weekly)
  lastBackupAt: number | null;
  backupFolderPath: string;
  encryptionEnabled: boolean;
  keepCount: number;
}

export interface BackupItem {
  id: string;
  filename: string;
  sizeBytes: number;
  createdAt: number;
  vaultId: string;
  encrypted: boolean;
}

export interface ICloudDiagnostic {
  isAvailable: boolean;
  isInICloudDrive: boolean;
  detectedICloudPath: string | null;
  evictedFiles: string[]; // .icloud files
  syncLagSeconds: number;
  cloudKitAlternativeNote: string;
}

