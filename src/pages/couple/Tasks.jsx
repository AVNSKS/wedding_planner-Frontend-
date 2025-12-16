import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AlertModal from '../../components/ui/AlertModal';
import { useWedding } from '../../context/WeddingContext';
import { taskService } from '../../services/tasks';
import { 
  CheckCircle, Clock, Plus, Edit2, Trash2, 
  Search, Filter, CheckSquare, Square, X 
} from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();
  const { wedding, loading: weddingLoading } = useWedding();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    title: '', description: '', dueDate: '', category: 'custom',
  });

  useEffect(() => {
    if (!weddingLoading && wedding) {
      fetchTasks();
    } else if (!weddingLoading && !wedding) {
      setLoading(false);
    }
  }, [wedding, weddingLoading]);

  const fetchTasks = async () => {
    if (!wedding) return;
    try {
      setLoading(true);
      const response = await taskService.getTasks(wedding._id);
      const tasksData = response.tasks || [];
      setTasks(tasksData);
      
      const statsData = response.summary || {
        total: tasksData.length,
        completed: tasksData.filter(t => t.status === 'completed').length,
        pending: tasksData.filter(t => t.status === 'pending').length
      };
      setStats(statsData);
    } catch (error) {
      setTasks([]);
      setStats({ total: 0, completed: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    const titles = { success: '✓ Success', error: '✗ Error' };
    setAlertModal({ isOpen: true, type, title: titles[type] || 'Notice', message: text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wedding) { showMessage('error', 'Please select a wedding first'); return; }
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, formData);
        showMessage('success', 'Task updated successfully!');
      } else {
        await taskService.createTask(formData, wedding._id);
        showMessage('success', 'Task created successfully!');
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleToggleStatus = async (taskId, isCurrentlyCompleted) => {
    try {
      const newCompletedStatus = !isCurrentlyCompleted;
      await taskService.updateTask(taskId, { isCompleted: newCompletedStatus });
      fetchTasks(); 
      showMessage('success', `Task marked as ${newCompletedStatus ? 'completed' : 'pending'}`);
    } catch (error) {
      showMessage('error', 'Failed to update task status');
    }
  };

  const handleDelete = (taskId) => { setDeleteConfirm({ isOpen: true, id: taskId }); };

  const confirmDelete = async () => {
    try {
      await taskService.deleteTask(deleteConfirm.id);
      showMessage('success', 'Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      showMessage('error', 'Failed to delete task');
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', dueDate: '', category: 'custom', });
    setEditingTask(null);
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const taskStatus = task.isCompleted ? 'completed' : 'pending';
    const matchesStatus = filterStatus === 'all' || taskStatus === filterStatus;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: '6-months-before', label: '6 Months Before' },
    { value: '3-months-before', label: '3 Months Before' },
    { value: '1-month-before', label: '1 Month Before' },
    { value: '1-week-before', label: '1 Week Before' },
    { value: 'wedding-day', label: 'Wedding Day' },
    { value: 'custom', label: 'Custom' }
  ];

  if (loading || weddingLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-rose-50 text-slate-600">
        <Header />
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-rose-100">
            <CheckCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-3 text-slate-800">No Wedding Selected</h2>
            <p className="text-slate-500 mb-6">Please select a wedding from the header to manage tasks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 text-slate-600">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-rose-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2 flex items-center gap-3">
              Checklist & Tasks
            </h1>
            <p className="text-slate-500">Stay organized with your wedding checklist</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-200"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Completed</p>
            <p className="text-3xl font-bold text-emerald-500">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Pending</p>
            <p className="text-3xl font-bold text-rose-500">{stats.pending}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-12 p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full lg:w-48 pl-12 pr-4 p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full lg:w-48 pl-12 pr-4 p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
             <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-rose-200 border-dashed">
                {loading ? 'Loading tasks...' : 'No tasks found.'}
             </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-rose-100 hover:border-rose-300 transition-all shadow-sm">
                  <button onClick={() => handleToggleStatus(task._id, task.isCompleted)}>
                    {task.isCompleted ? 
                      <CheckSquare className="w-6 h-6 text-emerald-500" /> : 
                      <Square className="w-6 h-6 text-slate-300 hover:text-rose-500 transition-colors" />
                    }
                  </button>
                  
                  <div className="flex-1">
                    <div className={`font-medium text-lg ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                       {task.dueDate && (
                         <span className="text-xs text-slate-400 flex items-center gap-1">
                           <Clock className="w-3 h-3"/> {new Date(task.dueDate).toLocaleDateString()}
                         </span>
                       )}
                       <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-slate-500 capitalize border border-rose-100">
                         {task.category?.replace(/-/g, ' ')}
                       </span>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setFormData({
                          title: task.title,
                          description: task.description || '',
                          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                          category: task.category || 'custom',
                        });
                        setShowAddModal(true);
                      }}
                      className="p-2 bg-white text-slate-500 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 bg-white text-rose-500 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Title *</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-white border border-rose-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option value="custom">Custom</option>
                  <option value="6-months-before">6 Months Before</option>
                  <option value="3-months-before">3 Months Before</option>
                  <option value="1-month-before">1 Month Before</option>
                  <option value="1-week-before">1 Week Before</option>
                  <option value="wedding-day">Wedding Day</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-rose-100 mt-6">
                <button type="button" onClick={resetForm} className="flex-1 py-3 border border-rose-200 text-slate-500 font-bold rounded-xl hover:bg-rose-50 hover:text-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200">
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} type={alertModal.type} title={alertModal.title} message={alertModal.message} />
      <AlertModal isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, id: null })} type="warning" title="⚠️ Delete Task" message="Are you sure you want to delete this task? This action cannot be undone." confirmText="Delete" onConfirm={confirmDelete} />
    </div>
  );
};

export default Tasks;