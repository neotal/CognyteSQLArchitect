
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
    { id: 'default', name: 'Main Project', color: '#3b82f6' }
  ]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [zoom, setZoom] = useState(1);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sql-planner-state-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTables(parsed.tables || []);
        setGroups(parsed.groups || [{ id: 'default', name: 'Main Project', color: '#3b82f6' }]);
        setRelationships(parsed.relationships || []);
        setZoom(parsed.zoom || 1);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('sql-planner-state-v2', JSON.stringify({ tables, groups, relationships, zoom }));
  }, [tables, groups, relationships, zoom]);

  const handleAddTable = (tableData: Partial<Table>) => {
    const newTable: Table = {
      id: crypto.randomUUID(),
      name: tableData.name || 'new_table',
      description: tableData.description || '',
      color: tableData.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      groupIds: tableData.groupIds || ['default'],
      columns: tableData.columns || [],
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      ...tableData
    };

    setTables(prev => [...prev, newTable]);

    // Requirement: Auto 1:1 relationships on initial creation for identical column names
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

  const handleDeleteTable = (id: string) => {
    if (confirm("Permanently delete this table and all its relationships?")) {
      setTables(prev => prev.filter(t => t.id !== id));
      setRelationships(prev => prev.filter(r => r.fromTableId !== id && r.toTableId !== id));
    }
  };

  const handleAddGroup = (groupData: Partial<Group>) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupData.name || 'New Group',
      color: groupData.color || '#000000'
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
      alert("Another group already has this name.");
      return;
    }
    setGroups(prev => prev.map(g => g.id === group.id ? group : g));
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
    if (groups.length <= 1) {
      alert("You must maintain at least one group.");
      return;
    }
    if (confirm("Delete this group? Tables belonging exclusively to this group will be moved to the default group.")) {
      const remainingGroups = groups.filter(g => g.id !== id);
      const fallbackGroupId = remainingGroups[0].id;
      
      setGroups(remainingGroups);
      setTables(prev => prev.map(t => {
        const updatedGroupIds = t.groupIds.filter(gid => gid !== id);
        return {
          ...t,
          groupIds: updatedGroupIds.length === 0 ? [fallbackGroupId] : updatedGroupIds
        };
      }));
    }
  };

  const handleAddRelationship = (fromId: string, toId: string, type: RelationType) => {
    // Check if already exists
    if (relationships.some(r => (r.fromTableId === fromId && r.toTableId === toId) || (r.fromTableId === toId && r.toTableId === fromId))) {
      if (!confirm("A relationship already exists between these tables. Create another?")) return;
    }

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

  const handleImportExcelSim = () => {
    if (!confirm("Import sample data? This will append to your current schema.")) return;
    
    const sampleTables: Table[] = [
      {
        id: crypto.randomUUID(), name: 'users', description: 'Application users registery', color: '#3b82f6', groupIds: [groups[0].id],
        columns: [{ id: 'u1', name: 'id', isKey: true }, { id: 'u2', name: 'username', isKey: false }, { id: 'u3', name: 'email', isKey: false }],
        position: { x: 200, y: 200 }
      },
      {
        id: crypto.randomUUID(), name: 'posts', description: 'Blog posts content', color: '#ef4444', groupIds: [groups[0].id],
        columns: [{ id: 'p1', name: 'id', isKey: true }, { id: 'p2', name: 'author_id', isKey: false }, { id: 'p3', name: 'title', isKey: false }],
        position: { x: 550, y: 300 }
      }
    ];
    
    setTables(prev => [...prev, ...sampleTables]);
    alert("Sample schema imported successfully!");
  };

  const handleReset = () => {
    if (confirm("Clear all data and start over?")) {
      setTables([]);
      setRelationships([]);
      setGroups([{ id: 'default', name: 'Main Project', color: '#3b82f6' }]);
      localStorage.removeItem('sql-planner-state-v2');
    }
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ tables, groups, relationships }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognyte-schema-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans selection:bg-blue-100">
      {/* Sidebar - Group Management */}
      <Sidebar 
        groups={groups} 
        onAddGroup={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
        onEditGroup={(g) => { setEditingGroup(g); setIsGroupModalOpen(true); }}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative">
        {/* Header Toolbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-30 shadow-sm backdrop-blur-md bg-white/90">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-black bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-none">
                Cognyte
              </h1>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">SQL Architect</span>
            </div>
            
            <div className="h-10 w-[1px] bg-slate-100"></div>
            
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find tables or columns..." 
                className="pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 focus:bg-white outline-none w-72 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={handleImportExcelSim} title="Import Samples" className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-blue-600 transition-all shadow-none hover:shadow-sm"><Upload className="w-4.5 h-4.5" /></button>
               <button onClick={handleExportJSON} title="Export Schema" className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 transition-all shadow-none hover:shadow-sm"><Download className="w-4.5 h-4.5" /></button>
               <button onClick={handleReset} title="Reset Workspace" className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-red-500 transition-all shadow-none hover:shadow-sm"><RefreshCcw className="w-4.5 h-4.5" /></button>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
            
            <button 
              onClick={() => setIsRelationModalOpen(true)}
              className="flex items-center px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm"
            >
              <LinkIcon className="w-3.5 h-3.5 mr-2" />
              Relate
            </button>
            <button 
              onClick={() => { setEditingTable(null); setIsTableModalOpen(true); }}
              className="flex items-center px-6 py-2.5 bg-slate-900 text-white hover:bg-black rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Table
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <main className="flex-1 overflow-hidden relative canvas-grid bg-slate-50/50">
          <Canvas 
            tables={tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.columns.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())))}
            groups={groups}
            relationships={relationships}
            zoom={zoom}
            setTables={setTables}
            onEditTable={(t) => { setEditingTable(t); setIsTableModalOpen(true); }}
            onDeleteTable={handleDeleteTable}
            onDeleteRelation={handleDeleteRelation}
          />

          {/* Zoom Overlay */}
          <div className="absolute bottom-10 right-10 flex flex-col space-y-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 p-2 z-30">
            <button 
              onClick={() => setZoom(z => Math.min(z + 0.1, 2))} 
              className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl text-slate-600 transition-all shadow-sm active:scale-90"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="text-center text-[10px] font-black text-slate-400 select-none py-1 border-y border-slate-100">
              {Math.round(zoom * 100)}%
            </div>
            <button 
              onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} 
              className="p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl text-slate-600 transition-all shadow-sm active:scale-90"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
          
          {/* Empty State Hint */}
          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500 shadow-inner">
                  <Database className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-700">Empty Schema</h3>
                  <p className="text-slate-400 text-sm">Click 'Add Table' to start designing your database.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
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
