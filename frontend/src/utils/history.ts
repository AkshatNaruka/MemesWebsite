import type { EditorState } from '@/types';

export interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

export function initializeHistory(initialState: EditorState): HistoryState {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}

export function pushToHistory(
  history: HistoryState,
  newState: EditorState
): HistoryState {
  return {
    past: [...history.past, history.present],
    present: newState,
    future: [],
  };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;

  const newPast = history.past.slice(0, -1);
  const newPresent = history.past[history.past.length - 1];

  return {
    past: newPast,
    present: newPresent,
    future: [history.present, ...history.future],
  };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;

  const newPresent = history.future[0];
  const newFuture = history.future.slice(1);

  return {
    past: [...history.past, history.present],
    present: newPresent,
    future: newFuture,
  };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}

export function clearFuture(history: HistoryState): HistoryState {
  return {
    ...history,
    future: [],
  };
}
