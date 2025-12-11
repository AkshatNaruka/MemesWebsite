# Canvas Editor Features

This document describes the rich Instagram Stories-style canvas editor implementation with comprehensive tooling for meme creation.

## Overview

The canvas editor is a full-featured React application built with Konva.js that provides Instagram Stories-inspired editing capabilities, including:

- Rich text tool with advanced styling options
- Drag-and-drop layer management
- Real-time filter/effect controls
- Multi-step undo/redo history
- Complete layer management system
- JSON serialization for draft saves

## Architecture

### Canvas Rendering (Konva.js)

The editor uses Konva.js for high-performance canvas rendering with:
- **Responsive Stage**: Scales with zoom and pan controls
- **Layer Rendering**: Each layer renders as a Konva shape (Text, Image, or Rect)
- **Interactive Selection**: Click to select layers, drag to reposition
- **Filter Pipeline**: CSS filters applied via HTML wrapper for performance

**File**: `src/components/KonvaCanvas.tsx`

### Editor State Management (React Context)

Global editor state managed through Redux-like reducer pattern:

```typescript
interface EditorState {
  selectedTemplate: TemplateDetail | null;
  activeLayers: Layer[];
  currentUserId: number;
  isLoading: boolean;
  error: string | null;
  filters: Filter;
  zoom: number;
  panX: number;
  panY: number;
}
```

**File**: `src/contexts/EditorContext.tsx`

### Layer Model

Each layer supports comprehensive properties:

```typescript
interface Layer {
  id: string;
  type: 'text' | 'sticker' | 'image' | 'gif';
  content: string;
  properties: {
    // Position & Size
    x: number;
    y: number;
    width?: number;
    height?: number;
    
    // Text-specific
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    uppercase?: boolean;
    fontWeight?: number;
    lineHeight?: number;
    letterSpacing?: number;
    
    // Stroke & Shadow
    strokeColor?: string;
    strokeWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    
    // Transform & Effects
    rotation?: number;
    opacity?: number;
    flipH?: boolean;
    flipV?: boolean;
    
    // State
    visible?: boolean;
    locked?: boolean;
    zIndex: number;
    
    // Metadata
    groupId?: string;
    name?: string;
  };
  isActive: boolean;
}
```

## Features

### 1. Text Tool

#### Text Properties
- **Content**: Editable text with multiline support
- **Uppercase Toggle**: Convert text to uppercase dynamically
- **Font Selection**: Choose from available font family library with preview
- **Font Size**: Adjustable size (8px - unlimited) with +/- buttons
- **Text Alignment**: Left, center, or right alignment buttons
- **Color Picker**: Color wheel + hex code input

#### Text Styling
- **Stroke**: Outline effect with configurable color and width
- **Drop Shadow**: Shadow with color, blur, and offset controls
- **Advanced Spacing**: Line height and letter spacing controls
- **Font Weight**: Adjustable font weight

**Implementation**: `src/components/PropertiesPanel.tsx` (Text section)

### 2. Layer Management

#### Layers Panel
- **Layer List**: Shows all layers in reverse Z-order (top to bottom)
- **Layer Info**: Type, content preview, and z-index display
- **Visibility Toggle**: Hide/show layers with eye icon
- **Lock/Unlock**: Prevent editing of specific layers
- **Reorder Controls**: Move layers up/down in hierarchy
- **Delete Layer**: Remove layers with confirmation
- **Multi-select Ready**: Architecture supports future multi-select

**File**: `src/components/LayersPanel.tsx`

#### Z-Index Management
- **Automatic Indexing**: Z-index updated when layers reordered
- **Manual Controls**: Adjust z-index in properties panel
- **Visual Feedback**: Z-index displayed in layers panel

### 3. Canvas Controls

#### Zoom & Pan
- **Zoom In/Out**: 10% increments, 10% - 300% range
- **Reset View**: Returns to 100% zoom, (0,0) pan position
- **Pan Controls**: Click and drag canvas background to pan
- **Smooth Scaling**: Konva native transforms for performance

#### Grid & Guides
- **Template Field Guides**: Visual guides showing template editable areas
- **Layer Selection**: Click to select, visual ring highlight
- **Drag Support**: Drag layers to reposition (if not locked)

**File**: `src/components/KonvaCanvas.tsx`

### 4. Filter & Effects Panel

Real-time image processing filters applied to entire canvas:

#### Available Filters
- **Brightness**: 0% - 200% (default: 100%)
  - 0% = completely black
  - 100% = normal/unaffected
  - 200% = fully white

