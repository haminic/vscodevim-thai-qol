import * as vscode from 'vscode';
import { Cursor } from '../common/motion/cursor';
import { VimState } from '../state/vimState';
import { Position } from 'vscode';

/**
 * We used to have an issue where we would do something like execute a VSCode
 * command, and would encounter race conditions because the cursor positions
 * wouldn't yet be updated. So we waited for a selection change event, but
 * this doesn't seem to be necessary any more.
 *
 * @deprecated Calls to this should probably be replaced with calls to `ModeHandler::syncCursors()` or something...
 */
export function getCursorsAfterSync(editor: vscode.TextEditor): Cursor[] {
  return editor.selections.map((x) => Cursor.FromVSCodeSelection(x));
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function scrollView(vimState: VimState, offset: number) {
  if (offset !== 0) {
    vimState.postponedCodeViewChanges.push({
      command: 'editorScroll',
      args: {
        to: offset > 0 ? 'up' : 'down',
        by: 'line',
        value: Math.abs(offset),
        revealCursor: false,
        select: false,
      },
    });
  }
}

export function assertDefined<X>(x: X | undefined, err: string): asserts x {
  if (x === undefined) {
    throw new Error(err);
  }
}

export function isHighSurrogate(charCode: number): boolean {
  return 0xd800 <= charCode && charCode <= 0xdbff;
}

export function isLowSurrogate(charCode: number): boolean {
  return 0xdc00 <= charCode && charCode <= 0xdfff;
}

export function isThai(charCode: number): boolean {
  return charCode >= 0x0e00 && charCode <= 0x0e7f;
}

const THAI_NON_BASE_CODES: number[] = [
  '่',
  '้',
  '๊',
  '๋', // Tone marks
  'ิ',
  'ี',
  'ื',
  'ั',
  'ํ',
  '์',
  '็', // Ascenders
  'ุ',
  'ู', // Descenders
  'ำ',
  // ำ is special. May or may not want.
  // Could mess with column alignment if included, but mess with cursor flow if not.
].map((char) => char.charCodeAt(0));

export function isThaiNonBase(charCode: number): boolean {
  return THAI_NON_BASE_CODES.includes(charCode);
}

export function getLeftWhile(p: Position, line: string): Position {
  if (p.character === 0) {
    return p;
  }

  if (isThai(line.charCodeAt(p.character - 1))) {
    const wasAtNonBase: boolean = isThaiNonBase(line.charCodeAt(p.character));

    p = p.getLeft();
    while (p.character > 0 && isThaiNonBase(line.charCodeAt(p.character))) {
      p = p.getLeft();
    }

    if (wasAtNonBase && p.character > 0) {
      p = p.getLeft();
      while (p.character > 0 && isThaiNonBase(line.charCodeAt(p.character))) {
        p = p.getLeft();
      }
    }

    return p;
  }

  if (
    isLowSurrogate(line.charCodeAt(p.character)) &&
    isHighSurrogate(line.charCodeAt(p.character - 1))
  ) {
    p = p.getLeft();
  }

  const newPosition = p.getLeft();
  if (
    newPosition.character > 0 &&
    isLowSurrogate(line.charCodeAt(newPosition.character)) &&
    isHighSurrogate(line.charCodeAt(newPosition.character - 1))
  ) {
    return newPosition.getLeft();
  } else {
    return newPosition;
  }
}

export function getRightWhile(p: Position, line: string): Position {
  const newPosition = p.getRight();
  const endOfLine = line.length;
  if (newPosition.character >= endOfLine) {
    return newPosition;
  }

  if (isThai(line.charCodeAt(p.character + 1))) {
    p = p.getRight();
    while (p.character < endOfLine && isThaiNonBase(line.charCodeAt(p.character))) {
      p = p.getRight();
    }
    return p;
  }

  if (
    isLowSurrogate(line.charCodeAt(newPosition.character)) &&
    isHighSurrogate(line.charCodeAt(p.character))
  ) {
    return newPosition.getRight();
  } else {
    return newPosition;
  }
}
