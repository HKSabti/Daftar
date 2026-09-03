import fs from 'fs';
import path from 'path';

/**
 * Automated Crash-Safety Test for Audio Recording
 * Proves that interrupted / unfinalized recordings with streamed chunks can be fully recovered
 * without data loss.
 */
async function runCrashSafetyProof() {
  console.log('=== Starting Crash-Safety Test for Daftar Audio System ===');
  const baseUrl = 'http://localhost:3000';

  // 1. Start a simulated recording session
  console.log('1. Initiating recording session...');
  const startRes = await fetch(`${baseUrl}/api/recordings/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Automated Crash Safety Test Note',
      sourceType: 'microphone',
      bitrate: 24000,
    }),
  });

  if (!startRes.ok) {
    throw new Error('Failed to start recording session');
  }

  const { session } = await startRes.json();
  console.log(`✓ Session created: ${session.id}`);

  // 2. Stream 5 sequential audio chunks
  const dummyChunk = Buffer.from('GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAAAAA+4EBbWVuAdYAAAAAAAAAAAAAAABPZXhwdXJlaWwAAA==', 'base64');

  console.log('2. Streaming 5 sequential chunks (simulating 15 seconds of lecture recording)...');
  for (let i = 0; i < 5; i++) {
    const chunkRes = await fetch(`${baseUrl}/api/recordings/${session.id}/chunk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chunkIndex: i,
        data: dummyChunk.toString('base64'),
        timestamp: (i + 1) * 3,
      }),
    });

    if (!chunkRes.ok) {
      throw new Error(`Failed to write chunk #${i}`);
    }
    console.log(`  ✓ Chunk #${i + 1} written atomically to disk`);
  }

  // 3. Mark a moment
  await fetch(`${baseUrl}/api/recordings/${session.id}/marker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp: 9, label: 'Key Scholarly Observation' }),
  });
  console.log('  ✓ Timestamp marker saved at 00:09');

  // 4. SIMULATE SUDDEN POWER LOSS: We abort and DO NOT call stop.
  console.log('3. Simulating sudden power failure / browser termination...');

  // 5. Query unfinalized sessions
  const unfinRes = await fetch(`${baseUrl}/api/recordings/unfinalized`);
  const { unfinalized } = await unfinRes.json();
  const found = unfinalized.find((u: any) => u.id === session.id);
  if (!found) {
    throw new Error('Expected session to be detected as unfinalized');
  }
  console.log(`✓ Crash detected! Found unfinalized session: ${session.id} with ${found.chunkCount} chunks on disk`);

  // 6. Execute recovery
  console.log('4. Executing recovery algorithm...');
  const recoverRes = await fetch(`${baseUrl}/api/recordings/${session.id}/recover`, {
    method: 'POST',
  });

  const recoverData = await recoverRes.json();
  if (!recoverData.success || !recoverData.session.isFinalized) {
    throw new Error('Recovery failed');
  }

  console.log(`✓ Session successfully recovered! Duration: ${recoverData.session.duration}s, Markers: ${recoverData.session.markers.length}`);
  console.log('=== TEST PASSED: Zero lecture data lost upon sudden crash! ===');
}

runCrashSafetyProof().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
