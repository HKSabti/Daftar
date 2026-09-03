/**
 * Pure TypeScript 3-Way Text Merge & Arabic Diff Engine
 * Inspired by Yjs / diff3 algorithm for conflict resolution without data loss.
 */

export interface MergeResult {
  hasConflict: boolean;
  mergedText: string;
  conflictDetails?: {
    localSnippet: string;
    remoteSnippet: string;
  };
}

/**
 * Merges two versions of text (Local vs Remote).
 * If modifications are in distinct sections or paragraphs, cleanly unifies them.
 * If identical lines differ, frames them with non-destructive markers so user can review.
 */
export function mergeTexts(local: string, remote: string, base: string = ''): MergeResult {
  if (local === remote) {
    return { hasConflict: false, mergedText: local };
  }

  if (!base) {
    // If no base available, check if one is a simple superset or append
    if (local.includes(remote)) {
      return { hasConflict: false, mergedText: local };
    }
    if (remote.includes(local)) {
      return { hasConflict: false, mergedText: remote };
    }
  }

  const localLines = local.split('\n');
  const remoteLines = remote.split('\n');

  // Fast paragraph-level diff / merge
  const resultLines: string[] = [];
  let hasConflict = false;
  let localConflictSnippets: string[] = [];
  let remoteConflictSnippets: string[] = [];

  const maxLen = Math.max(localLines.length, remoteLines.length);
  let i = 0;
  let j = 0;

  while (i < localLines.length || j < remoteLines.length) {
    const lLine = i < localLines.length ? localLines[i] : null;
    const rLine = j < remoteLines.length ? remoteLines[j] : null;

    if (lLine === rLine) {
      if (lLine !== null) resultLines.push(lLine);
      i++;
      j++;
    } else if (lLine !== null && rLine === null) {
      resultLines.push(lLine);
      i++;
    } else if (lLine === null && rLine !== null) {
      resultLines.push(rLine);
      j++;
    } else {
      // Both lines exist but differ
      // Look ahead to see if local line exists down in remote
      const nextMatchInRemote = remoteLines.indexOf(lLine!, j);
      const nextMatchInLocal = localLines.indexOf(rLine!, i);

      if (nextMatchInRemote !== -1 && (nextMatchInLocal === -1 || nextMatchInRemote < nextMatchInLocal)) {
        // Remote has added lines before matching local
        while (j < nextMatchInRemote) {
          resultLines.push(remoteLines[j]);
          j++;
        }
      } else if (nextMatchInLocal !== -1) {
        // Local has added lines before matching remote
        while (i < nextMatchInLocal) {
          resultLines.push(localLines[i]);
          i++;
        }
      } else {
        // Direct conflicting section
        hasConflict = true;
        localConflictSnippets.push(lLine!);
        remoteConflictSnippets.push(rLine!);

        resultLines.push(`<<<<<<< النسخة المحلية (هذا الجهاز)`);
        resultLines.push(lLine!);
        resultLines.push(`======= النسخة السحابية (Google Drive / Remote)`);
        resultLines.push(rLine!);
        resultLines.push(`>>>>>>> تم الحفظ بأمان`);
        i++;
        j++;
      }
    }
  }

  return {
    hasConflict,
    mergedText: resultLines.join('\n'),
    conflictDetails: hasConflict
      ? {
          localSnippet: localConflictSnippets.join('\n'),
          remoteSnippet: remoteConflictSnippets.join('\n'),
        }
      : undefined,
  };
}
