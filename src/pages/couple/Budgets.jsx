import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import AlertModal from '../../components/ui/AlertModal';
import { useWedding } from '../../context/WeddingContext';
import { budgetService } from '../../services/budgets';
import { bookingService } from '../../services/bookings';
import { DollarSign, Plus, Edit2, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';

const Budgets = () => {
  const { wedding, loading: weddingLoading } = useWedding();
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ estimated: 0, actual: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    category: 'venue', estimatedCost: '', actualCost: '', notes: '',
  });

  useEffect(() => {
    if (!weddingLoading && wedding) {
      fetchBudgets();
    } else if (!weddingLoading && !wedding) {
      setLoading(false);
    }
  }, [wedding, weddingLoading]);

  const fetchBudgets = async () => {
    if (!wedding) return;
    try {
      setLoading(true);
      const res = await budgetService.getBudgets(wedding._id);
      const list = res.budgets || [];
      const summary = res.summary || {};
      
      setItems(list);
      setTotals({
        estimated: summary.totalEstimated || 0,
        actual: summary.totalActual || 0,
        remaining: summary.totalEstimated - summary.totalActual || 0
      });
    } catch (err) {
      setItems([]);
      setTotals({ estimated: 0, actual: 0, remaining: 0 });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    const titles = { success: '✓ Success', error: '✗ Error', warning: '⚠ Warning', info: 'ℹ Info' };
    setAlertModal({ isOpen: true, type, title: titles[type] || 'Notice', message: text });
  };

  const resetForm = () => {
    setFormData({ category: 'venue', estimatedCost: '', actualCost: '', notes: '', });
    setEditing(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wedding) { showMessage('error', 'Please select a wedding first'); return; }
    const payload = {
      category: formData.category,
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
      actualCost: parseFloat(formData.actualCost) || 0,
      notes: formData.notes || ''
    };

    try {
      if (editing) {
        await budgetService.updateBudget(editing._id, payload);
        showMessage('success', 'Budget item updated');
      } else {
        await budgetService.createBudget(payload, wedding._id);
        showMessage('success', 'Budget item added');
      }
      resetForm();
      fetchBudgets();
    } catch (err) {
      showMessage('error', 'Failed to save budget item');
    }
  };

  const handleDelete = async (id) => { setDeleteConfirm({ isOpen: true, id }); };

  const confirmDelete = async () => {
    try {
      await budgetService.deleteBudget(deleteConfirm.id);
      showMessage('success', 'Budget item deleted');
      fetchBudgets();
    } catch {
      showMessage('error', 'Failed to delete budget item');
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const categories = ['venue','catering','photography','decoration','makeup','entertainment','transportation','invitations','favors','other'];

  if (loading || weddingLoading) return <div className="min-h-screen bg-rose-50 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div></div>;

  if (!wedding) {
    return (
      <div className="min-h-screen bg-rose-50 text-slate-600">
        <Header />
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-rose-100">
            <DollarSign className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-3 text-slate-800">No Wedding Selected</h2>
            <p className="text-slate-500 mb-6">Please select a wedding from the header to manage budget.</p>
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
               Budget Tracker
            </h1>
            <p className="text-slate-500">Manage your wedding expenses.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  const data = await bookingService.syncBudget();
                  if (data.success) {
                    showMessage('success', `Synced ${data.syncedCount} confirmed bookings to budget!`);
                    fetchBudgets();
                  } else {
                    showMessage('error', 'Failed to sync bookings');
                  }
                } catch (err) {
                  showMessage('error', err.response?.data?.message || 'Failed to sync bookings');
                }
              }}
              className="flex items-center gap-2 bg-white hover:bg-rose-50 text-slate-600 px-4 py-3 rounded-xl font-bold transition-all border border-rose-200 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Sync Bookings
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-200"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Main Budget Alert */}
        {wedding?.totalBudget > 0 && totals.actual > wedding.totalBudget && (
          <div 
            onClick={() => setAlertModal({
              isOpen: true,
              type: 'error',
              title: '⚠️ Total Budget Exceeded!',
              message: `You have spent ₹${totals.actual.toLocaleString()}, which is ₹${(totals.actual - wedding.totalBudget).toLocaleString()} over your limit of ₹${wedding.totalBudget.toLocaleString()}.`
            })}
            className="bg-white border-l-4 border-rose-500 p-6 rounded-r-xl flex items-start gap-4 cursor-pointer hover:shadow-md transition-all shadow-sm"
          >
            <AlertTriangle className="w-8 h-8 text-rose-500 mt-1" />
            <div>
              <h4 className="text-xl font-bold text-rose-600">Total Budget Exceeded!</h4>
              <p className="text-rose-500 mt-1">
                Click to view details • <strong>₹{(totals.actual - wedding.totalBudget).toLocaleString()}</strong> over budget
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {wedding?.totalBudget > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
               <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Budget</p>
               <p className="text-2xl font-bold text-rose-500">₹{wedding.totalBudget?.toLocaleString()}</p>
            </div>
          )}
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Estimated Cost</p>
             <p className="text-2xl font-bold text-slate-800">₹{totals.estimated?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Actual Spent</p>
             <p className="text-2xl font-bold text-slate-600">₹{totals.actual?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-full h-1 ${wedding?.totalBudget > 0 && totals.actual > wedding.totalBudget ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Remaining</p>
             <p className={`text-2xl font-bold ${wedding?.totalBudget > 0 && totals.actual > wedding.totalBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                ₹{wedding?.totalBudget > 0 ? Math.abs(wedding.totalBudget - totals.actual)?.toLocaleString() : totals.remaining?.toLocaleString() || 0}
             </p>
          </div>
        </div>

        {/* Budget List */}
        <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-sm">
          {items.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-dashed border-rose-200 m-4 rounded-xl">
              No budget items yet. Add one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-rose-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="p-5">Category</th>
                    <th className="p-5">Description</th>
                    <th className="p-5">Planned</th>
                    <th className="p-5">Actual</th>
                    <th className="p-5">Diff</th>
                    <th className="p-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {items.map((item) => {
                    const diff = (item.actualCost || 0) - (item.estimatedCost || 0);
                    return (
                      <tr key={item._id} className="hover:bg-rose-50/50 transition-colors">
                        <td className="p-5">
                          <span className="px-3 py-1 rounded bg-white text-slate-600 text-xs font-bold uppercase border border-rose-200 shadow-sm">
                             {item.category}
                          </span>
                        </td>
                        <td className="p-5 font-medium text-slate-700">
                          {item.notes && <p className="text-sm text-slate-500">{item.notes}</p>}
                        </td>
                        <td className="p-5 text-slate-600">₹{item.estimatedCost?.toLocaleString()}</td>
                        <td className="p-5 text-slate-600">₹{item.actualCost?.toLocaleString()}</td>
                        <td className="p-5">
                          <span className={`font-bold ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}₹${Math.abs(diff).toLocaleString()}`}
                          </span>
                        </td>
                        <td className="p-5 flex gap-2">
                           <button onClick={() => { setEditing(item); setFormData({ category: item.category, estimatedCost: item.estimatedCost, actualCost: item.actualCost, notes: item.notes }); setShowModal(true); }} className="p-2 bg-white text-slate-500 rounded border border-rose-100 hover:bg-rose-50"><Edit2 className="w-4 h-4"/></button>
                           <button onClick={() => handleDelete(item._id)} className="p-2 bg-white text-rose-500 rounded border border-rose-100 hover:bg-rose-50"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl w-full max-w-md p-6 border border-rose-200 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-rose-900">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
                <button onClick={resetForm}><X className="w-6 h-6 text-rose-400 hover:text-rose-600"/></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-rose-700 uppercase">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 mt-1 bg-white/80 border border-rose-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500">
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-rose-700 uppercase">Estimated (₹)</label>
                     <input type="number" value={formData.estimatedCost} onChange={e => setFormData({ ...formData, estimatedCost: e.target.value })} className="w-full p-3 mt-1 bg-white/80 border border-rose-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500" required/>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-rose-700 uppercase">Actual (₹)</label>
                     <input type="number" value={formData.actualCost} onChange={e => setFormData({ ...formData, actualCost: e.target.value })} className="w-full p-3 mt-1 bg-white/80 border border-rose-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"/>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-rose-700 uppercase">Notes</label>
                   <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full p-3 mt-1 bg-white/80 border border-rose-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" placeholder="Description or notes"/>
                </div>
                <button type="submit" className="w-full py-3 bg-rose-500 text-black font-bold rounded-xl hover:bg-rose-600 mt-4 shadow-lg shadow-rose-200">
                   {editing ? 'Update Expense' : 'Add Expense'}
                </button>
              </form>
            </div>
          </div>
        )}

        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
        />

        <AlertModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          type="warning"
          title="⚠️ Confirm Delete"
          message="Are you sure you want to delete this budget item? This action cannot be undone."
          confirmText="Delete"
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
};

export default Budgets;