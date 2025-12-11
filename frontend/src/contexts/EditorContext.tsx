import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { EditorState, Layer, TemplateDetail, Filter } from '@/types';

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
  | { type: 'RESET_EDITOR' }
  | { type: 'SET_FILTER'; payload: Partial<Filter> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'REORDER_LAYERS'; payload: { layerId: string; direction: 'up' | 'down' } }
  | { type: 'TOGGLE_LAYER_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_LAYER_LOCK'; payload: string };

const defaultFilter: Filter = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hueRotate: 0,
};

// Initial state
const initialState: EditorState = {
  selectedTemplate: null,
  activeLayers: [],
  currentUserId: 1, // Default user for demo
  isLoading: false,
  error: null,
  filters: defaultFilter,
  zoom: 1,
  panX: 0,
  panY: 0,
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

    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: defaultFilter,
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(3, action.payload)),
      };

    case 'SET_PAN':
      return {
        ...state,
        panX: action.payload.x,
        panY: action.payload.y,
      };

    case 'REORDER_LAYERS': {
      const layerIndex = state.activeLayers.findIndex(
        (l) => l.id === action.payload.layerId
      );
      if (layerIndex === -1) return state;

      const newLayers = [...state.activeLayers];
      if (action.payload.direction === 'up' && layerIndex < newLayers.length - 1) {
        [newLayers[layerIndex], newLayers[layerIndex + 1]] = [
          newLayers[layerIndex + 1],
          newLayers[layerIndex],
        ];
      } else if (action.payload.direction === 'down' && layerIndex > 0) {
        [newLayers[layerIndex], newLayers[layerIndex - 1]] = [
          newLayers[layerIndex - 1],
          newLayers[layerIndex],
        ];
      }

      return {
        ...state,
        activeLayers: newLayers.map((layer, idx) => ({
          ...layer,
          properties: {
            ...layer.properties,
            zIndex: idx,
          },
        })),
      };
    }

    case 'TOGGLE_LAYER_VISIBILITY': {
      return {
        ...state,
        activeLayers: state.activeLayers.map((layer) =>
          layer.id === action.payload
            ? {
                ...layer,
                properties: {
                  ...layer.properties,
                  visible: layer.properties.visible !== false ? false : true,
                },
              }
            : layer
        ),
      };
    }

    case 'TOGGLE_LAYER_LOCK': {
      return {
        ...state,
        activeLayers: state.activeLayers.map((layer) =>
          layer.id === action.payload
            ? {
                ...layer,
                properties: {
                  ...layer.properties,
                  locked: layer.properties.locked !== true,
                },
              }
            : layer
        ),
      };
    }

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
    setFilter: (filter: Partial<Filter>) => void;
    resetFilters: () => void;
    setZoom: (zoom: number) => void;
    setPan: (x: number, y: number) => void;
    reorderLayers: (layerId: string, direction: 'up' | 'down') => void;
    toggleLayerVisibility: (layerId: string) => void;
    toggleLayerLock: (layerId: string) => void;
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

    setFilter: (filter: Partial<Filter>) =>
      dispatch({ type: 'SET_FILTER', payload: filter }),

    resetFilters: () =>
      dispatch({ type: 'RESET_FILTERS' }),

    setZoom: (zoom: number) =>
      dispatch({ type: 'SET_ZOOM', payload: zoom }),

    setPan: (x: number, y: number) =>
      dispatch({ type: 'SET_PAN', payload: { x, y } }),

    reorderLayers: (layerId: string, direction: 'up' | 'down') =>
      dispatch({ type: 'REORDER_LAYERS', payload: { layerId, direction } }),

    toggleLayerVisibility: (layerId: string) =>
      dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: layerId }),

    toggleLayerLock: (layerId: string) =>
      dispatch({ type: 'TOGGLE_LAYER_LOCK', payload: layerId }),
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