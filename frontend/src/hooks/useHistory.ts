import { useReducer, useCallback } from 'react';
import type { EditorState } from '@/types';
import {
  initializeHistory,
  pushToHistory,
  undo as undoHistory,
  redo as redoHistory,
  canUndo as canUndoHistory,
  canRedo as canRedoHistory,
  type HistoryState,
} from '@/utils/history';

export interface UseHistoryReturn {
  present: EditorState;
  canUndo: boolean;
  canRedo: boolean;
  push: (newState: EditorState) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

type HistoryAction =
  | { type: 'PUSH'; payload: EditorState }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'INITIALIZE'; payload: EditorState }
  | { type: 'CLEAR' };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'PUSH':
      return pushToHistory(state, action.payload);
    case 'UNDO':
      return undoHistory(state);
    case 'REDO':
      return redoHistory(state);
    case 'INITIALIZE':
      return initializeHistory(action.payload);
    case 'CLEAR':
      return initializeHistory(state.present);
    default:
      return state;
  }
}

export function useHistory(initialState: EditorState): UseHistoryReturn {
  const [history, dispatch] = useReducer(
    historyReducer,
    initialState,
    initializeHistory
  );

  const push = useCallback((newState: EditorState) => {
    dispatch({ type: 'PUSH', payload: newState });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  return {
    present: history.present,
    canUndo: canUndoHistory(history),
    canRedo: canRedoHistory(history),
    push,
    undo,
    redo,
    clear,
  };
}
