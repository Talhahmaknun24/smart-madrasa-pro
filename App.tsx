import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Calculator, FileText, 
  Bot, Moon, Sun, Menu, X, Search, Plus, Trash2, Printer, 
  Send, Sparkles, BookOpen, Settings, Bell, Globe, User, 
  Library, ScrollText, PenTool, Smartphone
} from 'lucide-react';
import { HashRouter } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Student, Transaction, ChatMessage, Page, Language, UserProfile } from './types';
import { startChatSession, generateQuestionPaper, generateNotice, generateResultComment } from './services/geminiService';

// --- Translations ---
const t = {
  en: {
    dashboard: "Dashboard",
    students: "Students",
    teachers: "Teachers",
    accounts: "Accounts",
    results: "Results",
    library: "Islamic Library",
    noticeGen: "Notice Generator",
    questionGen: "Question Paper",
    aiAssistant: "AI Assistant",
    welcome: "Welcome back",
    totalStudents: "Total Students",
    balance: "Balance",
    income: "Income",
    expense: "Expense",
    addNew: "Add New",
    save: "Save Changes",
    generating: "Generating...",
    generate: "Generate",
    profile: "Edit Profile",
    installApp: "Install App"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    students: "ছাত্র/ছাত্রী",
    teachers: "শিক্ষকবৃন্দ",
    accounts: "হিসাব নিকাশ",
    results: "ফলাফল",
    library: "ইসলামিক লাইব্রেরি",
    noticeGen: "নোটিশ তৈরি",
    questionGen: "প্রশ্নপত্র তৈরি",
    aiAssistant: "AI অ্যাসিস্ট্যান্ট",
    welcome: "স্বাগতম",
    totalStudents: "মোট ছাত্র",
    balance: "বর্তমান তহবিল",
    income: "আয়",
    expense: "ব্যয়",
    addNew: "নতুন যোগ করুন",
    save: "সংরক্ষণ করুন",
    generating: "তৈরি হচ্ছে...",
    generate: "তৈরি করুন",
    profile: "প্রোফাইল এডিট",
    installApp: "অ্যাপ ইন্সটল"
  }
};

// --- Mock Data ---
const initialStudents: Student[] = [
  { id: '1', regNo: 'R-2401', name: 'Abdullah', fatherName: 'Rahman', class: 'Hifz', roll: '01', phone: '01700...', address: 'Dhaka', dob: '2010-01-01' },
  { id: '2', regNo: 'R-2402', name: 'Ayesha', fatherName: 'Kabir', class: 'Nazera', roll: '02', phone: '01800...', address: 'Ctg', dob: '2012-05-15' },
];

const initialProfile: UserProfile = {
  name: "Moulana Abdul Karim",
  role: "Principal (Muhtamim)",
  madrasaName: "Madrasa Darul Uloom",
  email: "admin@madrasa.com",
  phone: "01700000000"
};

// --- Reusable Glass Component ---
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-xl rounded-2xl ${className}`}>
    {children}
  </div>
);

// --- Main App ---
const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('bn');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Data
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [transactions] = useState<Transaction[]>([
    { id: '1', date: '2023-10-01', type: 'Income', category: 'Fee', amount: 15000, description: 'Fees' },
    { id: '2', date: '2023-10-05', type: 'Expense', category: 'Util', amount: 3000, description: 'Bill' },
  ]);

  // AI Chat State (Global)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Feature States
  const [noticeTopic, setNoticeTopic] = useState("");
  const [generatedNotice, setGeneratedNotice] = useState("");
  const [qSubject, setQSubject] = useState("");
  const [qClass, setQClass] = useState("");
  const [qGeneratedHtml, setQGeneratedHtml] = useState("");
  const [isGenLoading, setIsGenLoading] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (!chatSessionRef.current) chatSessionRef.current = startChatSession();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatOpen]);

  // --- Handlers ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.text, timestamp: new Date() }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection Error.", timestamp: new Date() }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateNotice = async () => {
    if(!noticeTopic) return;
    setIsGenLoading(true);
    const res = await generateNotice(noticeTopic, lang);
    setGeneratedNotice(res);
    setIsGenLoading(false);
  };

  const handleGenerateQuestion = async () => {
    setIsGenLoading(true);
    const res = await generateQuestionPaper(qSubject, qClass, "General", "100", lang);
    setQGeneratedHtml(res);
    setIsGenLoading(false);
  };

  // --- Views ---

  const DashboardView = () => {
    const inc = transactions.filter(t => t.type === 'Income').reduce((a, c) => a + c.amount, 0);
    const exp = transactions.filter(t => t.type === 'Expense').reduce((a, c) => a + c.amount, 0);
    
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <GlassCard className="p-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t[lang].welcome}, {profile.name}</h2>
              <p className="opacity-90">{profile.madrasaName}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm hidden md:block">
              <BookOpen size={32} />
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 flex items-center space-x-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600"><Users /></div>
            <div><p className="text-gray-500 text-sm">{t[lang].totalStudents}</p><h3 className="text-2xl font-bold">{students.length}</h3></div>
          </GlassCard>
          <GlassCard className="p-6 flex items-center space-x-4 border-l-4 border-l-green-500">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full text-green-600"><Calculator /></div>
            <div><p className="text-gray-500 text-sm">{t[lang].balance}</p><h3 className="text-2xl font-bold">৳ {(inc - exp).toLocaleString()}</h3></div>
          </GlassCard>
          <GlassCard className="p-6 flex items-center space-x-4 border-l-4 border-l-orange-500">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-600"><GraduationCap /></div>
            <div><p className="text-gray-500 text-sm">{t[lang].teachers}</p><h3 className="text-2xl font-bold">12</h3></div>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={[{ name: 'Current', Income: inc, Expense: exp }]}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    );
  };

  const NoticeGenView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-140px)]">
      <GlassCard className="p-6 flex flex-col">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white"><Bell className="text-orange-500"/> {t[lang].noticeGen}</h3>
        <textarea 
          className="flex-1 w-full p-4 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none min-h-[200px]"
          placeholder={lang === 'bn' ? "উদাহরণ: আগামী ঈদুল ফিতর উপলক্ষে ১০ দিনের ছুটি..." : "e.g., 10 days holiday for Eid-ul-Fitr..."}
          value={noticeTopic}
          onChange={e => setNoticeTopic(e.target.value)}
        />
        <button 
          onClick={handleGenerateNotice}
          disabled={isGenLoading || !noticeTopic}
          className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-2"
        >
          {isGenLoading ? t[lang].generating : <>{t[lang].generate} <Sparkles size={18}/></>}
        </button>
      </GlassCard>

      <GlassCard className="p-6 overflow-hidden flex flex-col min-h-[300px]">
        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Preview</h3>
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-700 shadow-inner">
          {generatedNotice ? (
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: generatedNotice }} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ScrollText size={48} className="mb-2 opacity-50" />
              <p>Generated notice will appear here</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );

  const LibraryView = () => (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Library size={32} className="text-emerald-600" />
        <h2 className="text-3xl font-bold dark:text-white">{t[lang].library}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Quran.com", url: "https://quran.com", desc: "The Noble Quran online" },
          { title: "Sunnah.com", url: "https://sunnah.com", desc: "Hadith Collections" },
          { title: "Muslim Pro", url: "https://muslimpro.com", desc: "Prayer times & Qibla" },
        ].map((link, i) => (
          <GlassCard key={i} className="p-6 hover:scale-105 transition-transform cursor-pointer group">
             <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline">
               <a href={link.url} target="_blank" rel="noreferrer">{link.title}</a>
             </h3>
             <p className="text-gray-600 dark:text-gray-300 mt-2">{link.desc}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-8 mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-full shadow-lg">
            <Bot size={40} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold dark:text-white">Ask an Islamic Question</h3>
            <p className="text-gray-600 dark:text-gray-400">Use the AI Assistant in the bottom right corner to ask about Hadith, History, or Fiqh (General).</p>
          </div>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
          >
            Open Assistant
          </button>
        </div>
      </GlassCard>
    </div>
  );

  // --- Profile Modal ---
  const ProfileModal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-lg p-8 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">{t[lang].profile}</h2>
          <button onClick={() => setShowProfileModal(false)}><X className="text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} className="w-full p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role / Designation</label>
            <input value={profile.role} onChange={e=>setProfile({...profile, role: e.target.value})} className="w-full p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Madrasa Name</label>
            <input value={profile.madrasaName} onChange={e=>setProfile({...profile, madrasaName: e.target.value})} className="w-full p-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button onClick={() => setShowProfileModal(false)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors mt-4">
            {t[lang].save}
          </button>
        </div>
      </GlassCard>
    </div>
  );

  // --- Layout ---
  return (
    <HashRouter>
      <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950 overflow-hidden font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-white/20 dark:border-gray-700 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center justify-between px-4 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg text-white"><BookOpen size={24} /></div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Madrasa Pro</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-red-500"><X size={24} /></button>
            </div>
            
            <nav className="flex-1 space-y-2 mt-4 overflow-y-auto custom-scrollbar pb-20">
              {[
                { p: Page.DASHBOARD, i: LayoutDashboard, l: t[lang].dashboard },
                { p: Page.STUDENTS, i: Users, l: t[lang].students },
                { p: Page.TEACHERS, i: GraduationCap, l: t[lang].teachers },
                { p: Page.ACCOUNTS, i: Calculator, l: t[lang].accounts },
                { p: Page.RESULTS, i: FileText, l: t[lang].results },
                { p: Page.LIBRARY, i: Library, l: t[lang].library },
                { type: 'label', l: 'AI Tools' },
                { p: Page.NOTICE_GEN, i: Bell, l: t[lang].noticeGen },
                { p: Page.QUESTION_GEN, i: PenTool, l: t[lang].questionGen },
              ].map((item: any, idx) => (
                item.type === 'label' ? 
                  <p key={idx} className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">{item.l}</p> :
                  <button key={idx}
                    onClick={() => { setActivePage(item.p); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activePage === item.p ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
                  >
                    <item.i size={20} /> <span>{item.l}</span>
                  </button>
              ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {profile.name.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.name}</p>
                  <p className="text-xs text-gray-500 truncate">{profile.role}</p>
                </div>
                <Settings size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-4 md:px-10 z-10 shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"><Menu /></button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white hidden md:block opacity-0 lg:opacity-100 transition-opacity">
              {activePage.replace('_', ' ')}
            </h1>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')} className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                <Globe size={18} /> <span className="text-xs md:text-sm">{lang === 'en' ? 'EN' : 'বাংলা'}</span>
              </button>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-gray-600 dark:text-gray-300">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
            {activePage === Page.DASHBOARD && <DashboardView />}
            {activePage === Page.NOTICE_GEN && <NoticeGenView />}
            {activePage === Page.LIBRARY && <LibraryView />}
            {activePage === Page.QUESTION_GEN && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-140px)]">
                 <GlassCard className="p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white"><PenTool className="text-purple-500"/> {t[lang].questionGen}</h3>
                    <div className="space-y-4">
                      <input className="w-full p-4 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Subject (e.g. Fiqh)" value={qSubject} onChange={e=>setQSubject(e.target.value)} />
                      <input className="w-full p-4 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Class (e.g. Class 5)" value={qClass} onChange={e=>setQClass(e.target.value)} />
                      <button onClick={handleGenerateQuestion} disabled={isGenLoading} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors">
                        {isGenLoading ? t[lang].generating : t[lang].generate}
                      </button>
                    </div>
                 </GlassCard>
                 <GlassCard className="p-6 overflow-hidden flex flex-col min-h-[300px]">
                   <div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white">Preview</h3></div>
                   <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-6 rounded-xl border dark:border-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: qGeneratedHtml }} className="prose dark:prose-invert" />
                   </div>
                 </GlassCard>
              </div>
            )}
            
            {/* Placeholder for Student/Teachers lists (Using simple GlassCards for now) */}
            {(activePage === Page.STUDENTS || activePage === Page.TEACHERS) && (
              <GlassCard className="p-6 min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold dark:text-white">{t[lang][activePage === Page.STUDENTS ? 'students' : 'teachers']}</h2>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={18}/> {t[lang].addNew}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                       <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400"><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Action</th></tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} className="border-b dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                          <td className="p-4">{s.regNo}</td>
                          <td className="p-4 font-bold dark:text-gray-200">{s.name}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">{s.phone}</td>
                          <td className="p-4"><button className="text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"><Trash2 size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </main>
        </div>

        {/* --- Floating AI Assistant (Mobile Optimized) --- */}
        <div className={`fixed z-50 transition-all duration-300 shadow-2xl
          ${isChatOpen 
            ? 'inset-0 md:top-auto md:left-auto md:bottom-6 md:right-6 w-full h-full md:w-96 md:h-[600px] rounded-none md:rounded-3xl' 
            : 'bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full'
          }
        `}>
          {!isChatOpen && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="w-full h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Bot size={28} className="md:w-8 md:h-8" />
            </button>
          )}
          
          {isChatOpen && (
            <div className="w-full h-full flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl md:border border-white/20 dark:border-gray-700 md:rounded-3xl overflow-hidden animate-slide-up">
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full"><Sparkles size={18}/></div>
                  <div><h4 className="font-bold">Islamic AI</h4><p className="text-xs opacity-80">Online</p></div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full"><X size={24}/></button>
              </div>
              
              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                {chatHistory.length === 0 && (
                   <div className="text-center text-gray-400 mt-10">
                     <Bot size={48} className="mx-auto mb-2 opacity-50"/>
                     <p className="text-sm">Assalamu Alaikum! How can I help you today?</p>
                   </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 dark:text-white rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                   <div className="flex gap-1 ml-4"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"/><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"/></div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 md:p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 safe-area-bottom">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-3 md:py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm md:text-base"
                    placeholder="Ask..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage} className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"><Send size={20}/></button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showProfileModal && <ProfileModal />}
      </div>
    </HashRouter>
  );
};

export default App;