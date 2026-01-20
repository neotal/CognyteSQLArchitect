
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, ZoomIn, ZoomOut, Link as LinkIcon } from 'lucide-react';
import { Table, Group, Relationship, RelationType, AppState } from './types';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import TableModal from './components/TableModal';
import GroupModal from './components/GroupModal';
import RelationModal from './components/RelationModal';
import ConfirmationModal from './components/ConfirmationModal';
import { DEFAULT_COLORS } from './constants';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [groups, setGroups] = useState<Group[]>([
    { id: 'default', name: 'Main Project', color: '#3b82f6', position: { x: 50, y: 50 }, size: { width: 600, height: 500 } }
  ]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  
  // Modals state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  
  // Editing state
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingRelation, setEditingRelation] = useState<Relationship | null>(null);
  
  // Confirmation state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [searchTerm, setSearchTerm] = useState('');
  const isInitialLoadComplete = useRef(false);

  // 1. STRICT AUTO-LOAD FROM project-data.json (NO LOCALSTORAGE)
  useEffect(() => {
    const loadProjectFile = async () => {
      try {
        const response = await fetch('./project-data.json', { cache: 'no-cache' });
        if (response.ok) {
          const data: AppState = await response.json();
          if (data.tables) setTables(data.tables);
          if (data.groups) setGroups(data.groups);
          if (data.relationships) setRelationships(data.relationships);
          if (data.zoom) setZoom(data.zoom || 1);
          console.log("Visual architecture strictly loaded from project-data.json");
        }
      } catch (e) {
        console.error("Critical: Could not load project-data.json from repository.");
      }
      setTimeout(() => { isInitialLoadComplete.current = true; }, 200);
    };

    loadProjectFile();
  }, []);

  // 2. DETECT MANUAL UPDATES (Dirty State)
  // Whenever state changes after initial load, mark as "Dirty" to remind user to sync/save.
  useEffect(() => {
    if (isInitialLoadComplete.current) {
      setIsDirty(true);
    }
  }, [tables, groups, relationships, zoom]);

  // 3. EXPORT/SYNC: Write to the project file (User replaces local file and pushes to Git)
  const handleExport = () => {
    const state: AppState = { 
      tables, 
      groups, 
      relationships, 
      zoom 
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDirty(false); // Reset dirty state after sync
  };

  const autoLinkTables = useCallback((currentTables: Table[], currentRels: Relationship[]) => {
    const newRels: Relationship[] = [...currentRels];
    let changed = false;
    for (let i = 0; i < currentTables.length; i++) {
      for (let j = i + 1; j < currentTables.length; j++) {
        const tableA = currentTables[i];
        const tableB = currentTables[j];
        if (tableA.name.toUpperCase().startsWith('FCT') && tableB.name.toUpperCase().startsWith('FCT')) continue;
        tableA.columns.forEach(colA => {
          const colB = tableB.columns.find(c => c.name.toLowerCase() === colA.name.toLowerCase());
          if (colB) {
            const exists = newRels.some(r => 
              (r.fromColumnId === colA.id && r.toColumnId === colB.id) ||
              (r.fromColumnId === colB.id && r.toColumnId === colA.id)
            );
            if (!exists) {
              newRels.push({
                id: crypto.randomUUID(), fromTableId: tableA.id, fromColumnId: colA.id,
                toTableId: tableB.id, toColumnId: colB.id, type: '1:1'
              });
              changed = true;
            }
          }
        });
      }
    }
    return changed ? newRels : null;
  }, []);

  const handleDeleteRelation = (id: string) => {
    setConfirmModal({
      isOpen: true, title: 'Delete Relationship',
      message: 'Remove this relationship? Don\'t forget to SYNC to update the project file.',
      onConfirm: () => {
        setRelationships(prev => prev.filter(r => r.id !== id));
        setConfirmModal(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleDeleteTable = (id: string) => {
    const table = tables.find(t => t.id === id);
    if (!table) return;
    const linkedRels = relationships.filter(r => r.fromTableId === id || r.toTableId === id);
    let message = `Delete table "${table.name}"?`;
    if (linkedRels.length > 0) message += `\n\nNote: ${linkedRels.length} relationships will also be removed. Sync required.`;
    setConfirmModal({
      isOpen: true, title: 'Delete Table', message,
      onConfirm: () => {
        setTables(prev => prev.filter(t => t.id !== id));
        setRelationships(prev => prev.filter(r => r.fromTableId !== id && r.toTableId !== id));
        setConfirmModal(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleUpdateTable = (updatedTable: Table) => {
    const updatedTables = tables.map(t => t.id === updatedTable.id ? updatedTable : t);
    setTables(updatedTables);
    const autoRels = autoLinkTables(updatedTables, relationships);
    if (autoRels) setRelationships(autoRels);
    setIsTableModalOpen(false);
    setEditingTable(null);
  };

  const handleAddTable = (tableData: Partial<Table>) => {
    const targetGroupId = tableData.groupIds?.[0] || groups[0]?.id || 'default';
    const targetGroup = groups.find(g => g.id === targetGroupId);
    const newTable: Table = {
      id: crypto.randomUUID(), name: tableData.name || 'new_table', description: tableData.description || '',
      color: tableData.color || DEFAULT_COLORS[0], groupIds: tableData.groupIds || [targetGroupId],
      columns: tableData.columns || [], isCollapsed: false,
      position: { x: (targetGroup?.position.x || 100) + 50, y: (targetGroup?.position.y || 100) + 50 },
      sourceSystem: tableData.sourceSystem || '', businessArea: tableData.businessArea || '', businessUnit: tableData.businessUnit || ''
    };
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    const autoRels = autoLinkTables(updatedTables, relationships);
    if (autoRels) setRelationships(autoRels);
    setIsTableModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      <Sidebar 
        groups={groups} 
        isDirty={isDirty}
        onAddGroup={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
        onEditGroup={(g: any) => { setEditingGroup(g); setIsGroupModalOpen(true); }}
        onDeleteGroup={(id) => {
          setConfirmModal({
            isOpen: true, title: 'Delete Group', message: 'Delete group? Tables will remain but lose group association.',
            onConfirm: () => {
              setGroups(prev => prev.filter(g => g.id !== id));
              setTables(prev => prev.map(t => ({ ...t, groupIds: t.groupIds.filter(gid => gid !== id) })));
              setConfirmModal(p => ({ ...p, isOpen: false }));
            }
          });
        }}
        onExport={handleExport}
      />

      <div className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-[100] shadow-sm">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-black bg-gradient-to-br from-slate-900 to-blue-900 bg-clip-text text-transparent">Cognyte Architect</h1>
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/search:text-blue-500 transition-colors" />
              <input 
                type="text" placeholder="Search architecture..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 w-[300px] text-sm transition-all shadow-sm"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex bg-slate-100 p-1.5 rounded-xl space-x-1 items-center">
               <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
               <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
               <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-colors"><ZoomIn className="w-4 h-4" /></button>
             </div>
             <button onClick={() => { setEditingRelation(null); setIsRelationModalOpen(true); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><LinkIcon className="w-3.5 h-3.5 inline mr-2" /> Connect</button>
             <button onClick={() => { setEditingTable(null); setIsTableModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"><Plus className="w-3.5 h-3.5 inline mr-2" /> Add Table</button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative canvas-grid bg-slate-50">
          <Canvas 
            tables={tables} groups={groups} relationships={relationships} zoom={zoom}
            setTables={setTables} setGroups={setGroups}
            onEditTable={(t) => { setEditingTable(t); setIsTableModalOpen(true); }}
            onEditRelation={(r) => { setEditingRelation(r); setIsRelationModalOpen(true); }}
            onDeleteTable={handleDeleteTable}
            onDeleteRelation={handleDeleteRelation}
            onToggleCollapse={(id) => setTables(prev => prev.map(t => t.id === id ? { ...t, isCollapsed: !t.isCollapsed } : t))}
          />
        </main>
      </div>

      {isTableModalOpen && <TableModal groups={groups} initialData={editingTable} allTables={tables} onSave={editingTable ? handleUpdateTable : handleAddTable} onClose={() => setIsTableModalOpen(false)} />}
      {isGroupModalOpen && <GroupModal initialData={editingGroup} onSave={(g) => { setGroups(prev => editingGroup ? prev.map(gr => gr.id === g.id ? g : gr) : [...prev, { ...g, id: crypto.randomUUID(), position: { x: 100, y: 100 }, size: { width: 400, height: 400 } }]); setIsGroupModalOpen(false); }} onClose={() => setIsGroupModalOpen(false)} />}
      {isRelationModalOpen && <RelationModal tables={tables} initialData={editingRelation} onSave={(fT, fC, tT, tC, ty) => { setRelationships(prev => editingRelation ? prev.map(r => r.id === editingRelation.id ? { ...r, fromTableId: fT, fromColumnId: fC, toTableId: tT, toColumnId: tC, type: ty } : r) : [...prev, { id: crypto.randomUUID(), fromTableId: fT, fromColumnId: fC, toTableId: tT, toColumnId: tC, type: ty }]); setIsRelationModalOpen(false); }} onClose={() => setIsRelationModalOpen(false)} />}
      
      <ConfirmationModal 
        isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
        onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
};

export default App;
