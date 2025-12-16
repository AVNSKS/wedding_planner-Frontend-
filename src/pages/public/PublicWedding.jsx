import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { guestService } from "../../services/guests";
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Users,
  XCircle,
} from "lucide-react";

const PublicWedding = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        setError("");
        const res = await guestService.getRsvp(token); // GET /api/guests/rsvp/:token

        if (!res || !res.wedding) {
          setError("No wedding data found for this link.");
        } else {
          setWedding(res.wedding);
          setEvents(Array.isArray(res.events) ? res.events : []);
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "This wedding link may be incorrect or has expired."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWedding();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Invitation not found
          </h2>
          <p className="text-slate-400">
            {error || "This wedding link may be incorrect or has expired."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 font-sans selection:bg-amber-500/30">
      
      {/* Optional Top Bar */}
      <div className="text-center mb-8">
         <span className="text-xs font-bold tracking-[0.3em] uppercase text-amber-500">
           Wedding Invitation
         </span>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Wedding Header Card */}
        <div className="relative bg-slate-900 rounded-3xl border border-slate-800 p-10 text-center shadow-2xl overflow-hidden">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-950 border border-slate-800 rounded-full mb-6 shadow-xl shadow-amber-900/10">
              <Heart className="w-10 h-10 text-amber-500 fill-amber-500" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-3">
              {wedding.brideName} <span className="text-amber-500 font-serif italic">&</span> {wedding.groomName}
            </h1>
            
            {wedding.hashtag && (
              <p className="text-lg text-slate-500 mb-8 font-medium">#{wedding.hashtag}</p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-300 mb-8">
              {wedding.weddingDate && (
                <div className="flex items-center gap-2 bg-slate-950 px-5 py-2.5 rounded-full border border-slate-800">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold">
                    {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              
              {(wedding.venue || wedding.city) && (
                <div className="flex items-center gap-2 bg-slate-950 px-5 py-2.5 rounded-full border border-slate-800">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold">
                    {[wedding.venue, wedding.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {wedding.googleMapsLink && (
              <a
                href={wedding.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-900/20 hover:scale-105"
              >
                View on Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Events List */}
        {events.length > 0 && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl">
            <h2 className="text-2xl font-serif font-bold text-white mb-8 flex items-center justify-center gap-3">
              <Calendar className="w-6 h-6 text-amber-500" />
              Wedding Events
            </h2>
            
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="p-6 bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-colors group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">
                      {event.eventName}
                    </h3>
                    {event.eventDate && (
                      <span className="text-sm font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 text-sm">
                    {event.eventTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        {event.eventTime}
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        {event.venue}
                      </div>
                    )}
                    {event.expectedGuests && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        {event.expectedGuests} guests
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicWedding;