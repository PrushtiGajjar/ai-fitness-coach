"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Activity, Dumbbell, MessageSquare, Target, User, BarChart2, CheckCircle2, Camera, Upload, ChevronRight, Leaf, BookOpen, Coffee, Sun, Moon, Apple, Utensils } from 'lucide-react';

const LiveWorkout = dynamic(() => import('../components/LiveWorkout'), { ssr: false });

const EXERCISE_LIBRARY: Record<string, { img: string, muscle: string, difficulty: string, instructions: string[] }> = {
  "Barbell Back Squat": { 
    muscle: "Legs / Glutes", difficulty: "Intermediate", 
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    instructions: ["Stand with feet shoulder-width apart.", "Rest barbell securely on your traps."] 
  },
  "Classic Push-Up": { 
    muscle: "Chest / Triceps", difficulty: "Beginner", 
    img: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80",
    instructions: ["Start in a high plank position.", "Lower your body until your chest nearly touches the floor."] 
  },
  "Forearm Plank": { 
    muscle: "Core", difficulty: "Beginner", 
    img: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80",
    instructions: ["Rest your weight on your forearms and toes.", "Keep your body in a perfectly straight line."] 
  },
  "Conventional Deadlift": { 
    muscle: "Back / Hamstrings", difficulty: "Advanced", 
    img: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80",
    instructions: ["Stand with mid-foot under the barbell.", "Bend over and grab the bar."] 
  },
  "Pull-Up": {
    muscle: "Back / Biceps", difficulty: "Intermediate",
    img: "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?auto=format&fit=crop&w=800&q=80",
    instructions: ["Hang from a bar with palms facing away.", "Pull yourself up until your chin clears the bar."]
  },
  "Dumbbell Lunge": {
    muscle: "Legs", difficulty: "Beginner",
    img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    instructions: ["Step forward with one leg and lower your hips.", "Both knees should be bent at a 90-degree angle."]
  }
};

