import type { EditorState, SerializedEditorState, Layer } from '@/types';

const SERIALIZATION_VERSION = 1;

export function serializeEditorState(state: EditorState): SerializedEditorState {
  return {
    template: state.selectedTemplate,
    layers: state.activeLayers,
    filters: state.filters,
    timestamp: Date.now(),
    version: SERIALIZATION_VERSION,
  };
}

export function deserializeEditorState(
  data: SerializedEditorState
): Partial<EditorState> {
  if (data.version !== SERIALIZATION_VERSION) {
    console.warn(
      `Serialization version mismatch: expected ${SERIALIZATION_VERSION}, got ${data.version}`
    );
  }

  return {
    selectedTemplate: data.template,
    activeLayers: data.layers,
    filters: data.filters,
  };
}

export function exportEditorStateAsJSON(state: EditorState): string {
  const serialized = serializeEditorState(state);
  return JSON.stringify(serialized, null, 2);
}

export function importEditorStateFromJSON(json: string): SerializedEditorState {
  return JSON.parse(json);
}

export function exportLayersAsJSON(layers: Layer[]): string {
  return JSON.stringify(layers, null, 2);
}

export function importLayersFromJSON(json: string): Layer[] {
  const parsed = JSON.parse(json);
  return Array.isArray(parsed) ? parsed : [];
}

export function generateDraftName(): string {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `meme_draft_${timestamp}`;
}

export function createDownloadLink(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function createImageDownloadLink(canvas: HTMLCanvasElement, filename: string): void {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
