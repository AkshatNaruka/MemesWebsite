import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { KonvaCanvas } from '@/components/KonvaCanvas';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { LayersPanel } from '@/components/LayersPanel';
import { FilterPanel } from '@/components/FilterPanel';
import { BottomDrawer } from '@/components/BottomDrawer';
import { useEditor } from '@/contexts/EditorContext';
import { useHistory } from '@/hooks/useHistory';
import { exportEditorStateAsJSON, generateDraftName, createDownloadLink } from '@/utils/serialization';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  ChevronUp,
  ChevronDown,
  Undo2,
  Redo2,
  Download,
  Save
} from 'lucide-react';

export function EditorPage() {
  const { state } = useEditor();
  const history = useHistory(state);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'layers' | 'filters'>('properties');
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);

  useEffect(() => {
    history.push(state);
  }, [state]);

  const handleUndo = () => {
    if (history.canUndo) {
      history.undo();
    }
  };

  const handleRedo = () => {
    if (history.canRedo) {
      history.redo();
    }
  };

  const handleExport = () => {
    const json = exportEditorStateAsJSON(state);
    const filename = generateDraftName();
    createDownloadLink(json, filename);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Meme Editor</h1>
          {state.selectedTemplate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>•</span>
              <span>Template: {state.selectedTemplate.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={!history.canUndo}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Undo"
          >
            <Undo2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!history.canRedo}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Redo"
          >
            <Redo2 className="w-5 h-5 text-gray-600" />
          </button>

          <div className="h-6 border-l border-gray-300" />

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 text-gray-600" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Toggle Right Panel */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle right panel"
          >
            {rightPanelOpen ? (
              <PanelRightClose className="w-5 h-5 text-gray-600" />
            ) : (
              <PanelRightOpen className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Toggle Bottom Drawer */}
          <button
            onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle content browser"
          >
            {bottomDrawerOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <div className="h-6 border-l border-gray-300" />

          {/* Export */}
          <button
            onClick={handleExport}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export as JSON"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>

          {/* Save (placeholder) */}
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
            title="Save draft"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0 border-r border-gray-200">
            <Sidebar />
          </div>
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col">
          <KonvaCanvas className="flex-1" />
        </div>

        {/* Right Panel */}
        {rightPanelOpen && (
          <div className="w-80 flex-shrink-0 flex flex-col border-l border-gray-200 bg-white">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setRightPanelTab('properties')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  rightPanelTab === 'properties'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setRightPanelTab('layers')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  rightPanelTab === 'layers'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Layers
              </button>
              <button
                onClick={() => setRightPanelTab('filters')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  rightPanelTab === 'filters'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Filters
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {rightPanelTab === 'properties' && <PropertiesPanel />}
              {rightPanelTab === 'layers' && <LayersPanel />}
              {rightPanelTab === 'filters' && <FilterPanel />}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Content Drawer */}
      <BottomDrawer
        isOpen={bottomDrawerOpen}
        onClose={() => setBottomDrawerOpen(false)}
      />
    </div>
  );
}