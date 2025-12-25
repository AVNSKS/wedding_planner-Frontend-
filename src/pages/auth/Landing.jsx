import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Calendar, Users, DollarSign, CheckCircle, 
  ArrowRight, Star, TrendingUp, Shield, Zap, 
  MessageCircle, LayoutDashboard, Menu, X
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// --- COMPONENTS ---

// 1. Feature Bento Card
const BentoCard = ({ title, desc, icon: Icon, className, color }) => (
  <motion.div 
    variants={fadeUp}
    whileHover={{ y: -5 }}
    className={`p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 relative overflow-hidden group ${className}`}
  >
    <div className={`absolute top-0 right-0 p-32 rounded-full opacity-10 blur-3xl -mr-16 -mt-16 transition-all group-hover:opacity-20 ${color}`}></div>
    <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${color} bg-opacity-10 text-slate-800`}>
       <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{title}</h3>
    <p className="text-slate-500 leading-relaxed relative z-10">{desc}</p>
  </motion.div>
);

// 2. Step Card
const StepCard = ({ number, title, desc }) => (
  <div className="flex gap-6 items-start">
    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-serif font-bold text-xl shrink-0">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500 p-2 rounded-xl text-white shadow-lg shadow-rose-500/30">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight">WedVow</span>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-rose-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-rose-500 transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-rose-500 transition-colors">Stories</a>
          </div>

          <div className="flex gap-4">
            <Link to="/login" className="hidden md:block px-6 py-2.5 font-bold text-slate-600 hover:text-rose-500 transition-colors">
              Login
            </Link>
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-slate-900 text-back font-bold rounded-full shadow-lg hover:bg-rose-500 hover:shadow-rose-500/30 transition-all"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
        {/* Background Mesh Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-rose-50/50 to-white rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden" animate="visible" variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider mb-8">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              The All-in-One Wedding OS
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-6xl lg:text-8xl font-serif font-bold text-slate-900 leading-[1.1] mb-6">
              Plan the <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">perfect</span> <br/> celebration.
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Goodbye spreadsheets. Hello sanity. Manage your budget, guests, vendors, and timeline in one beautiful workspace.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link to="/register?role=couple">
                <button className="w-full sm:w-auto px-8 py-4 bg-rose-500 text-slate-900 font-bold rounded-2xl shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 text-lg">
                  Start Planning Free <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/register?role=vendor">
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold rounded-2xl hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-2 text-lg">
                  I'm a Vendor
                </button>
              </Link>
            </motion.div>
            
            <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm font-bold text-slate-400">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                     </div>
                  ))}
               </div>
               <p>Trusted by 2,000+ couples</p>
            </motion.div>
          </motion.div>

          {/* HERO IMAGE: 3D Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
             <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000" 
                  alt="Wedding Dashboard" 
                  className="rounded-2xl w-full h-auto object-cover opacity-90"
                />
                
                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-12 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4"
                >
                   <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500"><Heart className="w-6 h-6 fill-current"/></div>
                   <div>
                      <p className="font-bold text-slate-900">24 Days Left!</p>
                      <p className="text-xs text-slate-500">Excitement is building</p>
                   </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -right-8 bottom-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]"
                >
                   <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">Budget</span>
                      <span className="text-xs font-bold text-emerald-500">On Track</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 w-[75%] h-full rounded-full"></div>
                   </div>
                </motion.div>
             </div>
             
             {/* Decorative blob behind image */}
             <div className="absolute top-10 right-10 w-full h-full bg-rose-500/10 rounded-3xl -z-10 transform rotate-6 scale-95"></div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES BENTO GRID --- */}
      <section id="features" className="py-24 px-6 bg-slate-50 relative">
         {/* Dot Pattern Background */}
         <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
         
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
               <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6">Everything you need <br/> to say "I Do"</h2>
               <p className="text-xl text-slate-500 max-w-2xl mx-auto">We've packed powerful professional tools into a simple interface designed for couples.</p>
            </div>

            <motion.div 
               initial="hidden" 
               whileInView="visible" 
               viewport={{ once: true, margin: "-100px" }} 
               variants={stagger}
               className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
               {/* Large Card 1 */}
               <BentoCard 
                  className="md:col-span-2 bg-gradient-to-br from-white to-rose-50/50"
                  color="bg-rose-500"
                  icon={Users}
                  title="Guest List Manager"
                  desc="Import contacts, track RSVPs in real-time, assign table seating, and manage dietary requirements all in one place. No more lost paper invites."
               />
               
               {/* Tall Card 2 */}
               <BentoCard 
                  className="md:row-span-2 bg-white"
                  color="bg-emerald-500"
                  icon={DollarSign}
                  title="Smart Budgeter"
                  desc="Set your total budget and we'll help you allocate it. Track payments, due dates, and unexpected costs so you never overspend."
               />

               {/* Standard Card 3 */}
               <BentoCard 
                  color="bg-purple-500"
                  icon={CheckCircle}
                  title="Task Checklist"
                  desc="A pre-loaded timeline of to-dos based on your wedding date. We tell you exactly what to do and when."
               />

               {/* Wide Card 4 */}
               <BentoCard 
                  className="md:col-span-2 bg-slate-900 border-slate-800"
                  color="bg-teal-500"
                  icon={Zap}
                  title={<span className="text-white">Vendor Marketplace</span>}
                  desc={<span className="text-slate-400">Browse top-rated photographers, venues, and caterers. Compare quotes, chat directly, and book securely through the platform.</span>}
               />
            </motion.div>
         </div>
      </section>

      {/* --- HOW IT WORKS (Split) --- */}
      <section id="how-it-works" className="py-24 px-6 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-4xl font-serif font-bold text-slate-900 mb-12">From "Yes" to "I Do" <br/> in 3 simple steps.</h2>
               <div className="space-y-12">
                  <StepCard number="1" title="Create your Profile" desc="Set your wedding date, budget, and estimated guest count to generate your custom plan." />
                  <StepCard number="2" title="Build your Team" desc="Use our marketplace to find and book your dream venue, photographer, and florist." />
                  <StepCard number="3" title="Stay Organized" desc="Track RSVPs and payments as they happen. Relax knowing nothing is slipping through the cracks." />
               </div>
            </div>
            <div className="relative">
               <motion.div className="relative z-10">
                  <img src="https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=80&w=800" alt="Couple" className="rounded-[2.5rem] shadow-2xl" />
                  
                  {/* Floating Testimonial */}
                  <div className="absolute bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
                     <div className="flex gap-1 text-amber-400 mb-2">
                        <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                     </div>
                     <p className="text-slate-600 italic text-sm">"WedVow saved our sanity. I can't imagine planning without it!"</p>
                     <p className="text-slate-900 font-bold text-xs mt-2">— Sarah & Mike</p>
                  </div>
               </motion.div>
               {/* Decor */}
               <div className="absolute top-10 -right-10 w-full h-full bg-slate-100 rounded-[2.5rem] -z-10"></div>
            </div>
         </div>
      </section>

      {/* --- FOR VENDORS --- */}
      <section id="vendors" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h2 className="text-4xl font-serif font-bold mb-6">Are you a Wedding Pro?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">Grow your business with WedVow. Get discovered by thousands of couples, manage bookings effortlessly, and get paid faster.</p>
            
            <div className="flex justify-center gap-8 mb-12">
               <div className="text-center">
                  <h3 className="text-4xl font-bold text-teal-400">2.5x</h3>
                  <p className="text-slate-400 text-sm">More Inquiries</p>
               </div>
               <div className="w-px bg-slate-800"></div>
               <div className="text-center">
                  <h3 className="text-4xl font-bold text-teal-400">0%</h3>
                  <p className="text-slate-400 text-sm">Commission Fees</p>
               </div>
               <div className="w-px bg-slate-800"></div>
               <div className="text-center">
                  <h3 className="text-4xl font-bold text-teal-400">24/7</h3>
                  <p className="text-slate-400 text-sm">Support</p>
               </div>
            </div>

            <Link to="/register?role=vendor">
               <button className="px-10 py-4 bg-teal-600 text-slate-900 font-bold rounded-full shadow-lg shadow-teal-500/30 hover:bg-teal-500 transition-all text-lg">
                  Join as a Vendor
               </button>
            </Link>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <Heart className="w-5 h-5 text-rose-500 fill-current" />
               <span className="font-serif font-bold text-slate-800 text-xl">WedVow</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
               Making wedding planning simple, beautiful, and fun for everyone.
            </p>
          </div>
          
          <div>
             <h4 className="font-bold text-slate-900 mb-4">Product</h4>
             <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-rose-500">Features</a></li>
                <li><a href="#" className="hover:text-rose-500">Pricing</a></li>
                <li><a href="#" className="hover:text-rose-500">For Vendors</a></li>
             </ul>
          </div>
          
          <div>
             <h4 className="font-bold text-slate-900 mb-4">Company</h4>
             <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-rose-500">About Us</a></li>
                <li><a href="#" className="hover:text-rose-500">Careers</a></li>
                <li><a href="#" className="hover:text-rose-500">Contact</a></li>
             </ul>
          </div>

          <div>
             <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
             <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-rose-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-rose-500">Terms of Service</a></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
           © 2024 WedVow Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;