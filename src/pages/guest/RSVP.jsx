import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { guestService } from "../../services/guests";
import {
  Heart, Calendar, MapPin, Mail, Phone, Users,
  CheckCircle, XCircle, Clock, AlertCircle, Loader2
} from "lucide-react";

const GuestRSVP = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null); // Initialize as null
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    rsvpStatus: "",
    attendeesCount: 1,
    dietaryPreferences: [],
    allergies: "",
    customResponses: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await guestService.getRsvp(token);
        setData(response);
        // Pre-fill form if guest already responded
        if (response?.guest?.rsvpStatus) {
          setFormData({
            rsvpStatus: response.guest.rsvpStatus,
            attendeesCount: response.guest.attendeesCount || 1,
            dietaryPreferences: response.guest.dietaryPreferences || [],
            allergies: response.guest.allergies || "",
            customResponses: response.guest.customResponses || "",
          });
        }
      } catch (err) {
        setError("Invalid or expired RSVP link.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rsvpStatus) { setError("Please select your RSVP status"); return; }
    setSubmitting(true); setError("");
    try {
      await guestService.submitRsvp(token, formData);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Safety: If no data loaded or critical error
  if (!data || error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-slate-400">{error || "Invitation data could not be loaded."}</p>
        </div>
      </div>
    );
  }

  const { guest, wedding } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Simple Header */}
        <div className="text-center mb-8">
           <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-500">
             RSVP Response
           </span>
        </div>

        {/* Success View */}
        {success ? (
          <div className="bg-slate-900 border border-green-500/30 rounded-3xl p-10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-white mb-2">You're All Set!</h3>
            <p className="text-slate-400 mb-6">
              Thank you for your response, <strong>{guest?.name}</strong>.
            </p>
            {formData.rsvpStatus === 'confirmed' && (
               <p className="text-amber-500 font-medium">We can't wait to celebrate with you!</p>
            )}
          </div>
        ) : (
          <>
            {/* Wedding Header Card */}
            {wedding && (
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 mb-8 text-center shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-950 rounded-full mb-4 border border-slate-800 text-amber-500">
                    <Heart className="w-8 h-8 fill-amber-500" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-white mb-2">
                    {wedding.brideName} <span className="text-amber-500">&</span> {wedding.groomName}
                </h1>
                <p className="text-slate-400 mb-6">invite you to celebrate their wedding</p>
                
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 text-slate-300">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString() : 'Date TBD'}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 text-slate-300">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        {wedding.city || 'City TBD'}
                    </div>
                </div>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Hi {guest?.name}, will you attend?</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* RSVP Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: "confirmed", label: "Joyfully Accept", icon: CheckCircle, activeClass: "border-green-500 bg-green-500/20 text-green-400 shadow-lg shadow-green-500/30 scale-105" },
                    { value: "declined", label: "Regretfully Decline", icon: XCircle, activeClass: "border-rose-500 bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/30 scale-105" },
                    { value: "maybe", label: "Maybe", icon: Clock, activeClass: "border-amber-500 bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/30 scale-105" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rsvpStatus: option.value }))}
                      className={`p-4 rounded-xl border-[3px] transition-all duration-200 flex flex-col items-center justify-center gap-2 h-32 relative
                        ${formData.rsvpStatus === option.value 
                          ? option.activeClass 
                          : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-600 hover:text-slate-300 hover:scale-102"
                        }`}
                    >
                      {formData.rsvpStatus === option.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                      <option.icon className="w-8 h-8" />
                      <span className="text-sm font-bold">{option.label}</span>
                    </button>
                  ))}
                </div>

                {/* Additional Fields (Only if Confirmed) */}
                {formData.rsvpStatus === "confirmed" && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                    
                    {guest?.plusOneAllowed && (
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Guests</label>
                        <div className="relative">
                           <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                           <input
                             type="number"
                             name="attendeesCount"
                             value={formData.attendeesCount}
                             onChange={handleChange}
                             min="1"
                             max="5"
                             className="w-full pl-12 p-4 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                           />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Dietary Preferences</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free'].map((pref) => (
                          <label key={pref} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.dietaryPreferences.includes(pref.toLowerCase()) ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={formData.dietaryPreferences.includes(pref.toLowerCase())}
                              onChange={(e) => {
                                const val = pref.toLowerCase();
                                setFormData(prev => ({
                                  ...prev,
                                  dietaryPreferences: e.target.checked 
                                    ? [...prev.dietaryPreferences, val]
                                    : prev.dietaryPreferences.filter(p => p !== val)
                                }));
                              }}
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.dietaryPreferences.includes(pref.toLowerCase()) ? 'border-amber-500 bg-amber-500' : 'border-slate-600'}`}>
                               {formData.dietaryPreferences.includes(pref.toLowerCase()) && <CheckCircle className="w-3 h-3 text-slate-900"/>}
                            </div>
                            <span className="text-sm font-medium">{pref}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Message for Couple</label>
                       <textarea
                         name="customResponses"
                         value={formData.customResponses}
                         onChange={handleChange}
                         rows="3"
                         placeholder="Share your excitement or any special requests..."
                         className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                       />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {submitting ? "Sending..." : "Submit Response"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuestRSVP;