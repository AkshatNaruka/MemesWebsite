# Canvas Editor Implementation Guide

## Overview

This guide provides detailed information about implementing and extending the canvas editor, including architecture, state management, component interactions, and customization points.

## State Management Architecture

### EditorContext Flow

```
User Action (click, drag, type)
        ↓
Component Handler
        ↓
actions.* method call
        ↓
EditorContext dispatch(ACTION)
        ↓
editorReducer processes action
        ↓
New EditorState returned
        ↓
Components re-render (subscribed via useEditor hook)
        ↓
Canvas updates via Konva re-render
```

### Adding a New Action

1. **Define action type** in EditorContext:
```typescript
type EditorAction = 
  | { type: 'YOUR_ACTION'; payload: YourPayload }
```

2. **Handle in reducer**:
```typescript
case 'YOUR_ACTION':
  return {
    ...state,
    // your state mutations
  };
```

3. **Create action creator**:
```typescript
const actions = {
  yourAction: (payload: YourPayload) =>
    dispatch({ type: 'YOUR_ACTION', payload }),
};
```

4. **Use in component**:
```typescript
const { state, actions } = useEditor();
actions.yourAction(data);
```

## Layer Management

### Layer Lifecycle

1. **Creation**: `actions.addLayer()` generates unique ID
2. **Selection**: `actions.setActiveLayer(layerId)` marks as active
3. **Editing**: `actions.updateLayer(id, updates)` mutates properties
4. **Rendering**: Konva renders visible, unlocked layers
5. **Deletion**: `actions.deleteLayer(id)` removes from state

### Layer Property Mutation Pattern

All layer updates use immutable spread pattern:

```typescript
actions.updateLayer(layerId, {
  properties: {
    ...layer.properties,
    newField: value  // Override specific field
  }
});
```

### Adding New Layer Properties

1. **Update Layer interface** in `src/types/index.ts`:
```typescript
export interface Layer {
  properties: {
    // ... existing
    newProperty?: number;
  };
}
```

2. **Add UI control** in `PropertiesPanel.tsx`:
```typescript
<input
  value={activeLayer.properties.newProperty || 0}
  onChange={(e) => actions.updateLayer(activeLayer.id, {
    properties: {
      ...activeLayer.properties,
      newProperty: Number(e.target.value)
    }
  })}
/>
```

3. **Apply in canvas** in `KonvaCanvas.tsx`:
```typescript
// For Konva elements, map property to native attribute
<Text
  {...otherProps}
  customProp={layer.properties.newProperty}
/>
```

## Canvas Rendering with Konva

### Stage Structure

```
<Stage> (Konva Stage, responsive)
  <Layer> (Konva Layer, contains all shapes)
    <Image> (Template background)
    <Rect> (Template field guides)
    <LayerElement> (For each active layer)
      - <Text> if type === 'text'
      - <Image> if type === 'sticker' | 'image' | 'gif'
```

### Adding New Layer Type

1. **Update Layer union type**:
```typescript
type: 'text' | 'sticker' | 'image' | 'gif' | 'newtype';
```

2. **Add shape in LayerElement**:
```typescript
if (layer.type === 'newtype') {
  return (
    <Konva.Shape
      {...konvaProps}
      // Konva-specific handling
    />
  );
}
```

3. **Add sidebar UI** for layer creation.

### Filter Implementation

Filters applied via CSS on HTML wrapper:

```typescript
const getFilterString = (): string => {
  // Build CSS filter string from state.filters
  return `brightness(${brightness}%) contrast(${contrast}%) ...`;
};

return (
  <div style={{ filter: getFilterString() }}>
    <Stage>...</Stage>
  </div>
);
```

To add new filter:

1. **Add to Filter interface**:
```typescript
export interface Filter {
  newEffect: number;
}
```

2. **Add UI in FilterPanel.tsx**:
```typescript
<input
  type="range"
  value={filters.newEffect}
  onChange={(e) => actions.setFilter({ newEffect: Number(e.target.value) })}
/>
```

3. **Update getFilterString()** in KonvaCanvas:
```typescript
filterStr += `effect(${newEffect}) `;
```

## History & Undo/Redo

### History Stack Implementation

```typescript
interface HistoryState {
  past: EditorState[];      // All previous states
  present: EditorState;      // Current state
  future: EditorState[];     // States after undo
}
```

### History Operations

- **Push**: Add current state to past, set new state as present
- **Undo**: Move present to future, set last from past as present
- **Redo**: Move present to past, set first from future as present
- **Clear Future**: When editing after undo, clear future

### Integrating History into New Features

In `EditorPage.tsx`:

```typescript
useEffect(() => {
  history.push(state);  // Push state to history on every change
}, [state]);

const handleUndo = () => {
  if (history.canUndo) {
    history.undo();
    // Note: You'd need to dispatch the new state
  }
};
```

**Current limitation**: History hook needs integration into context actions to dispatch undo/redo results.

## Serialization Pattern

### Exporting State

```typescript
const json = exportEditorStateAsJSON(state);
// Returns formatted JSON string with:
// - template info
// - all layers with properties
// - filter settings
// - version and timestamp
```

### Importing State

```typescript
const imported = importEditorStateFromJSON(jsonString);
// Returns { template, layers, filters, ... }
// Validate before restoring to editor
```

### Adding Serializable Properties

1. Ensure property is in Layer or Filter interfaces
2. Serialization automatically includes in JSON
3. Deserialization types already support it
4. No special handling needed

## Component Interaction Patterns

### Sidebar to Canvas

```
StickerCard
  → onDragStart: setData({ type: 'sticker', content: url })
  → KonvaCanvas receives drop
  → Calls actions.addLayer()
  → EditorContext updates state
  → LayerElement renders in canvas
```

### Properties Panel to Canvas

```
ColorPicker input
  → onChange: actions.updateLayer(id, { properties: { color: value } })
  → EditorContext updates layer
  → LayerElement re-renders
  → Text color changes in canvas
```

### Layers Panel to Canvas

```
EyeIcon click
  → onClick: actions.toggleLayerVisibility(id)
  → EditorContext updates layer.properties.visible
  → KonvaCanvas filters visible layers
  → Hidden layer not rendered
```

## Performance Optimization

### Current Optimizations

1. **Lazy Image Loading**: Images loaded on-demand via useEffect
2. **Conditional Rendering**: Panels only render when tab is active
3. **Konva Native**: Uses GPU-accelerated canvas operations
4. **Filter CSS**: Applied via HTML wrapper, not re-rendering layers
5. **Memoization Ready**: Components can use React.memo if needed

### Future Optimizations

1. **Code Splitting**: Separate bundles for heavy libraries
2. **Image Caching**: Cache loaded images in-memory
3. **Debouncing**: Debounce rapid property changes
4. **Virtual Lists**: Virtual scrolling for large layer lists (100+ layers)
5. **Web Workers**: Move history/serialization to workers

### Measuring Performance

```typescript
// In component
useEffect(() => {
  console.time('Layer render');
  // ... render logic
  console.timeEnd('Layer render');
}, [dependencies]);

// Check Chrome DevTools:
// - Performance tab for frame rate
// - Profiler tab for component render times
```

## Testing Strategy

### Unit Test Example (for history)

```typescript
import { pushToHistory, undo, redo } from '@/utils/history';

describe('History', () => {
  it('should undo changes', () => {
    let history = initializeHistory(initialState);
    const state2 = { ...initialState, zoom: 1.5 };
    history = pushToHistory(history, state2);
    history = undo(history);
    expect(history.present.zoom).toBe(1);
  });
});
```

### Integration Test Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorPage } from '@/pages/EditorPage';
import { EditorProvider } from '@/contexts/EditorContext';

test('should add text layer', () => {
  render(
    <EditorProvider>
      <EditorPage />
    </EditorProvider>
  );
  
  const addTextButton = screen.getByText('Add Text Layer');
  fireEvent.click(addTextButton);
  
  expect(screen.getByText('Add text here')).toBeInTheDocument();
});
```

## Debugging Tips

### Check State

```typescript
const { state } = useEditor();
console.log('Current state:', state);
console.log('Active layers:', state.activeLayers);
console.log('Filters:', state.filters);
```

### Check History

```typescript
const history = useHistory(state);
console.log('Can undo:', history.canUndo);
console.log('Can redo:', history.canRedo);
console.log('History depth:', history.present);
```

### Canvas Issues

```typescript
// Konva Stage reference
const stageRef = useRef<Konva.Stage>(null);
const stage = stageRef.current;

// Get all shapes
const layer = stage?.getLayers()[0];
const shapes = layer?.getChildren();

// Log shape properties
shapes?.forEach(shape => {
  console.log(shape.name(), shape.getAttrs());
});
```

### React DevTools

1. Install React DevTools browser extension
2. Open Component tab
3. Navigate to EditorContext.Provider
4. View state in props panel
5. Watch updates in real-time

## Common Tasks

### Adding a New Text Decoration

1. Add to Layer interface: `textDecoration?: string`
2. Add UI in PropertiesPanel: checkbox or select
3. Apply in KonvaCanvas LayerElement
4. Serialization auto-includes

### Adding Template Field Controls

1. Identify field boundaries in template
2. Add click handler in KonvaCanvas Rect:
```typescript
<Rect
  onClick={() => actions.setActiveField(field.id)}
/>
```
3. Highlight selected field with border

### Adding Hotkeys

In EditorPage.tsx:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [history]);
```

### Supporting Multi-Select

1. Change activeLayers to selectedLayers (array)
2. Update reducer to handle multi-select actions
3. Update UI to show multiple selections
4. Update canvas to highlight all selected

(Architecture already supports this!)

## Deployment Considerations

### Frontend Build

```bash
npm run build
# Output: frontend/dist/
# Static files ready for Flask static serving
```

### Flask Integration

```python
# app.py already configured to serve from /static
@app.route('/')
def index():
    return send_from_directory('frontend/dist', 'index.html')
```

### Environment Variables

Currently none required for frontend. In future:
- `VITE_API_BASE_URL`: API endpoint (already handled)
- `VITE_GIPHY_KEY`: For GIF search
- `VITE_MAX_UPLOAD_SIZE`: File upload limit

### Bundle Analysis

```bash
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts
# npm run build && open dist/stats.html
```

## References

- **Konva.js API**: https://konvajs.org/api/
- **React Context**: https://react.dev/learn/passing-data-deeply-with-context
- **Custom Hooks**: https://react.dev/learn/reusing-logic-with-custom-hooks
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## Support

For issues:
1. Check browser console (F12) for errors
2. Check React DevTools for state issues
3. Check Konva layer in browser DevTools
4. Read error messages carefully (often very helpful)
5. Check git diff for recent changes
