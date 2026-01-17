
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Download, Upload, Search, ZoomIn, ZoomOut, Database, Users, Link as LinkIcon, Trash2, Edit2, X, RefreshCcw } from 'lucide-react';
import { Table, Group, Relationship, Column, RelationType } from './types';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import TableModal from './components/TableModal';
import GroupModal from './components/GroupModal';
import RelationModal from './components/RelationModal';
import { DEFAULT_COLORS } from './constants';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [groups, setGroups] = useState<Group[]>([
    { id: 'default', name: 'Main Project', color: '#3b82f6', position: { x: 50, y: 50 }, size: { width: 600, height: 500 } }
  ]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingRelation, setEditingRelation] = useState<Relationship | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isInitialLoadComplete = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddTable = (tableData: Partial<Table>) => {
    const targetGroupId = tableData.groupIds?.[0] || groups[0].id;
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
        x: (targetGroup?.position.x || 100) + 50 + (Math.random() * 50), 
        y: (targetGroup?.position.y || 100) + 80 + (Math.random() * 50) 
      },
      sourceSystem: tableData.sourceSystem || '',
      businessArea: tableData.businessArea || '',
      businessUnit: tableData.businessUnit || '',
    };

    // Auto-linking: Scans existing tables for same column name + same type
    const newRelationships: Relationship[] = [];
    tables.forEach(existingTable => {
      existingTable.columns.forEach(existingCol => {
        newTable.columns.forEach(newCol => {
          if (existingCol.name.toLowerCase() === newCol.name.toLowerCase() && existingCol.type === newCol.type) {
            newRelationships.push({
              id: crypto.randomUUID(),
              fromTableId: existingTable.id,
              fromColumnId: existingCol.id,
              toTableId: newTable.id,
              toColumnId: newCol.id,
              type: '1:1'
            });
          }
        });
      });
    });

    setTables(prev => [...prev, newTable]);
    if (newRelationships.length > 0) {
      setRelationships(prev => [...prev, ...newRelationships]);
    }
    setIsTableModalOpen(false);
    setEditingTable(null);
  };

  const handleUpdateTable = (updatedTable: Table) => {
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    setIsTableModalOpen(false);
    setEditingTable(null);
  };

  const toggleTableCollapse = (id: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, isCollapsed: !t.isCollapsed } : t));
  };

  const handleDeleteTable = (id: string) => {
    if (window.confirm("Are you sure?")) {
      setTables(prev => prev.filter(t => t.id !== id));
      setRelationships(prev => prev.filter(r => r.fromTableId !== id && r.toTableId !== id));
    }
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

  const handleDeleteRelation = (id: string) => setRelationships(prev => prev.filter(r => r.id !== id));

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      <Sidebar 
        groups={groups} 
        onAddGroup={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
        onEditGroup={(g) => { setEditingGroup(g); setIsGroupModalOpen(true); }}
        onDeleteGroup={(id) => setGroups(prev => prev.filter(g => g.id !== id))}
      />

      <div className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-50">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-black bg-gradient-to-br from-slate-900 to-blue-900 bg-clip-text text-transparent">Cognyte Architect</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" placeholder="Search tables..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 w-64 text-sm"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex bg-slate-100 p-1.5 rounded-xl space-x-1 items-center">
               <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 hover:bg-white rounded-lg"><ZoomOut className="w-4 h-4" /></button>
               <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
               <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 hover:bg-white rounded-lg"><ZoomIn className="w-4 h-4" /></button>
             </div>
             <button onClick={() => { setEditingRelation(null); setIsRelationModalOpen(true); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest"><LinkIcon className="w-3.5 h-3.5 inline mr-2" /> Connect</button>
             <button onClick={() => { setEditingTable(null); setIsTableModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"><Plus className="w-3.5 h-3.5 inline mr-2" /> Add Table</button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative canvas-grid bg-slate-50">
          <Canvas 
            tables={tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))}
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
    </div>
  );
};

export default App;
