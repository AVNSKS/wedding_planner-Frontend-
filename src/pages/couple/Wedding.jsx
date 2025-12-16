import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import { useWedding } from '../../context/WeddingContext';
import { weddingService } from '../../services/weddings';
import { 
  Calendar, MapPin, Hash, Home, Loader2, Save, 
  AlertCircle, Heart, DollarSign, User, PlusCircle, CheckCircle
} from 'lucide-react';

const Wedding = () => {
  const [searchParams] = useSearchParams();
  const { wedding: selectedWedding, addWedding, updateWedding: updateWeddingContext } = useWedding();
  const isCreatingNew = searchParams.get('new') === 'true';
  
  const [loading, setLoading] = useState(!isCreatingNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [weddingId, setWeddingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    city: '',
    totalBudget: '',
    theme: '',
    notes: '',
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isCreatingNew) {
      setForm(initialFormState);
      setIsEditing(false);
      setWeddingId(null);
      setLoading(false);
    } else if (selectedWedding) {
      setWeddingId(selectedWedding._id);
      setIsEditing(true);
      setForm({
        brideName: selectedWedding.brideName || '',
        groomName: selectedWedding.groomName || '',
        weddingDate: selectedWedding.weddingDate ? selectedWedding.weddingDate.slice(0, 10) : '',
        venue: selectedWedding.venue || '',
        city: selectedWedding.city || '',
        totalBudget: selectedWedding.totalBudget || '',
        theme: selectedWedding.theme || '',
        notes: selectedWedding.notes || '',
      });
      setLoading(false);
    } else {
      setForm(initialFormState);
      setIsEditing(false);
      setWeddingId(null);
      setLoading(false);
    }
  }, [selectedWedding, isCreatingNew]);

  const handleAddNew = () => {
    setWeddingId(null);
    setIsEditing(false);
    setForm(initialFormState);
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        totalBudget: Number(form.totalBudget) || 0,
      };

      let result;
      if (isEditing && weddingId) {
        result = await weddingService.updateWedding(weddingId, payload);
        const updatedWedding = result.wedding || result;
        updateWeddingContext(updatedWedding);
        setSuccess('Wedding details updated successfully!');
      } else {
        result = await weddingService.createWedding(payload);
        const newWedding = result.wedding || result;
        setWeddingId(newWedding._id);
        setIsEditing(true);
        addWedding(newWedding);
        setSuccess('New wedding profile created successfully!');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save wedding details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 text-slate-600 pb-12">
      <Header />

      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-rose-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">
              {isEditing ? 'Edit Wedding Profile' : 'Create New Wedding'}
            </h1>
            <p className="text-slate-500">
              {isEditing ? 'Update your wedding details below.' : 'Start planning by filling in the details below.'}
            </p>
          </div>
          
          {isEditing && (
            <button 
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-sm shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add New / Clear Form
            </button>
          )}
        </div>

        {/* Alerts */}
        <div className="space-y-4 mb-8">
          {error && (
            <div className="bg-white border-l-4 border-rose-500 text-rose-500 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-white border-l-4 border-emerald-500 text-emerald-600 p-4 rounded-r-xl flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium">{success}</span>
            </div>
          )}
        </div>

        {/* Main Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-rose-100 p-8 lg:p-10 relative overflow-hidden"
        >
          {/* Top colored bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Section: The Couple */}
            <div className="md:col-span-2 pb-6 border-b border-rose-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> The Happy Couple
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Bride's Name" icon={User}>
                  <InputField
                    type="text"
                    name="brideName"
                    value={form.brideName}
                    onChange={handleChange}
                    required
                    placeholder="Enter Bride's Name"
                  />
                </InputGroup>

                <InputGroup label="Groom's Name" icon={User}>
                  <InputField
                    type="text"
                    name="groomName"
                    value={form.groomName}
                    onChange={handleChange}
                    required
                    placeholder="Enter Groom's Name"
                  />
                </InputGroup>
              </div>
            </div>

            {/* Section: Date & Location */}
            <div className="md:col-span-2 pb-6 border-b border-rose-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" /> Date & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Wedding Date" icon={Calendar}>
                  <InputField
                    type="date"
                    name="weddingDate"
                    value={form.weddingDate}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup label="City" icon={MapPin}>
                  <InputField
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Mumbai, Goa"
                  />
                </InputGroup>

                <div className="md:col-span-2">
                  <InputGroup label="Venue Name" icon={Home}>
                    <InputField
                      type="text"
                      name="venue"
                      value={form.venue}
                      onChange={handleChange}
                      required
                      placeholder="e.g. The Taj Mahal Palace"
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

            {/* Section: Details */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-500" /> Budget & Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Total Budget" icon={DollarSign}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <InputField
                      type="number"
                      name="totalBudget"
                      value={form.totalBudget}
                      onChange={handleChange}
                      style={{ paddingLeft: '2rem' }}
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </InputGroup>

                <InputGroup label="Wedding Theme" icon={Hash}>
                  <InputField
                    type="text"
                    name="theme"
                    value={form.theme}
                    onChange={handleChange}
                    placeholder="e.g. Royal Traditional"
                  />
                </InputGroup>

                <div className="md:col-span-2">
                  <InputGroup label="Notes & Hashtags">
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-4 bg-white border border-rose-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all shadow-sm resize-none"
                      placeholder="Enter any special notes, hashtags, or ideas..."
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-8 border-t border-rose-100 flex flex-col md:flex-row items-center justify-end gap-4">
             {isEditing && (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full md:w-auto px-6 py-4 text-slate-500 hover:text-slate-800 font-bold bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
                >
                  Clear Form
                </button>
             )}
             
             <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-rose-500 text-black rounded-xl font-bold text-lg hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- FIX: Components moved OUTSIDE the main component ---
const InputGroup = ({ label, icon: Icon, children }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-rose-500" />} {label}
    </label>
    {children}
  </div>
);

const InputField = (props) => (
  <input 
    {...props}
    className="w-full p-4 bg-white border border-rose-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all shadow-sm"
  />
);

export default Wedding;