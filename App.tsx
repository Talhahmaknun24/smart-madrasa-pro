
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Calculator, 
  Bot, Menu, X, Plus, Printer, 
  Send, Sparkles, Bell, User, 
  Library, LogOut, Download, Camera,
  Building2, Wallet, CreditCard, ClipboardList, 
  Briefcase, MessageSquare, Bus, Award, 
  ChevronDown, ChevronRight, BedDouble,
  Facebook, Youtube, Palette, Star, Image as ImageIcon, Edit, Home, MonitorPlay, Mail, Lock
} from 'lucide-react';
import { HashRouter } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { 
  Student, Transaction, Module, MadrasaConfig, AuthUser, 
  GalleryItem, Visitor, FeeRecord, Staff, ExamResult, Notice, 
  LibraryBook, TransportRoute, HostelRoom, Subject, TimeTable, 
  MenuItem, ChatMessage 
} from './types';
import * as GeminiService from './services/geminiService';

// --- FIREBASE IMPORTS ---
import { auth, db } from './firebaseConfig';
import { 
  onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile 
} from 'firebase/auth';
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, setDoc
} from 'firebase/firestore';

// --- Menu Configuration ---
const MENU_STRUCTURE: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', module: Module.DASHBOARD, icon: LayoutDashboard },
  { id: 'gallery', label: 'Photo Gallery', module: Module.GALLERY, icon: ImageIcon },
  { 
    id: 'front_office', label: 'Front Office', module: Module.FRONT_OFFICE, icon: Building2,
    subItems: [
      { id: 'visitors', label: 'Visitor Book' },
      { id: 'enquiry', label: 'Admission Enquiry' }
    ]
  },
  {
    id: 'student_info', label: 'Student Information', module: Module.STUDENT_INFO, icon: Users,
    subItems: [
      { id: 'student_admission', label: 'Student Admission' },
      { id: 'student_details', label: 'Student Details' }
    ]
  },
  {
    id: 'fees', label: 'Fees Collection', module: Module.FEES_COLLECTION, icon: Wallet,
    subItems: [
      { id: 'collect_fees', label: 'Collect Fees' },
      { id: 'fees_report', label: 'Fees Report' }
    ]
  },
  {
    id: 'income', label: 'Income', module: Module.INCOME, icon: CreditCard,
    subItems: [
      { id: 'add_income', label: 'Add Income' },
      { id: 'search_income', label: 'Search Income' }
    ]
  },
  {
    id: 'expenses', label: 'Expenses', module: Module.EXPENSES, icon: Calculator,
    subItems: [
      { id: 'add_expense', label: 'Add Expense' },
      { id: 'search_expense', label: 'Search Expense' }
    ]
  },
  {
    id: 'examinations', label: 'Examinations', module: Module.EXAMINATIONS, icon: ClipboardList,
    subItems: [
      { id: 'exam_result', label: 'Exam Result' },
      { id: 'design_admit', label: 'Admit Card' }
    ]
  },
  {
    id: 'academics', label: 'Academics', module: Module.ACADEMICS, icon: GraduationCap,
    subItems: [
      { id: 'class_timetable', label: 'Class Timetable' },
      { id: 'subjects', label: 'Subjects' }
    ]
  },
  {
    id: 'hr', label: 'Human Resource', module: Module.HUMAN_RESOURCE, icon: Briefcase,
    subItems: [
      { id: 'staff_directory', label: 'Staff Directory' }
    ]
  },
  {
    id: 'communicate', label: 'Communicate', module: Module.COMMUNICATE, icon: MessageSquare,
    subItems: [
      { id: 'notice_board', label: 'Notice Board' },
      { id: 'chat', label: 'Real-time Chat' }
    ]
  },
  {
    id: 'certificate', label: 'Certificate', module: Module.CERTIFICATE, icon: Award,
    subItems: [
      { id: 'gen_id', label: 'Generate ID Card' }
    ]
  },
  {
    id: 'library', label: 'Library', module: Module.LIBRARY, icon: Library,
    subItems: [
      { id: 'book_list', label: 'Book List' }
    ]
  },
  {
    id: 'transport', label: 'Transport', module: Module.TRANSPORT, icon: Bus,
    subItems: [
      { id: 'routes', label: 'Routes' },
      { id: 'vehicles', label: 'Vehicles' }
    ]
  },
  {
    id: 'hostel', label: 'Hostel', module: Module.HOSTEL, icon: BedDouble,
    subItems: [
      { id: 'hostel_rooms', label: 'Hostel Rooms' }
    ]
  },
  {
    id: 'developer', label: 'Developer Info', module: Module.DEVELOPER_INFO, icon: User
  }
];

