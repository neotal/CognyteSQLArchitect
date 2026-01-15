
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
      ...tableData
    };

    setTables(prev => [...prev, newTable]);

    const autoRelations: Relationship[] = [];
    tables.forEach(existing => {
      const hasMatchingColumn = existing.columns.some(ec => 
        newTable.columns.some(nc => nc.name.toLowerCase() === ec.name.toLowerCase() && nc.name.trim() !== "")
      );
      if (hasMatchingColumn) {
        autoRelations.push({
          id: crypto.randomUUID(),
          fromTableId: newTable.id,
          toTableId: existing.id,
          type: '1:1'
        });
      }
    });
    if (autoRelations.length > 0) {
      setRelationships(prev => [...prev, ...autoRelations]);
    }

    setIsTableModalOpen(false);
    setEditingTable(null);
  };

  const handleUpdateTable = (table: Table) => {
    setTables(prev => prev.map(t => t.id === table.id ? table : t));
    setIsTableModalOpen(false);
    setEditingTable(null);
  };

  const toggleTableCollapse = (id: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, isCollapsed: !t.isCollapsed } : t));
  };

  const handleDeleteTable = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this table?")) {
      setTables(prev => prev.filter(t => t.id !== id));
      setRelationships(prev => prev.filter(r => r.fromTableId !== id && r.toTableId !== id));
    }
  };

  const handleAddGroup = (groupData: Partial<Group>) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupData.name || 'New Group',
      color: groupData.color || '#3b82f6',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      size: { width: 400, height: 400 }
    };
    
    if (groups.some(g => g.name.toLowerCase() === newGroup.name.toLowerCase())) {
      alert("A group with this name already exists.");
      return;
    }
    
    setGroups(prev => [...prev, newGroup]);
    setIsGroupModalOpen(false);
  };

  const handleUpdateGroup = (group: Group) => {
    const isDuplicateName = groups.some(g => g.id !== group.id && g.name.toLowerCase() === group.name.toLowerCase());
    if (isDuplicateName) {
      alert("This group name is already taken.");
      return;
    }
    setGroups(prev => prev.map(g => g.id === group.id ? group : g));
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
    if (groups.length <= 1) {
      alert("The project must have at least one group.");
      return;
    }

    const tablesInGroup = tables.filter(t => t.groupIds.includes(id));
    if (tablesInGroup.length > 0) {
      alert(`Cannot delete this group because it contains ${tablesInGroup.length} tables. Please move or delete them first.`);
      return;
    }
    
    if (window.confirm("Delete this empty group?")) {
      setGroups(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleAddRelationship = (fromId: string, toId: string, type: RelationType) => {
    const newRel: Relationship = {
      id: crypto.randomUUID(),
      fromTableId: fromId,
      toTableId: toId,
      type
    };
    setRelationships(prev => [...prev, newRel]);
    setIsRelationModalOpen(false);
  };

  const handleDeleteRelation = (id: string) => {
    setRelationships(prev => prev.filter(r => r.id !== id));
  };

  const handleReset = () => {
    if (window.confirm("This will clear all tables and groups! Continue?")) {
      setTables([]);
      setRelationships([]);
      setGroups([{ id: 'default', name: 'Main Project', color: '#3b82f6', position: { x: 50, y: 50 }, size: { width: 600, height: 500 } }]);
      localStorage.removeItem('cognyte-sql-planner-state');
    }
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ tables, groups, relationships }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognyte-sql-design.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tables) setTables(json.tables);
        if (json.groups) setGroups(json.groups);
        if (json.relationships) setRelationships(json.relationships);
        alert("Design imported successfully!");
      } catch (err) {
        alert("Error loading file. Please ensure it is a valid JSON design.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans selection:bg-blue-100">
      <Sidebar 
        groups={groups} 
        onAddGroup={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
        onEditGroup={(g) => { setEditingGroup(g); setIsGroupModalOpen(true); }}
        onDeleteGroup={handleDeleteGroup}
      />

      <div className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30 shadow-sm backdrop-blur-md bg-white/90">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-black bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-none">
                Cognyte
              </h1>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1 text-left">SQL Architect</span>
            </div>
            
            <div className="h-10 w-[1px] bg-slate-100"></div>
            
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search tables or columns..." 
                className="pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 focus:bg-white outline-none w-72 transition-all text-sm font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl space-x-1">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleImportJSON} 
                 className="hidden" 
                 accept=".json"
               />
               <button 
                 onClick={() => fileInputRef.current?.click()} 
                 title="Import Design" 
                 className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-blue-600 transition-all shadow-none hover:shadow-sm"
               >
                 <Upload className="w-4.5 h-4.5" />
               </button>
               <button 
                 onClick={handleExportJSON} 
                 title="Export Design" 
                 className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-indigo-600 transition-all shadow-none hover:shadow-sm"
               >
                 <Download className="w-4.5 h-4.5" />
               </button>
               <button 
                 onClick={handleReset} 
                 title="Clear All Data" 
                 className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-red-500 transition-all shadow-none hover:shadow-sm"
               >
                 <RefreshCcw className="w-4.5 h-4.5" />
               </button>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
            
            <button 
              onClick={() => setIsRelationModalOpen(true)}
              className="flex items-center px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
            >
              <LinkIcon className="w-3.5 h-3.5 mr-2" /> Link Tables
            </button>
            <button 
              onClick={() => { setEditingTable(null); setIsTableModalOpen(true); }}
              className="flex items-center px-6 py-2.5 bg-slate-900 text-white hover:bg-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Table
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative canvas-grid bg-slate-50/50">
          <Canvas 
            tables={tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.columns.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())))}
            groups={groups}
            relationships={relationships}
            zoom={zoom}
            setTables={setTables}
            setGroups={setGroups}
            onEditTable={(t) => { setEditingTable(t); setIsTableModalOpen(true); }}
            onDeleteTable={handleDeleteTable}
            onDeleteRelation={handleDeleteRelation}
            onToggleCollapse={toggleTableCollapse}
          />

          <div className="absolute bottom-10 right-10 flex flex-col space-y-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 p-2 z-30">
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl text-slate-600 transition-all shadow-sm active:scale-95"><ZoomIn className="w-5 h-5" /></button>
            <div className="text-center text-[10px] font-black text-slate-400 select-none py-1 border-y border-slate-100">{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl text-slate-600 transition-all shadow-sm active:scale-90"><ZoomOut className="w-5 h-5" /></button>
          </div>
        </main>
      </div>

      {isTableModalOpen && (
        <TableModal 
          groups={groups}
          initialData={editingTable}
          allTables={tables}
          onSave={editingTable ? handleUpdateTable : handleAddTable}
          onClose={() => setIsTableModalOpen(false)}
        />
      )}
      {isGroupModalOpen && (
        <GroupModal 
          initialData={editingGroup}
          onSave={editingGroup ? handleUpdateGroup : handleAddGroup}
          onClose={() => setIsGroupModalOpen(false)}
        />
      )}
      {isRelationModalOpen && (
        <RelationModal 
          tables={tables}
          onSave={handleAddRelationship}
          onClose={() => setIsRelationModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
