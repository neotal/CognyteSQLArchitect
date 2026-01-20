
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Plus, Search, ZoomIn, ZoomOut, Link as LinkIcon, Table as TableIcon, Hash, ChevronRight, X, Database, Globe, Briefcase } from 'lucide-react';
import { Table, Group, Relationship, Column, RelationType } from './types';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import TableModal from './components/TableModal';
import GroupModal from './components/GroupModal';
import RelationModal from './components/RelationModal';
import ConfirmationModal from './components/ConfirmationModal';
import { DEFAULT_COLORS, TABLE_WIDTH } from './constants';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [groups, setGroups] = useState<Group[]>([
    { id: 'default', name: 'Main Project', color: '#3b82f6', position: { x: 50, y: 50 }, size: { width: 600, height: 500 } }
  ]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [zoom, setZoom] = useState(1);
  
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const isInitialLoadComplete = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('cognyte-sql-planner-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tables) setTables(parsed.tables);
        if (parsed.groups) setGroups(parsed.groups);
        if (parsed.relationships) setRelationships(parsed.relationships);
        if (parsed.zoom) setZoom(parsed.zoom);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setTimeout(() => {
      isInitialLoadComplete.current = true;
    }, 100);
  }, []);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      const stateToSave = { tables, groups, relationships, zoom };
      localStorage.setItem('cognyte-sql-planner-state', JSON.stringify(stateToSave));
    }
  }, [tables, groups, relationships, zoom]);

  const autoLinkTables = useCallback((currentTables: Table[], currentRels: Relationship[]) => {
    const newRels: Relationship[] = [...currentRels];
    let changed = false;

    for (let i = 0; i < currentTables.length; i++) {
      for (let j = i + 1; j < currentTables.length; j++) {
        const tableA = currentTables[i];
        const tableB = currentTables[j];

        const isTableAfct = tableA.name.toUpperCase().startsWith('FCT');
        const isTableBfct = tableB.name.toUpperCase().startsWith('FCT');
        
        if (isTableAfct && isTableBfct) {
          continue; 
        }

        tableA.columns.forEach(colA => {
          const colB = tableB.columns.find(c => c.name.toLowerCase() === colA.name.toLowerCase());
          
          if (colB) {
            const exists = newRels.some(r => 
              (r.fromColumnId === colA.id && r.toColumnId === colB.id) ||
              (r.fromColumnId === colB.id && r.toColumnId === colA.id)
            );

            if (!exists) {
              newRels.push({
                id: crypto.randomUUID(),
                fromTableId: tableA.id,
                fromColumnId: colA.id,
                toTableId: tableB.id,
                toColumnId: colB.id,
                type: '1:1'
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
      isOpen: true,
      title: 'Delete Relationship',
      message: 'Are you sure you want to delete this relationship between the tables?',
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
    let message = `Are you sure you want to delete table "${table.name}"?`;
    
    if (linkedRels.length > 0) {
      message += `\n\nNote: There are ${linkedRels.length} active relationship(s) linked to this table that will also be removed.`;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Table',
      message,
      onConfirm: () => {
        setTables(prev => prev.filter(t => t.id !== id));
        setRelationships(prev => prev.filter(r => r.fromTableId !== id && r.toTableId !== id));
        setConfirmModal(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleDeleteGroup = (id: string) => {
    const group = groups.find(g => g.id === id);
    if (!group) return;

    const groupTables = tables.filter(t => t.groupIds.includes(id));
    let message = `Are you sure you want to delete group "${group.name}"?`;

    if (groupTables.length > 0) {
      message += `\n\nNote: This group contains ${groupTables.length} table(s). The tables themselves will not be deleted, but their assignment to this group will be removed.`;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Group',
      message,
      onConfirm: () => {
        setGroups(prev => prev.filter(g => g.id !== id));
        setTables(prev => prev.map(t => ({
          ...t,
          groupIds: t.groupIds.filter(gid => gid !== id)
        })));
        setConfirmModal(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    const results: any[] = [];

    tables.forEach(table => {
      if (table.name.toLowerCase().includes(term)) {
        results.push({ type: 'table', tableId: table.id, name: table.name });
      }
      if (table.sourceSystem?.toLowerCase().includes(term)) {
        results.push({ type: 'sourceSystem', tableId: table.id, name: table.sourceSystem, parentTable: table.name });
      }
      if (table.businessArea?.toLowerCase().includes(term)) {
        results.push({ type: 'businessArea', tableId: table.id, name: table.businessArea, parentTable: table.name });
      }
      if (table.businessUnit?.toLowerCase().includes(term)) {
        results.push({ type: 'businessUnit', tableId: table.id, name: table.businessUnit, parentTable: table.name });
      }
      table.columns.forEach(col => {
        if (col.name.toLowerCase().includes(term)) {
          results.push({ type: 'column', tableId: table.id, name: col.name, parentTable: table.name });
        }
      });
    });
    return results.slice(0, 15);
  }, [searchTerm, tables]);

  const handleSearchResultClick = (tableId: string) => {
    const targetTable = tables.find(t => t.id === tableId);
    if (!targetTable) return;
    setSearchTerm('');
    setIsSearchFocused(false);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, isCollapsed: false } : t));
    setTimeout(() => {
      const container = document.querySelector('.canvas-scroll-container');
      if (container) {
        const { clientWidth, clientHeight } = container;
        const targetX = targetTable.position.x * zoom;
        const targetY = targetTable.position.y * zoom;
        const scrollLeft = targetX - (clientWidth / 2) + ((TABLE_WIDTH * zoom) / 2);
        const scrollTop = targetY - (clientHeight / 2) + (120 * zoom);
        container.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' });
        const tableEl = document.getElementById(`table-${tableId}`);
        if (tableEl) {
          const card = tableEl.querySelector('.relative.bg-white');
          if (card) {
            card.classList.add('search-highlight');
            setTimeout(() => card.classList.remove('search-highlight'), 1500);
          }
        }
      }
    }, 100);
  };

  const handleAddTable = (tableData: Partial<Table>) => {
    const targetGroupId = tableData.groupIds?.[0] || groups[0]?.id || 'default';
    const targetGroup = groups.find(g => g.id === targetGroupId);
    
    const newTable: Table = {
      id: crypto.randomUUID(),
      name: tableData.name || 'new_table',
      description: tableData.description || '',
      color: tableData.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      groupIds: tableData.groupIds || [targetGroupId],
      columns: tableData.columns || [],
      isCollapsed: false,
      position: { 
        x: (targetGroup?.position.x || 100) + 50, 
        y: (targetGroup?.position.y || 100) + 80 
      },
      sourceSystem: tableData.sourceSystem || '',
      businessArea: tableData.businessArea || '',
      businessUnit: tableData.businessUnit || '',
    };
    
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    
    const autoRels = autoLinkTables(updatedTables, relationships);
    if (autoRels) setRelationships(autoRels);

    setIsTableModalOpen(false);
  };

  const handleUpdateTable = (updatedTable: Table) => {
    const updatedTables = tables.map(t => t.id === updatedTable.id ? updatedTable : t);
    setTables(updatedTables);
    
    const autoRels = autoLinkTables(updatedTables, relationships);
    if (autoRels) setRelationships(autoRels);

    setIsTableModalOpen(false);
    setEditingTable(null);
  };

  const toggleTableCollapse = (id: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, isCollapsed: !t.isCollapsed } : t));
  };

  const handleAddGroup = (groupData: Partial<Group>) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupData.name || 'New Group',
      color: groupData.color || '#3b82f6',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      size: { width: 400, height: 400 }
    };
    setGroups(prev => [...prev, newGroup]);
    setIsGroupModalOpen(false);
  };

  const handleUpdateGroup = (group: Group) => {
    setGroups(prev => prev.map(g => g.id === group.id ? group : g));
    setIsGroupModalOpen(false);
  };

  const handleSaveRelationship = (fromTableId: string, fromColumnId: string, toTableId: string, toColumnId: string, type: RelationType) => {
    if (editingRelation) {
      setRelationships(prev => prev.map(r => r.id === editingRelation.id ? { ...r, fromTableId, fromColumnId, toTableId, toColumnId, type } : r));
    } else {
      setRelationships(prev => [...prev, { id: crypto.randomUUID(), fromTableId, fromColumnId, toTableId, toColumnId, type }]);
    }
    setIsRelationModalOpen(false);
    setEditingRelation(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      <Sidebar 
        groups={groups} 
        onAddGroup={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
        onEditGroup={(g) => { setEditingGroup(g); setIsGroupModalOpen(true); }}
        onDeleteGroup={handleDeleteGroup}
      />

      <div className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-[100] shadow-sm">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-black bg-gradient-to-br from-slate-900 to-blue-900 bg-clip-text text-transparent">Cognyte Architect</h1>
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/search:text-blue-500 transition-colors" />
              <input 
                type="text" placeholder="Search tables, columns, or business context..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 w-[420px] text-sm transition-all shadow-sm"
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex bg-slate-100 p-1.5 rounded-xl space-x-1 items-center">
               <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-colors"><ZoomOut className="w-4 h-4" /></button>
               <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
               <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 hover:bg-white rounded-lg transition-colors"><ZoomIn className="w-4 h-4" /></button>
             </div>
             <button onClick={() => { setEditingRelation(null); setIsRelationModalOpen(true); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"><LinkIcon className="w-3.5 h-3.5 inline mr-2" /> Connect</button>
             <button onClick={() => { setEditingTable(null); setIsTableModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"><Plus className="w-3.5 h-3.5 inline mr-2" /> Add Table</button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative canvas-grid bg-slate-50">
          <Canvas 
            tables={tables}
            groups={groups}
            relationships={relationships}
            zoom={zoom}
            setTables={setTables}
            setGroups={setGroups}
            onEditTable={(t) => { setEditingTable(t); setIsTableModalOpen(true); }}
            onEditRelation={(r) => { setEditingRelation(r); setIsRelationModalOpen(true); }}
            onDeleteTable={handleDeleteTable}
            onDeleteRelation={handleDeleteRelation}
            onToggleCollapse={toggleTableCollapse}
          />
        </main>
      </div>

      {isTableModalOpen && <TableModal groups={groups} initialData={editingTable} allTables={tables} onSave={editingTable ? handleUpdateTable : handleAddTable} onClose={() => setIsTableModalOpen(false)} />}
      {isGroupModalOpen && <GroupModal initialData={editingGroup} onSave={editingGroup ? handleUpdateGroup : handleAddGroup} onClose={() => setIsGroupModalOpen(false)} />}
      {isRelationModalOpen && <RelationModal tables={tables} initialData={editingRelation} onSave={handleSaveRelationship} onClose={() => setIsRelationModalOpen(false)} />}
      
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
};

export default App;