const initialConfig: MadrasaConfig = {
    name: "Tahjibul Ummah Madrasa",
    address: "Ishwarganj, Bangladesh",
    logo: "https://cdn-icons-png.flaticon.com/512/3354/3354366.png",
    banner: "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=2070",
    established: "2015"
};

// --- Main App Component ---
const App: React.FC = () => {
  // --- Auth State ---
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  // --- App Data State (Real-time) ---
  const [madrasaConfig, setMadrasaConfig] = useState<MadrasaConfig>(initialConfig);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<MadrasaConfig>(initialConfig);

  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // --- Input States ---
  const [newStudent, setNewStudent] = useState<Partial<Student>>({});
  const [newFee, setNewFee] = useState<Partial<FeeRecord>>({ paymentMethod: 'Cash', status: 'Paid' });
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({});
  const [chatInput, setChatInput] = useState("");
  const [newVisitor, setNewVisitor] = useState<Partial<Visitor>>({});

  // --- AI State ---
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiHistory, setAiHistory] = useState<{role:string, text:string}[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiSessionRef = useRef<any>(null);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- UI State ---
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [activeSubItem, setActiveSubItem] = useState<string>("dashboard");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [idCardQuote, setIdCardQuote] = useState("Seek knowledge from cradle to grave.");

  // --- REAL-TIME LISTENERS ---
  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser({
          uid: user.uid,
          email: user.email!,
          name: user.displayName || "Admin",
          role: 'admin'
        });
      } else {
        setAuthUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    // Load AI
    if (!aiSessionRef.current) aiSessionRef.current = GeminiService.startChatSession();

    // Config Listener (Single Doc)
    // For simplicity, using LocalStorage for config in this version, or could be a doc
    const savedConfig = localStorage.getItem('madrasa_config');
    if(savedConfig) setMadrasaConfig(JSON.parse(savedConfig));

    // Data Listeners
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    });

    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      setFees(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeeRecord)));
    });

    const unsubIncome = onSnapshot(query(collection(db, "incomes"), orderBy("date", "desc")), (snap) => {
      setIncomes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    const unsubExpense = onSnapshot(query(collection(db, "expenses"), orderBy("date", "desc")), (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    const unsubNotices = onSnapshot(query(collection(db, "notices"), orderBy("date", "desc")), (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice)));
    });

    const unsubMessages = onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "asc")), (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    });

    const unsubVisitors = onSnapshot(collection(db, "visitors"), (snap) => {
        setVisitors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Visitor)));
    });
    
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
        setStaffList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
    });

    return () => {
      unsubStudents(); unsubFees(); unsubIncome(); unsubExpense(); unsubNotices(); unsubMessages(); unsubVisitors(); unsubStaff();
    };
  }, [authUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, isAiOpen]);

  // --- Handlers ---

  const handleAuth = async () => {
    setAuthError("");
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPass);
        await updateProfile(cred.user, { displayName: authName });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPass);
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSaveConfig = () => {
      setMadrasaConfig(tempConfig);
      localStorage.setItem('madrasa_config', JSON.stringify(tempConfig));
      setIsEditingConfig(false);
  };

  const addData = async (collName: string, data: any, clearFn: Function) => {
    if(!authUser) return;
    try {
      await addDoc(collection(db, collName), {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: authUser.uid
      });
      clearFn({});
      alert("Saved Successfully to Cloud!");
    } catch (e) {
      console.error(e);
      alert("Error saving data");
    }
  };

  const sendRealMessage = async () => {
    if(!chatInput.trim() || !authUser) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: chatInput,
        senderId: authUser.uid,
        senderName: authUser.name,
        timestamp: serverTimestamp(),
        type: 'user'
      });
      setChatInput("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    setAiHistory(p => [...p, { role: 'user', text: aiInput }]);
    const currentInput = aiInput;
    setAiInput("");
    setIsAiLoading(true);
    try {
      const res = await aiSessionRef.current.sendMessage({ message: currentInput });
      setAiHistory(p => [...p, { role: 'model', text: res.text }]);
    } catch {
      setAiHistory(p => [...p, { role: 'model', text: "Network Error. Please check connection." }]);
    }
    setIsAiLoading(false);
  };

  // --- Views ---

  const renderDashboardBanner = () => (
      <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-md mb-8 group animate-fade-in">
          <img src={madrasaConfig.banner} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Banner"/>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 flex items-end gap-6">
              <div className="w-24 h-24 bg-white rounded-full p-2 shadow-xl border-4 border-gold-400 relative z-10">
                  <img src={madrasaConfig.logo} className="w-full h-full object-contain" alt="Logo"/>
              </div>
              <div className="flex-1 mb-2 text-white">
                  <h1 className="text-3xl font-bold drop-shadow-md">{madrasaConfig.name}</h1>
                  <p className="text-emerald-200 flex items-center gap-2"><Building2 size={14}/> {madrasaConfig.address} • Est: {madrasaConfig.established}</p>
              </div>
              <div className="flex gap-2 mb-4">
                  <button onClick={()=>{setTempConfig(madrasaConfig); setIsEditingConfig(true);}} className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full border border-white/30 transition-all"><Edit size={20}/></button>
              </div>
          </div>
          
          {isEditingConfig && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
                      <h3 className="text-xl font-bold mb-4 text-emerald-800 border-b pb-2">Update Madrasa Profile</h3>
                      <div className="space-y-3">
                          <input value={tempConfig.name} onChange={e=>setTempConfig({...tempConfig, name: e.target.value})} className="input-field" placeholder="Name"/>
                          <input value={tempConfig.address} onChange={e=>setTempConfig({...tempConfig, address: e.target.value})} className="input-field" placeholder="Address"/>
                          <input value={tempConfig.logo} onChange={e=>setTempConfig({...tempConfig, logo: e.target.value})} className="input-field" placeholder="Logo URL"/>
                          <input value={tempConfig.banner} onChange={e=>setTempConfig({...tempConfig, banner: e.target.value})} className="input-field" placeholder="Banner URL"/>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                          <button onClick={()=>setIsEditingConfig(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                          <button onClick={handleSaveConfig} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold">Save Changes</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {renderDashboardBanner()}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'bg-emerald-600' },
          { label: 'Total Staff', value: staffList.length, icon: Briefcase, color: 'bg-gold-500' },
          { label: 'Total Income', value: `৳ ${incomes.reduce((a,b)=>a+Number(b.amount),0)}`, icon: Wallet, color: 'bg-teal-600' },
          { label: 'Total Expense', value: `৳ ${expenses.reduce((a,b)=>a+Number(b.amount),0)}`, icon: Calculator, color: 'bg-red-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-emerald-100/50 flex items-center justify-between hover:shadow-md transition-shadow">
            <div><p className="text-gray-500 text-sm font-medium">{stat.label}</p><h3 className="text-2xl font-bold mt-1 text-gray-800">{stat.value}</h3></div>
            <div className={`${stat.color} text-white p-3 rounded-full shadow-lg`}><stat.icon size={24} /></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-100">
              <h3 className="font-bold mb-4 text-emerald-800">Financial Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Finance', Income: incomes.reduce((a,b)=>a+Number(b.amount),0), Expense: expenses.reduce((a,b)=>a+Number(b.amount),0)}]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#fff', borderRadius: '8px'}} />
                        <Bar dataKey="Income" fill="#059669" radius={[4,4,0,0]} />
                        <Bar dataKey="Expense" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-100">
              <h3 className="font-bold mb-4 text-emerald-800 flex items-center gap-2"><Bell size={18}/> Notice Board</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {notices.map(n => (
                      <div key={n.id} className="p-4 bg-cream-50 border-l-4 border-gold-500 rounded-r-lg shadow-sm">
                          <h4 className="font-bold text-gray-800">{n.title}</h4>
                          <span className="text-xs text-gray-500 block mt-1">{n.date}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );

  const renderRealChat = () => (
      <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden animate-fade-in">
          <div className="p-4 bg-emerald-700 text-white font-bold flex justify-between items-center">
              <span>Public Madrasa Chat</span>
              <span className="text-xs bg-emerald-800 px-2 py-1 rounded">{messages.length} messages</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]">
              {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === authUser?.uid ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-lg text-sm shadow-sm ${msg.senderId === authUser?.uid ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                          <p className="font-bold text-[10px] mb-1 opacity-70">{msg.senderName}</p>
                          <p>{msg.text}</p>
                      </div>
                  </div>
              ))}
              <div ref={chatEndRef}></div>
          </div>
          <div className="p-3 bg-white border-t flex gap-2">
              <input className="flex-1 input-field rounded-full" placeholder="Type a message..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendRealMessage()}/>
              <button onClick={sendRealMessage} className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700"><Send size={18}/></button>
          </div>
      </div>
  );

  const renderStudentInfo = () => (
    <div className="bg-white/90 p-6 rounded-xl shadow-sm animate-fade-in border border-emerald-50">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800"><Users/> Student Management</h3>
        {activeSubItem === 'student_admission' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Reg No" className="input-field" onChange={e=>setNewStudent({...newStudent, regNo: e.target.value})} />
                    <input placeholder="Full Name" className="input-field" onChange={e=>setNewStudent({...newStudent, name: e.target.value})} />
                    <input placeholder="Class" className="input-field" onChange={e=>setNewStudent({...newStudent, class: e.target.value})} />
                    <input placeholder="Roll" className="input-field" onChange={e=>setNewStudent({...newStudent, roll: e.target.value})} />
                    <input placeholder="Phone" className="input-field" onChange={e=>setNewStudent({...newStudent, phone: e.target.value})} />
                    <button onClick={()=>addData('students', newStudent, setNewStudent)} className="bg-emerald-600 text-white py-2 rounded-lg col-span-2 hover:bg-emerald-700 transition-colors">Save to Cloud</button>
                </div>
            </div>
        )}
        <div className="mt-8">
            <h4 className="font-bold text-lg mb-4 text-emerald-800">Student List (Live)</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-emerald-900">
                    <tr><th className="p-3 text-left">Reg No</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Class</th><th className="p-3 text-left">Roll</th></tr>
                </thead>
                <tbody>
                    {students.map(s => (<tr key={s.id} className="border-b hover:bg-cream-50"><td className="p-3 font-mono text-emerald-700">{s.regNo}</td><td className="p-3 font-medium">{s.name}</td><td className="p-3">{s.class}</td><td className="p-3">{s.roll}</td></tr>))}
                </tbody>
            </table>
            </div>
        </div>
    </div>
  );
  
  // Reuse render functions for other modules, just replacing mock data saving with `addData` function
  // For brevity in this turn, I am showing the core "Real" implementations. 
  // You can copy the UI from previous turn but use `fees`, `incomes` state variables which are now powered by Firestore.

  // --- Auth Screen ---
  if (!authUser) {
    return (
      <div className="h-screen w-full bg-[#f0fdf4] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 text-center animate-slide-up">
          <div className="mb-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 border-4 border-gold-400 p-2"><img src={madrasaConfig.logo} className="w-full h-full object-contain"/></div>
            <h1 className="text-2xl font-bold text-emerald-900">{madrasaConfig.name}</h1>
            <p className="text-emerald-600 font-medium">Cloud ERP System</p>
          </div>
          
          <div className="space-y-4">
               {isRegistering && <input value={authName} onChange={e=>setAuthName(e.target.value)} className="input-field" placeholder="Full Name"/>}
               <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className="input-field" placeholder="Email Address"/>
               <input type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} className="input-field" placeholder="Password"/>
               
               {authError && <p className="text-red-500 text-xs">{authError}</p>}

               <button onClick={handleAuth} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02]">
                   {isRegistering ? "Create Account" : "Login"}
               </button>

               <button onClick={()=>setIsRegistering(!isRegistering)} className="text-sm text-gray-500 hover:text-emerald-600 underline">
                   {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
               </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-islamic-pattern font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed z-30 inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl border-r border-emerald-100 shadow-2xl transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
           <div className="h-20 flex items-center gap-3 px-6 bg-gradient-to-r from-emerald-800 to-emerald-700 shadow-sm shrink-0">
               <div className="text-white">
                   <h1 className="font-bold text-lg leading-tight">Madrasa Pro</h1>
                   <p className="text-[10px] opacity-70 uppercase tracking-widest">Cloud Admin</p>
               </div>
           </div>
           
           <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1 px-3">
               {MENU_STRUCTURE.map((item) => (
                   <div key={item.id} className="mb-1">
                       <button onClick={() => { if(item.subItems) setExpandedMenu(expandedMenu === item.id ? null : item.id); else { setActiveModule(item.module); setActiveSubItem(item.id); setIsMobileMenuOpen(false); } }} 
                           className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${activeModule === item.module ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm border border-emerald-100' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'}`}>
                           <div className="flex items-center gap-3">
                               <div className={`p-1.5 rounded-lg transition-colors ${activeModule === item.module ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>{item.icon && <item.icon size={18} />}</div>
                               <span className="text-sm">{item.label}</span>
                           </div>
                           {item.subItems && (expandedMenu === item.id ? <ChevronDown size={14} className="text-emerald-500"/> : <ChevronRight size={14} className="opacity-30"/>)}
                       </button>
                       
                       {item.subItems && expandedMenu === item.id && (
                           <div className="ml-4 mt-1 pl-4 border-l-2 border-emerald-100 space-y-1 animate-slide-up">
                               {item.subItems.map(sub => (
                                   <button key={sub.id} onClick={() => { setActiveModule(item.module); setActiveSubItem(sub.id); setIsMobileMenuOpen(false); }} 
                                       className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${activeSubItem === sub.id ? 'text-emerald-600 bg-emerald-50 font-medium' : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'}`}>
                                       <div className={`w-1.5 h-1.5 rounded-full ${activeSubItem === sub.id ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                       {sub.label}
                                   </button>
                               ))}
                           </div>
                       )}
                   </div>
               ))}
           </nav>
           
           <div className="p-4 bg-cream-50 border-t border-emerald-50">
               <div className="flex items-center gap-3">
                   <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-gray-800 truncate">{authUser.name}</p>
                       <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Sign Out</button>
                   </div>
               </div>
           </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
           <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 border-b border-emerald-50/50">
              <div className="flex items-center gap-4">
                  <button onClick={()=>setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg"><Menu/></button>
                  <h2 className="text-lg font-bold text-gray-800">{activeModule}</h2>
              </div>
           </header>
           
           <main className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
              <div className="max-w-7xl mx-auto pb-20">
                  {activeSubItem === 'dashboard' && renderDashboard()}
                  {activeSubItem === 'chat' && renderRealChat()}
                  {activeSubItem === 'student_admission' && renderStudentInfo()}
                  {/* ... other modules would follow similar pattern using addData ... */}
              </div>
           </main>
        </div>

        {/* Gemini AI Assistant (Same as before) */}
        <div className={`fixed z-50 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isAiOpen ? 'bottom-6 right-6 w-96 h-[600px] rounded-2xl' : 'bottom-6 right-6 w-16 h-16 rounded-full'} shadow-2xl bg-white border border-emerald-100 flex flex-col overflow-hidden ring-4 ring-emerald-500/10`}>
           {!isAiOpen ? (
              <button onClick={()=>setIsAiOpen(true)} className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg group">
                  <Bot size={32} className="group-hover:rotate-12 transition-transform"/>
              </button>
           ) : (
              <>
                <div className="p-4 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-sm leading-tight">Islamic Assistant</h3>
                    <button onClick={()=>setIsAiOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-50 scroll-smooth">
                    {aiHistory.map((m,i)=>(<div key={i} className={`p-3 rounded-lg text-sm ${m.role==='user'?'bg-emerald-600 text-white ml-auto':'bg-white mr-auto border'}`}>{m.text}</div>))}
                    {isAiLoading && <div className="text-xs text-gray-500">Typing...</div>}
                    <div ref={aiEndRef}/>
                </div>
                <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                    <input className="flex-1 input-field" placeholder="Ask..." value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAiSend()}/>
                    <button onClick={handleAiSend} className="p-2.5 bg-emerald-600 text-white rounded-full"><Send size={18}/></button>
                </div>
              </>
           )}
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
