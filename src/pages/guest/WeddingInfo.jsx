import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { guestService } from '../../services/guests';
import { Calendar, MapPin, Clock, Heart, ArrowRight, Loader2 } from 'lucide-react';

const WeddingInfo = () => {
  const { token } = useParams();
  const [data, setData] = useState(null); // Start as null to detect initial load
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await guestService.getRsvp(token);
        setData(res); // Store the whole response
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Safety check: If data or wedding is missing after loading
  if (error || !data || !data.wedding) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-slate-400">
        <p>Invalid or expired invitation link.</p>
      </div>
    );
  }

  const { wedding, events } = data;

  // Calculate Days to Go
  const daysToGo = wedding.weddingDate 
    ? Math.ceil((new Date(wedding.weddingDate) - new Date()) / (1000 * 60 * 60 * 24)) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 pb-12">
      
      {/* Simple Guest Navbar */}
      <div className="w-full py-6 text-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-500">
          Wedding Invitation
        </span>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8 mt-4">
        
        {/* HERO CARD */}
        <div className="relative bg-slate-900 rounded-3xl p-8 lg:p-12 overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-amber-500 mb-4 text-xs font-bold tracking-[0.2em] uppercase border border-amber-500/20 px-3 py-1 rounded-full">
                <Heart className="w-3 h-3 fill-amber-500" /> Save The Date
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                {wedding.brideName} <span className="text-amber-500 font-serif italic">&</span> {wedding.groomName}
              </h1>
              
              <div className="flex flex-col md:flex-row items-center gap-4 text-slate-400 font-medium text-lg justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-300">
                    {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                  </span>
                </div>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <span className="text-slate-300">{wedding.city || 'City TBD'}</span>
                </div>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center min-w-[160px] shadow-xl">
              <div className="text-5xl font-serif font-bold text-white mb-1">
                {daysToGo > 0 ? daysToGo : 0}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Days To Go
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Link 
            to={`/rsvp/${token}`}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-amber-900/20 transform hover:-translate-y-1"
          >
            RSVP Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Schedule / Events */}
        {events && events.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-serif font-bold text-white mb-6">Wedding Events</h2>
            <div className="grid gap-4">
              {events.map(ev => (
                <div key={ev._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-amber-500/30 transition-colors">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-1">{ev.name}</h3>
                    {ev.venue && (
                      <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-500" /> {ev.venue}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-1 text-sm text-amber-500 font-medium">
                    {ev.date && (
                      <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                        <Calendar className="w-4 h-4" />
                        {new Date(ev.date).toLocaleDateString()}
                      </div>
                    )}
                    {(ev.startTime || ev.endTime) && (
                      <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 mt-2">
                        <Clock className="w-4 h-4" />
                        {ev.startTime} {ev.endTime && `- ${ev.endTime}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-slate-600 text-sm pt-8 pb-4">
          #{wedding.hashtag || `Wedding${new Date().getFullYear()}`}
        </div>

      </div>
    </div>
  );
};

export default WeddingInfo;