const getExerciseInfo = (exName: string) => {
  // Find a match or return a default
  const key = Object.keys(EXERCISE_LIBRARY).find(k => k.toLowerCase() === exName.toLowerCase() || exName.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
  if (key) return { ...EXERCISE_LIBRARY[key], name: key };
  
  // Keyword-based fallback images
  let img = "";
  const lower = exName.toLowerCase();
  
  if (lower.includes('yoga') || lower.includes('stretch')) {
    img = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80";
  } else if (lower.includes('run') || lower.includes('jog') || lower.includes('cardio')) {
    img = "https://images.unsplash.com/photo-1530143311094-34d807799e8f?auto=format&fit=crop&w=800&q=80";
  } else if (lower.includes('squat') || lower.includes('leg')) {
    img = "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80";
  } else if (lower.includes('plank') || lower.includes('core') || lower.includes('abs')) {
    img = "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80";
  } else if (lower.includes('push') || lower.includes('press') || lower.includes('chest') || lower.includes('fly')) {
    img = "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80";
  } else if (lower.includes('curl') || lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) {
    img = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80";
  } else if (lower.includes('pull') || lower.includes('row') || lower.includes('back')) {
    img = "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?auto=format&fit=crop&w=800&q=80";
  } else if (lower.includes('deadlift')) {
    img = "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80";
  } else {
    const hashes = [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80"
    ];
    img = hashes[exName.length % hashes.length];
  }

  return {
    name: exName,
    muscle: "Full Body",
    difficulty: "Varies",
    img: img,
    instructions: ["Follow standard form.", "Keep core tight and breathe.", "Control the weight on the way down."]
  };
};

const getExerciseSuggestion = (exercise: string) => {
  const lower = exercise.toLowerCase();
  if (lower.includes('squat')) return "Focus: Keep your chest up and push through your heels.";
  if (lower.includes('push') || lower.includes('press')) return "Focus: Engage your core and control the lowering phase.";
  if (lower.includes('lunge')) return "Focus: Ensure your front knee doesn't cave inwards.";
  if (lower.includes('plank')) return "Focus: Squeeze your glutes to maintain a perfectly straight spine.";
  if (lower.includes('deadlift')) return "Focus: Keep the bar close to your shins and keep your back flat.";
  return "Focus: Maintain a strong mind-muscle connection and breathe steadily.";
};

const DIET_PLAN_NON_VEG = [
  { id: 'breakfast', time: '8:00 AM', label: 'Breakfast', icon: Coffee, meal: 'Protein Oats & Berries', cals: 450, p: 30, c: 55, f: 12, img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80' },
  { id: 'lunch', time: '1:00 PM', label: 'Lunch', icon: Sun, meal: 'Grilled Chicken Quinoa Bowl', cals: 650, p: 45, c: 60, f: 20, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
  { id: 'snack', time: '4:00 PM', label: 'Snack', icon: Apple, meal: 'Greek Yogurt & Almonds', cals: 200, p: 15, c: 10, f: 10, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80' },
  { id: 'dinner', time: '7:30 PM', label: 'Dinner', icon: Moon, meal: 'Baked Salmon & Asparagus', cals: 550, p: 40, c: 20, f: 30, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80' }
];

const DIET_PLAN_VEG = [
  { id: 'breakfast', time: '8:00 AM', label: 'Breakfast', icon: Coffee, meal: 'Avocado Toast & Scrambled Tofu', cals: 420, p: 25, c: 45, f: 18, img: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80' },
  { id: 'lunch', time: '1:00 PM', label: 'Lunch', icon: Sun, meal: 'Lentil & Chickpea Curry Bowl', cals: 600, p: 30, c: 80, f: 15, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80' },
  { id: 'snack', time: '4:00 PM', label: 'Snack', icon: Apple, meal: 'Hummus with Carrots & Cucumber', cals: 250, p: 10, c: 30, f: 12, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80' },
  { id: 'dinner', time: '7:30 PM', label: 'Dinner', icon: Moon, meal: 'Grilled Paneer & Quinoa Salad', cals: 500, p: 35, c: 40, f: 25, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' }
];

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [dietPref, setDietPref] = useState<'Non-Veg' | 'Veg'>('Non-Veg');
  const [searchQuery, setSearchQuery] = useState('');
  type ExerciseObj = { name: string, img: string, muscle: string, difficulty: string, instructions: string[] };
  const [selectedExercise, setSelectedExercise] = useState<ExerciseObj | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'analytics' | 'diet' | 'guide'>('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([
    {sender: "AI", text: "Welcome to your health dashboard. How can I help you today?"}
  ]);
  const [input, setInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dietImage, setDietImage] = useState<string | null>(null);
  const [dietScanning, setDietScanning] = useState(false);
  const [dietResult, setDietResult] = useState<any>(null);

  useEffect(() => {
    if (!profile) return;
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
    fetch(`${API_URL}/api/workout/recommendation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch plan");
      return res.json();
    })
    .then(data => setPlan(data))
    .catch(err => {
      console.error("Error fetching AI plan:", err);
      alert("Processing Failed. Please try entering your details again.");
      setProfile(null);
    });

    fetchHistory();
  }, [profile]);

  const fetchHistory = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
    fetch(`${API_URL}/api/workout/history`)
    .then(res => res.json())
    .then(data => setHistoryData(data.reverse()))
    .catch(err => console.error(err));
  };

  const handleSendChat = async () => {
    if(!input.trim()) return;
    const msg = input;
    setMessages(prev => [...prev, {sender: "User", text: msg}]);
    setInput("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({message: msg})
      });
      const data = await res.json();
      setMessages(prev => [...prev, {sender: "AI", text: data.reply}]);
    } catch (e) { console.error(e); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const reader = new FileReader();
    reader.onload = (e) => setDietImage(e.target?.result as string);
    reader.readAsDataURL(file);

    setDietScanning(true);
    setDietResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const res = await fetch(`${API_URL}/api/diet/vision`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setDietResult(data);
    } catch (err) {
      console.error(err);
      setDietResult({ assessment: "Error processing image." });
    } finally {
      setDietScanning(false);
    }
  };

  if (!profile) {
    return <OnboardingWizard onComplete={setProfile} />;
  }

  if (activeTab === 'workout') {
    return (
      <div className="w-screen h-screen fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl p-8 flex items-center justify-center">
        <LiveWorkout onEnd={() => {
          setActiveTab('home');
          fetchHistory();
        }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden selection:bg-primary-500/30 bg-white relative z-0">
      <div 
        className="absolute inset-0 z-[-1] opacity-40 pointer-events-none bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490818387583-1b5ba22111d5?auto=format&fit=crop&w=2000&q=80')" }} 
      />
      
      {/* MOBILE HEADER */}
      <header className="flex lg:hidden items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-30 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white shadow-sm">
            <Activity size={18} />
          </div>
          <h2 className="text-xl font-black tracking-tighter text-slate-800">FitAI</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-black text-slate-800 text-sm leading-tight">{profile.name}</p>
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{profile.goal}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User size={18} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="flex lg:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 pb-safe z-40 justify-around items-center px-2 py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: 'home', icon: Home, label: 'Dash' },
          { id: 'analytics', icon: BarChart2, label: 'Stats' },
          { id: 'workout', icon: Dumbbell, label: 'Start', special: true },
          { id: 'diet', icon: Utensils, label: 'Diet' },
          { id: 'guide', icon: BookOpen, label: 'Guide' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              item.special 
              ? 'bg-primary-500 text-white shadow-lg -mt-8 w-14 h-14 justify-center rounded-full border-4 border-white'
              : activeTab === item.id 
                ? 'text-primary-600 scale-110' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <item.icon size={item.special ? 24 : 20} className={activeTab === item.id && !item.special ? "text-primary-500" : ""} />
            {!item.special && <span className="text-[10px] font-bold">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-80 shrink-0 flex-col relative z-20 glass-panel m-6 mr-0 overflow-y-auto bg-white border-slate-100 shadow-sm">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-primary-600 flex items-center justify-center font-bold text-xl lg:text-2xl text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)]">
            <Activity size={24} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tighter text-slate-800">FitAI</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'home', icon: Home, label: 'Dashboard' },
            { id: 'analytics', icon: BarChart2, label: 'Analytics' },
            { id: 'diet', icon: Utensils, label: 'Diet Plan' },
            { id: 'guide', icon: BookOpen, label: 'Exercise Guide' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-lg ${
                activeTab === item.id 
                ? 'bg-primary-50 text-primary-600 shadow-sm border border-primary-100' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <item.icon size={24} className={activeTab === item.id ? "text-primary-500" : ""} />
              {item.label}
            </button>
          ))}
          
          <div className="pt-8">
            <button 
              onClick={() => setActiveTab('workout')}
              className="w-full glass-button flex justify-between items-center py-5 px-6"
            >
              <span className="flex items-center gap-3 text-lg"><Dumbbell size={24} /> Start Session</span>
              <ChevronRight size={24} />
            </button>
          </div>
        </nav>

        <div className="p-6 m-4 mt-auto rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white p-1 shadow-sm border border-slate-200">
            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-slate-400" />
            </div>
          </div>
          <div>
            <p className="font-black text-slate-800 text-lg lg:text-xl leading-tight">{profile.name}</p>
            <p className="text-sm lg:text-base font-bold text-primary-500">{profile.goal}</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-y-auto w-full pb-24 lg:pb-0">
        <div className="max-w-full lg:max-w-6xl mx-auto px-4 md:px-6 lg:px-10 py-6 lg:py-10 relative z-10">
          
          <header className="flex justify-between items-end mb-12">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-black mb-2 lg:mb-4 tracking-tight text-slate-800 drop-shadow-sm">
                Welcome back, <span className="text-primary-600">{profile.name}</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-600 text-xl lg:text-2xl font-bold">
                Your personalized wellness plan for today is ready.
              </motion.p>
            </div>
          </header>

          {!plan ? (
            <div className="h-64 flex flex-col items-center justify-center glass-panel bg-white border border-slate-100">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Curating your plan...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* HOME - DASHBOARD */}
              {activeTab === 'home' && (
                <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-8 relative overflow-hidden group bg-white border border-slate-100 flex flex-col justify-center">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 text-slate-800"><Target size={60}/></div>
                      <p className="text-slate-500 font-black text-lg uppercase tracking-wider mb-2">Your Health Score</p>
                      <h3 className="text-7xl font-black text-slate-800 tracking-tighter">{plan.user_metrics.bmi}</h3>
                      <div className="mt-6 inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-base font-black border border-primary-100 w-fit">
                        <CheckCircle2 size={20}/> {plan.user_metrics.category}
                      </div>
                    </div>
                    
                    <div className="glass-panel p-10 md:col-span-2 flex items-center bg-white border border-slate-100">
                      <div className="flex gap-8 items-start">
                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-500 shadow-sm shrink-0">
                          <Activity size={40} />
                        </div>
                        <div>
                          <p className="text-slate-500 font-black text-lg uppercase tracking-wider mb-4">What You Need To Do</p>
                          <h3 className="text-3xl font-black leading-tight text-slate-800">{plan.diet_suggestion}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RICH MEDIA WORKOUT CARDS */}
                  <div className="mt-14">
                    <h3 className="text-5xl font-black mb-8 flex items-center gap-4 text-slate-800 drop-shadow-sm">
                      Your Daily Workouts 
                      <span className="bg-primary-100 text-primary-700 px-5 py-2 text-xl rounded-full font-black tracking-tight">
                        {plan.workout_schedule["Monday"].type}
                      </span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plan.workout_schedule["Monday"].exercises.map((ex: string, i: number) => {
                        const exInfo = getExerciseInfo(ex);
                        return (
                          <div key={i} onClick={() => setSelectedExercise(exInfo)} className="cursor-pointer glass-panel overflow-hidden bg-white group hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.15)] transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-100">
                            <div className="h-48 overflow-hidden relative">
                              <img src={exInfo.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={exInfo.name} />
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                                {i + 1}
                              </div>
                            </div>
                            <div className="p-6">
                              <h4 className="font-black text-2xl text-slate-800 mb-2">{exInfo.name}</h4>
                              <p className="text-slate-500 text-base font-bold uppercase tracking-wider mb-4">{exInfo.muscle}</p>
                              
                              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-base text-slate-700 font-bold flex gap-3">
                                  <Dumbbell size={20} className="text-primary-500 shrink-0 mt-0.5" />
                                  <span>{getExerciseSuggestion(ex)}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ANALYTICS */}
              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <div className="glass-panel p-10 bg-white">
                    <h3 className="text-3xl font-bold mb-2 text-slate-800">Progress Tracking</h3>
                    <p className="text-slate-500 mb-10 text-lg">Your caloric expenditure and performance visualized over time.</p>
                    <div className="h-[400px] w-full">
                      {historyData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-lg border-2 border-dashed border-slate-300 rounded-3xl">
                          Complete a workout to see stats
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={historyData}>
                            <defs>
                              <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" tick={{fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(0,0,0,0.05)', borderRadius: '16px', color: '#1e293b', fontWeight: 'bold' }} 
                            />
                            <Area type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCal)" />
                            <Area type="monotone" dataKey="performance" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPerf)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DIET PLAN HUB */}
              {activeTab === 'diet' && (
                <motion.div key="diet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                    <div>
                      <h3 className="text-3xl lg:text-4xl font-black mb-3 flex flex-wrap items-center gap-4 text-slate-800 drop-shadow-sm">
                        Today's Meal Plan
                        <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 text-sm rounded-full uppercase font-black border border-emerald-200">2,400 kcal Goal</span>
                      </h3>
                      <p className="text-slate-600 text-lg lg:text-xl font-bold">Structured nutrition to fuel your performance.</p>
                    </div>
                    
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-sm w-full md:w-auto">
                      <Camera size={20} />
                      Scan Food
                    </button>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  </div>

                  {dietScanning && (
                    <div className="glass-panel p-8 flex flex-col items-center justify-center bg-white border border-slate-100">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-600 font-bold tracking-widest text-sm uppercase">Analyzing your food...</p>
                    </div>
                  )}

                  {dietResult && !dietScanning && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel bg-white p-8 mb-8 border-2 border-primary-100 shadow-[0_10px_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-2xl font-bold text-sm">Scan Result</div>
                      <h4 className="text-3xl font-black text-slate-800 mb-6 capitalize flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={32} />
                        {dietResult.food_name}
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Calories</p>
                          <p className="text-2xl font-black text-slate-800">{dietResult.calories} <span className="text-sm font-medium text-slate-400">kcal</span></p>
                        </div>
                        <div className="bg-primary-50 p-5 rounded-2xl border border-primary-100">
                          <p className="text-primary-600 text-xs font-bold uppercase tracking-widest mb-1">Protein</p>
                          <p className="text-2xl font-black text-primary-700">{dietResult.protein_g} <span className="text-sm font-medium">g</span></p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Carbs</p>
                          <p className="text-2xl font-black text-slate-800">{dietResult.carbs_g} <span className="text-sm font-medium text-slate-400">g</span></p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Fats</p>
                          <p className="text-2xl font-black text-slate-800">{dietResult.fats_g} <span className="text-sm font-medium text-slate-400">g</span></p>
                        </div>
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl font-medium flex gap-3 items-center">
                        <Leaf size={20} /> {dietResult.assessment}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-4 mb-6">
                    <button onClick={() => setDietPref('Non-Veg')} className={`px-6 py-2 rounded-full font-bold transition-all ${dietPref === 'Non-Veg' ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>Non-Veg</button>
                    <button onClick={() => setDietPref('Veg')} className={`px-6 py-2 rounded-full font-bold transition-all ${dietPref === 'Veg' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>Vegetarian</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(dietPref === 'Veg' ? DIET_PLAN_VEG : DIET_PLAN_NON_VEG).map((meal) => (
                      <div key={meal.id} className="glass-panel overflow-hidden bg-white flex hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] transition-all">
                        <div className="w-1/3 h-full min-h-[160px] relative">
                          <img src={meal.img} alt={meal.label} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="w-2/3 p-6 flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-2">
                            <span className="flex items-center gap-2 text-primary-600 font-black text-base uppercase tracking-wider">
                              <meal.icon size={20} /> {meal.label}
                            </span>
                            <span className="text-slate-500 font-bold text-base">{meal.time}</span>
                          </div>
                          <h4 className="text-2xl font-black text-slate-800 mb-5 leading-tight">{meal.meal}</h4>
                          <div className="flex gap-6">
                            <div className="text-base"><span className="font-black text-slate-800 text-lg">{meal.cals}</span> <span className="text-slate-500 font-bold">kcal</span></div>
                            <div className="text-base"><span className="font-black text-slate-800 text-lg">{meal.p}g</span> <span className="text-slate-500 font-bold">P</span></div>
                            <div className="text-base"><span className="font-black text-slate-800 text-lg">{meal.c}g</span> <span className="text-slate-500 font-bold">C</span></div>
                            <div className="text-base"><span className="font-black text-slate-800 text-lg">{meal.f}g</span> <span className="text-slate-500 font-bold">F</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* EXERCISE GUIDE */}
              {activeTab === 'guide' && (
                <motion.div key="guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <div className="glass-panel p-10 bg-white">
                    <h3 className="text-3xl font-bold mb-4 flex items-center gap-4 text-slate-800">
                      Exercise Guide Library
                      <span className="bg-primary-100 text-primary-600 px-3 py-1 text-xs rounded-full uppercase font-bold border border-primary-200">Form & Technique</span>
                    </h3>
                    <p className="text-slate-500 mb-6 text-lg max-w-2xl">Learn the correct form for fundamental movements. Good form prevents injury and maximizes muscle engagement.</p>
                    
                    <div className="mb-8">
                      <input 
                        type="text" 
                        placeholder="Search for an exercise (e.g., Squat, Push-up)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary-400 focus:bg-white p-4 rounded-2xl text-lg outline-none transition-all duration-300 shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {Object.keys(EXERCISE_LIBRARY).filter(key => key.toLowerCase().includes(searchQuery.toLowerCase())).map((exKey, index) => {
                        const ex = EXERCISE_LIBRARY[exKey];
                        return (
                          <div key={index} onClick={() => setSelectedExercise({ name: exKey, ...ex })} className="cursor-pointer glass-panel p-6 bg-white flex flex-col hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.15)] transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-100 group">
                            <div className="w-full h-56 rounded-2xl overflow-hidden mb-6">
                              <img src={ex.img} alt={exKey} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-3xl font-black text-slate-800">{exKey}</h4>
                              <span className="bg-slate-100 text-slate-600 px-4 py-2 text-sm rounded-full font-bold uppercase">{ex.difficulty}</span>
                            </div>
                            <p className="text-primary-600 font-bold uppercase tracking-widest text-base mb-6">{ex.muscle}</p>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex-1">
                              <ul className="space-y-4">
                                {ex.instructions.slice(0, 2).map((step, i) => (
                                  <li key={i} className="flex gap-4 text-slate-600 font-medium text-base">
                                    <span className="text-primary-500 font-bold text-lg">{i+1}.</span>
                                    <span className="line-clamp-2">{step}</span>
                                  </li>
                                ))}
                              </ul>
                              <p className="text-primary-500 text-sm font-bold mt-4 flex items-center gap-2">Click to view full details <ChevronRight size={16}/></p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}

        </div>
      </main>

      {/* EXERCISE MODAL */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 h-80 md:h-auto relative">
                <img src={selectedExercise.img} alt={selectedExercise.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                   <h3 className="text-white text-5xl font-black drop-shadow-lg">{selectedExercise.name}</h3>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-3">{selectedExercise.difficulty}</span>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-lg">{selectedExercise.muscle}</p>
                  </div>
                  <button onClick={() => setSelectedExercise(null)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-xl font-bold">
                    ✕
                  </button>
                </div>
                
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex-1 mb-8">
                  <h4 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <BookOpen className="text-primary-500" />
                    Execution Guide
                  </h4>
                  <ul className="space-y-6">
                    {selectedExercise.instructions.map((step, i) => (
                      <li key={i} className="flex gap-5 text-slate-700 font-medium text-lg leading-relaxed">
                        <span className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0">{i+1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button onClick={() => { setSelectedExercise(null); setActiveTab('workout'); }} className="w-full glass-button py-6 text-xl">
                  Start Workout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHATBOT */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 right-0 md:bottom-10 md:right-10 w-full md:w-[600px] h-[85vh] md:h-auto md:max-w-[95vw] glass-panel bg-white overflow-hidden z-50 flex flex-col shadow-2xl md:rounded-3xl rounded-t-3xl rounded-b-none border-t border-slate-100"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-sm">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-black text-2xl text-slate-800">Wellness Coach</h3>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors w-10 h-10 text-2xl rounded-full flex items-center justify-center">✕</button>
            </div>
            
            <div className="flex-1 p-6 h-[500px] max-h-[60vh] overflow-y-auto space-y-6 flex flex-col">
              {messages.map((m, i) => (
                <div key={i} className={`p-5 rounded-3xl max-w-[85%] text-lg font-medium leading-relaxed shadow-sm ${m.sender === 'User' ? 'bg-primary-600 text-white self-end rounded-br-sm' : 'bg-slate-100 text-slate-800 self-start rounded-bl-sm'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            
            <div className="p-5 bg-white border-t border-slate-100 flex gap-4 items-center">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                className="flex-1 glass-input py-4 px-6 text-lg font-medium bg-slate-50 border-transparent shadow-inner"
                placeholder="Ask your coach..."
              />
              <button onClick={handleSendChat} className="bg-primary-100 text-primary-600 hover:bg-primary-600 hover:text-white p-4 rounded-2xl transition-all shadow-sm">
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING COACH BUTTON */}
      {!chatOpen && (
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-2 md:gap-4 bg-primary-500 text-white p-4 md:p-5 rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.6)] z-50 hover:bg-primary-600 transition-all group overflow-hidden border-4 border-white animate-bounce"
        >
          <div className="absolute inset-0 bg-white/20 animate-ping rounded-full"></div>
          <MessageSquare size={32} className="relative z-10" />
          <span className="font-black text-xl tracking-wide relative z-10 mr-2 drop-shadow-md">Ask Coach AI</span>
        </motion.button>
      )}

    </div>
  );
}

// ==========================================
// INTERACTIVE ONBOARDING WIZARD
// ==========================================
function OnboardingWizard({ onComplete }: { onComplete: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', age: '', weight: '', height: '', goal: '' });
  const [error, setError] = useState('');

  const nextStep = () => {
    setError('');
    setStep(prev => prev + 1);
  };
  const finish = () => {
    onComplete({ ...formData, age: Number(formData.age), weight: Number(formData.weight), height: Number(formData.height), days_per_week: 4 });
  };


  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center py-8 px-4 bg-white overflow-y-auto relative z-0">
      <div 
        className="absolute inset-0 z-[-1] opacity-40 pointer-events-none bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490818387583-1b5ba22111d5?auto=format&fit=crop&w=2000&q=80')" }} 
      />
      
      <div className="w-full max-w-md my-auto flex flex-col justify-center">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 text-primary-600 mb-4">
            <Activity size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight text-slate-800">Welcome to FitAI</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Let's personalize your fitness journey.</p>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden bg-white border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-3xl">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
            <motion.div className="h-full bg-primary-500" initial={{ width: "0%" }} animate={{ width: `${(step/2)*100}%` }} transition={{ ease: "easeInOut", duration: 0.5 }} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="space-y-4 mt-4 text-center">
                <h2 className="text-xl md:text-2xl font-black mb-4 text-slate-800">What's your name?</h2>
                <div className="mx-auto">
                  <input autoFocus value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} onKeyDown={e => e.key === 'Enter' && formData.name && nextStep()} placeholder="e.g. Alex" className="w-full glass-input bg-slate-50 shadow-inner text-center text-lg md:text-xl font-bold py-3 md:py-4 rounded-xl" />
                </div>
                <button disabled={!formData.name} onClick={nextStep} className="w-full glass-button py-3 md:py-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base rounded-xl font-bold">Continue</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="space-y-4 mt-4">
                <h2 className="text-xl md:text-2xl font-black mb-4 text-slate-800 text-center">Your Body Metrics</h2>
                <div className="grid grid-cols-2 gap-4 mx-auto">
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1 block text-center">Weight (kg)</label>
                    <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full glass-input bg-slate-50 text-center text-base md:text-lg font-bold py-2 md:py-3 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1 block text-center">Height (cm)</label>
                    <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full glass-input bg-slate-50 text-center text-base md:text-lg font-bold py-2 md:py-3 rounded-xl" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mb-1 block text-center">Age</label>
                    <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full glass-input bg-slate-50 text-center text-base md:text-lg font-bold py-2 md:py-3 rounded-xl" />
                  </div>
                </div>
                <div className="flex justify-center pt-4 flex-col items-center gap-3">
                  {error && <p className="text-red-500 font-bold text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl w-full text-center animate-pulse">{error}</p>}
                  <button disabled={!formData.weight || !formData.height || !formData.age} onClick={() => {
                    const a = Number(formData.age);
                    const h = Number(formData.height);
                    const w = Number(formData.weight);
                    
                    if (a < 5 || a > 100) return setError("Please enter a valid age between 5 and 100.");
                    if (h < 50 || h > 250) return setError("Please enter a valid height (50cm - 250cm).");
                    if (w < 10 || w > 300) return setError("Please enter a valid weight (10kg - 300kg).");
                    
                    // Height-Age connections
                    if (a <= 5 && h > 130) return setError(`A height of ${h}cm is unusually tall for a ${a}-year-old.`);
                    if (a <= 10 && h > 160) return setError(`A height of ${h}cm is unusually tall for a ${a}-year-old.`);
                    if (a > 18 && h < 120) return setError(`A height of ${h}cm is unusually short for an adult.`);
                    
                    // Weight-Age connections
                    if (a <= 5 && w > 40) return setError(`A weight of ${w}kg is unusually high for a ${a}-year-old.`);
                    if (a <= 10 && w > 70) return setError(`A weight of ${w}kg is unusually high for a ${a}-year-old.`);
                    
                    // BMI connections (Weight-Height bounds)
                    const bmi = w / ((h / 100) * (h / 100));
                    if (bmi < 10) return setError(`Your metrics result in a dangerously low BMI (${bmi.toFixed(1)}). Please verify.`);
                    if (bmi > 60) return setError(`Your metrics result in an unusually high BMI (${bmi.toFixed(1)}). Please verify.`);
                    
                    setError('');
                    finish();
                  }} className="w-full glass-button py-3 md:py-4 text-sm md:text-base rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">Generate My Plan</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
