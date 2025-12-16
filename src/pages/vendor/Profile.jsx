import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import { vendorService } from '../../services/vendors';
import { motion } from 'framer-motion';
import { 
  Store, CheckCircle, AlertCircle, MapPin, 
  Star, Trash2, Edit2, Save, X, Globe, Phone, Mail 
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const containerVar = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
};

// --- REUSABLE BENTO CARD ---
const BentoCard = ({ children, className = "" }) => (
  <motion.div
    variants={itemVar}
    className={`bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

// Helper Input - defined outside component to prevent re-creation
const FancyInput = ({ label, ...props }) => (
  <div className="group">
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">{label}</label>
    <input 
      {...props} 
      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm" 
    />
  </div>
);

const VendorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    businessName: '', category: 'photographer', description: '', services: '', location: '', city: '', minPrice: '', maxPrice: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        console.log('Loading vendor profile...');
        const res = await vendorService.getMyProfile();
        console.log('Profile response:', res);
        const vendorData = res.vendor || res;
        if (vendorData && vendorData._id) {
          console.log('Profile found:', vendorData);
          setProfile(vendorData);
          setFormData({
            businessName: vendorData.businessName || '',
            category: vendorData.category || 'photographer',
            description: vendorData.description || '',
            services: Array.isArray(vendorData.services) ? vendorData.services.join(', ') : '',
            location: vendorData.location || '',
            city: vendorData.city || '',
            minPrice: vendorData.priceRange?.min || '',
            maxPrice: vendorData.priceRange?.max || '',
          });
          setIsEditing(false);
        } else {
          console.log('No profile found, showing create form');
          setIsEditing(true);
        }
      } catch (err) {
        console.log('Error loading profile:', err);
        console.log('Showing create form due to error');
        setIsEditing(true);
      }
    };
    load();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const servicesArray = formData.services ? formData.services.split(',').map(s => s.trim()).filter(s => s) : [];
      const payload = {
        businessName: formData.businessName,
        category: formData.category,
        description: formData.description,
        services: servicesArray,
        location: formData.location,
        city: formData.city,
        priceRange: { min: Number(formData.minPrice) || 0, max: Number(formData.maxPrice) || 0 }
      };
      
      let res;
      if (profile?._id) res = await vendorService.updateVendor(profile._id, payload);
      else res = await vendorService.createVendor(payload);
      
      setProfile(res.vendor || res);
      setIsEditing(false);
      showMessage('success', 'Profile saved successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative selection:bg-teal-100">
      <Header />
      
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-teal-400/10 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[100px] mix-blend-multiply" />
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Business Profile
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your public listing appearance.</p>
          </div>
          {profile && !isEditing && (
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                console.log('Edit button clicked! Current isEditing:', isEditing);
                setIsEditing(true);
                console.log('Set isEditing to true');
              }} className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-black font-bold rounded-full shadow-lg hover:bg-teal-500 transition-all">
                <Edit2 className="w-4 h-4"/> Edit Profile
              </motion.button>
            </div>
          )}
        </div>

        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${message.type==='success'?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {message.type==='success'?<CheckCircle className="w-5 h-5"/>:<AlertCircle className="w-5 h-5"/>}<span>{message.text}</span>
          </motion.div>
        )}

        {/* Debug info */}
        {console.log('Render - profile exists:', !!profile, 'isEditing:', isEditing)}
        
        {/* VIEW MODE: BENTO LAYOUT */}
        {profile && !isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Main Identity Card */}
            <BentoCard className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
               <div className="absolute top-0 right-0 p-32 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none"></div>
               <div className="p-8 relative z-10 h-full flex flex-col justify-between min-h-[300px]">
                  <div className="flex justify-between items-start">
                     <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                        <Store className="w-8 h-8 text-teal-300" />
                     </div>
                     <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-teal-300">
                        {profile.category}
                     </span>
                  </div>
                  <div>
                     <h2 className="text-4xl font-bold mb-2">{profile.businessName}</h2>
                     <div className="flex items-center gap-4 text-slate-300">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-teal-400"/> {profile.city}</span>
                        {profile.ratingAverage > 0 && <span className="flex items-center gap-1 text-amber-400"><Star className="w-4 h-4 fill-current"/> {profile.ratingAverage.toFixed(1)}</span>}
                     </div>
                  </div>
               </div>
            </BentoCard>

            {/* 2. Contact & Price Card */}
            <BentoCard className="p-8 flex flex-col justify-center space-y-6">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pricing</p>
                   <p className="text-3xl font-bold text-slate-800">₹{profile.priceRange?.min?.toLocaleString()}</p>
                   <p className="text-sm text-slate-500">Starting price</p>
                </div>
                <div className="h-px w-full bg-slate-100"></div>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg"><Globe className="w-4 h-4 text-teal-600"/></div>
                      <span className="text-sm font-medium">{profile.location}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-lg"><Phone className="w-4 h-4 text-teal-600"/></div>
                      <span className="text-sm font-medium">Contact Visible</span>
                   </div>
                </div>
            </BentoCard>

            {/* 3. About & Services Card */}
            <BentoCard className="md:col-span-3 p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-teal-500 rounded-full"></div> About Us
                     </h3>
                     <p className="text-slate-600 leading-relaxed text-lg">{profile.description}</p>
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded-full"></div> Our Services
                     </h3>
                     <div className="flex flex-wrap gap-2">
                        {profile.services?.map((s,i) => (
                           <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium border border-slate-100 shadow-sm hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors cursor-default">
                              {s}
                           </span>
                        ))}
                     </div>
                  </div>
               </div>
            </BentoCard>

          </div>
        ) : (
          /* EDIT MODE: ANIMATED FORM */
          <BentoCard className="p-8 md:p-12">
             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FancyInput label="Business Name *" value={formData.businessName} onChange={e=>setFormData({...formData, businessName:e.target.value})} required placeholder="e.g. Dream Photography"/>
                   <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">Category *</label>
                      <select value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm">
                         {['venue','caterer','photographer','decorator','makeup','dj','transportation','other'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                      </select>
                   </div>
                </div>
                
                <div className="group">
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 group-focus-within:text-teal-600 transition-colors">Description</label>
                   <textarea rows={4} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm resize-none" placeholder="Tell couples about your unique style and offerings..."/>
                </div>

                <FancyInput label="Services (Comma separated)" value={formData.services} onChange={e=>setFormData({...formData, services:e.target.value})} placeholder="Wedding shoots, Pre-wedding, Drone, Albums..."/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FancyInput label="Address" value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})} />
                   <FancyInput label="City" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                   <FancyInput label="Min Price (₹)" type="number" value={formData.minPrice} onChange={e=>setFormData({...formData, minPrice:e.target.value})} />
                   <FancyInput label="Max Price (₹)" type="number" value={formData.maxPrice} onChange={e=>setFormData({...formData, maxPrice:e.target.value})} />
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                   {profile && (
                     <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={()=>setIsEditing(false)} className="px-8 py-3 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        Cancel
                     </motion.button>
                   )}
                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={saving} className="px-10 py-3 bg-teal-600 text-black font-bold rounded-xl shadow-lg hover:bg-teal-500 transition-all flex items-center gap-2">
                      {saving ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : <><Save className="w-5 h-5"/> Save Profile</>}
                   </motion.button>
                </div>
             </form>
          </BentoCard>
        )}
      </div>
    </div>
  );
};



export default VendorProfile;