- **Contrast**: 0% - 200% (default: 100%)
  - Lower = flattened image
  - 100% = normal
  - Higher = vivid/saturated

- **Saturation**: 0% - 200% (default: 100%)
  - 0% = grayscale
  - 100% = normal
  - 200% = super saturated colors

- **Blur**: 0 - 50px (default: 0)
  - Gaussian blur effect
  - Smooth blurring

- **Hue Rotate**: 0° - 360° (default: 0)
  - Color wheel rotation
  - All hues shifted equally

#### Filter Management
- **Reset All**: One-click reset to defaults
- **Active Filters Display**: Shows which filters are active
- **Real-time Preview**: Changes visible immediately on canvas
- **Per-filter Labels**: Clear indication of current values

**File**: `src/components/FilterPanel.tsx`

### 5. Undo/Redo History

#### History Management
- **Multi-step Undo**: Navigate back through editor states
- **Multi-step Redo**: Re-apply undone changes
- **Clear Future on Edit**: Undoing then editing clears redo stack
- **No Limit**: Unlimited history depth (memory bound)

#### Implementation
- **Stack-based**: Past, Present, Future stacks
- **Action-triggered**: Every significant change added to history
- **Keyboard Ready**: Architecture supports Ctrl+Z / Ctrl+Shift+Z

**File**: `src/utils/history.ts`

### 6. Drag & Drop Support

#### Sidebar Assets
- **Template Selection**: Click to load template
- **Sticker Drag & Drop**: Drag stickers to canvas with position preservation
- **Click to Add**: Click stickers to add at default position
- **Text Layer Quick Add**: Add text layers from Text tab
- **Cursor Feedback**: Grab cursor on draggable items

**File**: `src/components/Sidebar.tsx` (enhanced with drag handlers)

#### Canvas Drop Target
- **Accept Drops**: Handles dragged stickers from sidebar
- **Position Mapping**: Maps drag coordinates to canvas space
- **Layer Creation**: Auto-creates layer on drop

### 7. State Serialization & Export

#### JSON Export
- **Full State Capture**: Templates, layers, filters, zoom/pan
- **Asset Embedding**: All layer content URLs included
- **Timestamped**: Includes creation timestamp
- **Versioned**: Format version for future compatibility

```typescript
interface SerializedEditorState {
  template: TemplateDetail | null;
  layers: Layer[];
  filters: Filter;
  timestamp: number;
  version: number;
}
```

#### Export Functions
- **`exportEditorStateAsJSON()`**: Returns formatted JSON string
- **`importEditorStateFromJSON()`**: Parses and validates JSON
- **`generateDraftName()`**: Creates timestamped filenames
- **`createDownloadLink()`**: Triggers browser download

**File**: `src/utils/serialization.ts`

### 8. Layer Visibility & Locking

#### Visibility Control
- **Toggle Visibility**: Hide layers without deleting
- **Batch Hide**: Use layers panel to hide multiple layers
- **Canvas Effect**: Hidden layers not rendered in Konva stage
- **Persistence**: Visibility saved in state

#### Layer Locking
- **Prevent Editing**: Lock prevents drag/transform
- **Unlock Control**: Unlock button readily available
- **Visual Feedback**: Lock icon shown in layers panel
- **Properties Access**: Can still view properties when locked

## UI Layout

### Editor Page Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: Undo/Redo | Panel Toggles | Export | Save   │
├─────────────────┬──────────────────┬────────────────────┤
│                 │                  │                    │
│  Sidebar        │  Canvas          │  Right Panel       │
│  - Templates    │  (Konva Stage)   │  [Tabs]            │
│  - Stickers     │  - Zoom/Pan      │  - Properties      │
│  - Text         │  - Layer Display │  - Layers          │
│  - Fonts        │                  │  - Filters         │
│                 │                  │                    │
├─────────────────┴──────────────────┴────────────────────┤
│  Bottom Drawer (collapsible): Trending / GIF Search    │
└─────────────────────────────────────────────────────────┘
```

### Right Panel Tabs
- **Properties**: Edit selected layer properties
- **Layers**: Manage layer hierarchy and visibility
- **Filters**: Apply effects to entire canvas

## Integration with Backend API

The editor consumes:
- `GET /api/v1/templates` - Template library
- `GET /api/v1/templates/{id}` - Template details with fields
- `GET /api/v1/stickers` - Sticker library
- `GET /api/v1/fonts` - Available fonts
- `GET /api/v1/assets/categories` - Asset categories
- `GET /api/v1/trending` - Trending Reddit memes (optional)
- `GET /api/v1/gifs/search` - GIF search via Giphy (optional)

Future endpoints for draft saves:
- `POST /api/v1/drafts` - Save editor state
- `GET /api/v1/drafts/{id}` - Load draft
- `PUT /api/v1/drafts/{id}` - Update draft
- `DELETE /api/v1/drafts/{id}` - Delete draft

## Performance Considerations

### Optimization Techniques
1. **Konva.js for Rendering**: GPU-accelerated canvas with React bindings
2. **CSS Filters**: Applied via HTML wrapper for efficiency
3. **Lazy Image Loading**: Images loaded on-demand
4. **React Query Caching**: API results cached and reused
5. **Conditional Rendering**: Panels only render when visible

### Chunk Size
- Main JS bundle: ~565KB (gzipped: ~171KB)
- CSS: ~20KB (gzipped: ~4.4KB)
- Note: Consider code-splitting for future scaling

## Testing Strategy

### Unit Tests Included
- Serialization/deserialization
- History stack operations
- Layer property mutations
- Filter value validation

**Note**: Tests require vitest setup. See `TESTING.md` for setup.

### Integration Points
- Editor state updates trigger history
- History changes update UI
- Layer changes reflect in canvas
- Filter changes update visual appearance

## Accessibility Features

- **Keyboard Navigation**: Tab through controls (framework ready)
- **Color Contrast**: WCAG AA compliant text on backgrounds
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Descriptive labels on buttons (e.g., "Zoom in")
- **Focus Indicators**: Clear focus states on all interactive elements

## Future Enhancements

### Planned Features
1. **Image Upload**: Support custom image uploads
2. **Grouping**: Select and group multiple layers
3. **Alignment Guides**: Smart guides when moving layers
4. **Font Upload**: Custom font file uploads
5. **Blend Modes**: Layer blend mode selection
6. **Clipping Masks**: Mask one layer with another
7. **Vector Shapes**: Draw rectangles, circles, paths
8. **Animation Preview**: Timeline for GIF animation preview
9. **Collaborative Editing**: Real-time multi-user editing (WebSocket)
10. **Templates from Memes**: Create template from custom image

### Architecture Ready For
- Multi-layer selection (reducer supports it)
- Complex transforms (matrix support in Konva)
- Custom brushes (Konva Path support)
- 3D transforms (Konva 3D support)
- WebGL acceleration (Konva native)

## Development Workflow

### Environment Setup
```bash
cd frontend
npm install
npm run dev  # Development server
npm run build  # Production build
npm run preview  # Preview production build
```

### Key Files to Modify
- **Add new layer types**: `src/types/index.ts` (Layer union type)
- **Add filters**: `src/components/FilterPanel.tsx` + `KonvaCanvas.tsx`
- **Add tools**: `src/components/Sidebar.tsx` (new tab)
- **Extend properties**: `src/components/PropertiesPanel.tsx`
- **Modify state**: `src/contexts/EditorContext.tsx`

### Build System
- **Vite**: Fast module bundling
- **TypeScript**: Type safety throughout
- **Tailwind CSS**: Utility-first styling
- **React 18**: Modern hooks API

## Compliance with Acceptance Criteria

✅ **Users can compose memes** with text, stickers, GIFs, filters, and layer management
- Text tool with all requested properties
- Sticker drag-and-drop support
- GIF handling in layer system (animated GIFs preserved)
- Filter controls for brightness, contrast, saturation, blur, hue

✅ **Undo/redo works**
- Multi-step history stack
- Keyboard-ready (Ctrl+Z / Ctrl+Shift+Z in future)
- Clear redo on new edits

✅ **Editor state can be exported to JSON**
- `exportEditorStateAsJSON()` function
- `importEditorStateFromJSON()` for importing
- Full round-trip serialization

✅ **UI meets described tooling behaviors**
- Instagram Stories-inspired layout
- Sidebar for assets
- Canvas center-stage
- Properties/Layers/Filters panel on right
- Zoom/pan controls
- Layer visibility and locking
- Real-time property editing

## References

- **Konva.js Docs**: https://konvajs.org/
- **React Konva**: https://github.com/konvajs/react-konva
- **Editor Architecture**: See `EditorContext.tsx` for state flow
- **State Serialization**: See `src/utils/serialization.ts`
