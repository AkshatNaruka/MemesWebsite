import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { EditorState, Layer, TemplateDetail } from '@/types';

// Action types
type EditorAction =
  | { type: 'SET_SELECTED_TEMPLATE'; payload: TemplateDetail | null }
  | { type: 'ADD_LAYER'; payload: Layer }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'SET_ACTIVE_LAYER'; payload: string | null }
  | { type: 'SET_CURRENT_USER'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_EDITOR' };

// Initial state
const initialState: EditorState = {
  selectedTemplate: null,
  activeLayers: [],
  currentUserId: 1, // Default user for demo
  isLoading: false,
  error: null,
};

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_SELECTED_TEMPLATE':
      return {
        ...state,
        selectedTemplate: action.payload,
        activeLayers: [], // Clear layers when template changes
        error: null,
      };

    case 'ADD_LAYER':
      return {
        ...state,
        activeLayers: [...state.activeLayers, action.payload],
        error: null,
      };

    case 'UPDATE_LAYER':
      return {
        ...state,
        activeLayers: state.activeLayers.map(layer =>
          layer.id === action.payload.id
            ? { ...layer, ...action.payload.updates }
            : layer
        ),
        error: null,
      };

    case 'DELETE_LAYER':
      return {
        ...state,
        activeLayers: state.activeLayers.filter(layer => layer.id !== action.payload),
        error: null,
      };

    case 'SET_ACTIVE_LAYER':
      return {
        ...state,
        activeLayers: state.activeLayers.map(layer => ({
          ...layer,
          isActive: layer.id === action.payload,
        })),
        error: null,
      };

    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUserId: action.payload,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_EDITOR':
      return {
        ...initialState,
        currentUserId: state.currentUserId, // Keep current user
      };

    default:
      return state;
  }
}

// Context
interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  actions: {
    setSelectedTemplate: (template: TemplateDetail | null) => void;
    addLayer: (layer: Omit<Layer, 'id'>) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    deleteLayer: (id: string) => void;
    setActiveLayer: (id: string | null) => void;
    setCurrentUser: (userId: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    resetEditor: () => void;
  };
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// Provider component
interface EditorProviderProps {
  children: ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  // Action creators
  const actions = {
    setSelectedTemplate: (template: TemplateDetail | null) =>
      dispatch({ type: 'SET_SELECTED_TEMPLATE', payload: template }),

    addLayer: (layer: Omit<Layer, 'id'>) =>
      dispatch({
        type: 'ADD_LAYER',
        payload: {
          ...layer,
          id: Math.random().toString(36).substr(2, 9),
        },
      }),

    updateLayer: (id: string, updates: Partial<Layer>) =>
      dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } }),

    deleteLayer: (id: string) =>
      dispatch({ type: 'DELETE_LAYER', payload: id }),

    setActiveLayer: (id: string | null) =>
      dispatch({ type: 'SET_ACTIVE_LAYER', payload: id }),

    setCurrentUser: (userId: number) =>
      dispatch({ type: 'SET_CURRENT_USER', payload: userId }),

    setLoading: (loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }),

    setError: (error: string | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),

    clearError: () =>
      dispatch({ type: 'CLEAR_ERROR' }),

    resetEditor: () =>
      dispatch({ type: 'RESET_EDITOR' }),
  };

  const contextValue: EditorContextType = {
    state,
    dispatch,
    actions,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

// Hook
export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}