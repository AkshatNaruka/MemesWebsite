import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Canvas } from '@/components/Canvas';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { BottomDrawer } from '@/components/BottomDrawer';
import { useEditor } from '@/contexts/EditorContext';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export function EditorPage() {
  const { state } = useEditor();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [propertiesOpen, setPropertiesOpen] = React.useState(true);
  const [bottomDrawerOpen, setBottomDrawerOpen] = React.useState(false);

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
          
          {/* Toggle Properties Panel */}
          <button
            onClick={() => setPropertiesOpen(!propertiesOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle properties panel"
          >
            {propertiesOpen ? (
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
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col">
          <Canvas className="flex-1" />
        </div>

        {/* Right Properties Panel */}
        {propertiesOpen && (
          <div className="w-80 flex-shrink-0">
            <PropertiesPanel />
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