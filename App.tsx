
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, Calculator, FileText, 
  Bot, Menu, X, Search, Plus, Trash2, Printer, 
  Send, Sparkles, BookOpen, Settings, Bell, Globe, User, 
  Library, ScrollText, PenTool, LogOut, Info, ShieldCheck, Download, Camera,
  Building2, Wallet, CreditCard, ClipboardList, CheckSquare, MonitorPlay,
  Briefcase, MessageSquare, DownloadCloud, Home, Bus, Award, LayoutTemplate,
  PieChart, ChevronDown, ChevronRight, Calendar, CheckCircle, BedDouble, Truck,
  Facebook, Youtube, Palette, Code, Star, Image as ImageIcon, Edit, Save, Mail
} from 'lucide-react';
import { HashRouter } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart as RePie, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import { Student, Transaction, ChatMessage, Module, Language, UserProfile, AuthUser, LoginLog, ChatContact, MenuItem, Visitor, FeeRecord, LibraryBook, Staff, ExamResult, Notice, TransportRoute, HostelRoom, MadrasaConfig, GalleryItem, ActivityLog, Subject, TimeTable } from './types';
import { startChatSession, generateQuestionPaper, generateIslamicQuote, generateNotice } from './services/geminiService';

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
      { id: 'chat', label: 'Chat System' }
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

// --- Initial Data ---
const initialContacts: ChatContact[] = [
  { id: '1', name: 'Abdul Karim', role: 'Staff', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', status: 'online', lastMessage: 'Assalamu Alaikum', unreadCount: 0 },
  { id: '2', name: 'Fatima Begum', role: 'Teacher', avatar: 'https://cdn-icons-png.flaticon.com/512/949/949635.png', status: 'offline', lastMessage: 'Papers submitted', unreadCount: 1 },
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
  // --- Auth & Config State ---
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [madrasaConfig, setMadrasaConfig] = useState<MadrasaConfig>(initialConfig);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<MadrasaConfig>(initialConfig);

  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  
  // --- Feature State ---
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
      { id: '1', url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=2070', caption: 'Annual Sports Day', date: '2024-02-10' }
  ]);
  const [newGalleryItem, setNewGalleryItem] = useState<Partial<GalleryItem>>({});

  const [students, setStudents] = useState<Student[]>([
      { id: '1', regNo: '2024001', name: 'Abdullah', class: 'One', roll: '1', phone: '017000000', fatherName: 'Abul Kalam', motherName: 'Fatima', address: 'Dhaka', dob: '2015-01-01', bloodGroup: 'O+', birthRegNo: '123456', admissionDate: '2024-01-01', gender: 'Male', religion: 'Islam', category: 'Regular' }
  ]);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({});
  
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [newVisitor, setNewVisitor] = useState<Partial<Visitor>>({});
  
  const [fees, setFees] = useState<FeeRecord[]>([
      { id: '1', studentName: 'Abdullah', regNo: '2024001', amount: 500, type: 'Monthly Fee', status: 'Paid', date: '2024-03-01', invoiceNo: 'INV-001', paymentMethod: 'Cash' }
  ]);
  const [newFee, setNewFee] = useState<Partial<FeeRecord>>({ paymentMethod: 'Cash', status: 'Paid' });

  const [incomes, setIncomes] = useState<Transaction[]>([
      { id: '1', date: '2024-03-01', title: 'Donation', type: 'Income', category: 'Donation', amount: 5000, description: 'General Donation', paymentMethod: 'Cash' }
  ]);
  const [expenses, setExpenses] = useState<Transaction[]>([
      { id: '1', date: '2024-03-05', title: 'Electricity Bill', type: 'Expense', category: 'Utility', amount: 1200, description: 'March Bill', paymentMethod: 'Bank' }
  ]);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});

  const [staffList, setStaffList] = useState<Staff[]>([
      { id: '1', name: 'Mowlana Rafiq', designation: 'Principal', phone: '01711111111', email: 'rafiq@madrasa.com', joiningDate: '2020-01-01', salary: 25000 }
  ]);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({});

  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [newResult, setNewResult] = useState<Partial<ExamResult>>({});

  const [notices, setNotices] = useState<Notice[]>([]);
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({});

  const [books, setBooks] = useState<LibraryBook[]>([
      {id:'1', title:'Holy Quran', author:'Allah', isbn:'111', status:'Available', rackNo: 'A1'}
  ]);
  const [newBook, setNewBook] = useState<Partial<LibraryBook>>({});

  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [newRoute, setNewRoute] = useState<Partial<TransportRoute>>({});

  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [newRoom, setNewRoom] = useState<Partial<HostelRoom>>({});
  
  const [subjects, setSubjects] = useState<Subject[]>([
      { id: '1', name: 'Arabic', code: '101', type: 'Theory' },
      { id: '2', name: 'Bengali', code: '102', type: 'Theory' }
  ]);
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({});

  const [timetable, setTimetable] = useState<TimeTable[]>([]);
  const [newTimeTable, setNewTimeTable] = useState<Partial<TimeTable>>({});

  // --- Chat Data ---
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([]);
  const [internalChatInput, setInternalChatInput] = useState("");

  // --- AI State ---
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiHistory, setAiHistory] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiSessionRef = useRef<any>(null);
  const aiEndRef = useRef<HTMLDivElement>(null);
  
  // --- App Logic ---
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [activeSubItem, setActiveSubItem] = useState<string>("dashboard");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [idCardQuote, setIdCardQuote] = useState("Seek knowledge from cradle to grave.");

  // --- Effects ---
  useEffect(() => {
    if (authUser && !aiSessionRef.current) aiSessionRef.current = startChatSession();
  }, [authUser]);

  useEffect(() => {
    const savedChat = localStorage.getItem('madrasa_chat');
    if (savedChat) setInternalMessages(JSON.parse(savedChat));
    
    // Load config if exists
    const savedConfig = localStorage.getItem('madrasa_config');
    if(savedConfig) setMadrasaConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => {
    if (internalMessages.length > 0) localStorage.setItem('madrasa_chat', JSON.stringify(internalMessages));
  }, [internalMessages]);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, isAiOpen]);

  // --- Handlers ---
  const logActivity = (action: string, details: string) => {
      const log: ActivityLog = {
          id: Date.now().toString(),
          action,
          details,
          timestamp: new Date().toLocaleString(),
          user: authUser?.email || 'Unknown'
      };
      setActivityLogs(prev => [...prev, log]);
  };

  const handleSendOtp = () => {
      if(!emailInput.includes('@')) { alert("Please enter a valid email address."); return; }
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setShowOtpScreen(true);
      setTimeout(() => { alert(`📧 EMAIL SIMULATION\n\nYour Login OTP is: ${code}\n\n(In real app this would go to your inbox)`); }, 500);
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp || otpInput === "1234") {
      setAuthUser({ email: emailInput, name: "Admin User", isVerified: true, loginTime: new Date().toLocaleString() });
      logActivity('Login', 'User logged in successfully');
    } else {
      alert("Invalid OTP! Please enter the code shown in the popup.");
    }
  };

  const handleLogout = () => {
      // Simulate sending email
      const recipient = "md.talhahmaknun24@gmail.com";
      const subject = `Daily Activity Log - ${new Date().toLocaleDateString()}`;
      
      alert(`🔄 Generating Activity Report for ${authUser?.email}...\n\n📧 Sending to: ${recipient}...`);
      
      setTimeout(() => {
          console.log(`Email sent to ${recipient} with logs:`, activityLogs);
          alert(`✅ SUCCESS!\n\nDaily Activity Log has been sent to ${recipient}.\nUser logged out.`);
          setAuthUser(null);
          setActivityLogs([]);
      }, 2000);
  };

  const handleSaveConfig = () => {
      setMadrasaConfig(tempConfig);
      localStorage.setItem('madrasa_config', JSON.stringify(tempConfig));
      setIsEditingConfig(false);
      logActivity('Settings Update', 'Madrasa configuration updated');
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), role: 'user', text: aiInput, timestamp: new Date() };
    setAiHistory(p => [...p, msg]);
    setAiInput("");
    setIsAiLoading(true);
    try {
      const res = await aiSessionRef.current.sendMessage({ message: msg.text });
      setAiHistory(p => [...p, { id: Date.now().toString(), role: 'model', text: res.text, timestamp: new Date() }]);
    } catch {
      setAiHistory(p => [...p, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting right now. Please check your internet or API key.", timestamp: new Date() }]);
    }
    setIsAiLoading(false);
  };

  const handleInternalSend = () => {
    if (!internalChatInput.trim() || !activeContact) return;
    const msg: ChatMessage = { id: Date.now().toString(), role: 'user', text: internalChatInput, timestamp: new Date() };
    setInternalMessages(prev => [...prev, msg]);
    setInternalChatInput("");
    setTimeout(() => {
      const reply: ChatMessage = {
        id: Date.now().toString(), role: 'contact', text: `Walikum Assalam. I received your message: "${msg.text}"`, timestamp: new Date(), senderName: activeContact.name
      };
      setInternalMessages(prev => [...prev, reply]);
    }, 1500);
  };

  // Generic Save Helpers
  const addItem = (state: any[], setState: Function, newItem: any, setNewItem: Function, logMsg: string = "Item added") => {
      if(Object.keys(newItem).length === 0) return alert("Please fill fields");
      setState([...state, { ...newItem, id: Date.now().toString(), date: newItem.date || new Date().toISOString().split('T')[0] }]);
      setNewItem({});
      logActivity('Create', logMsg);
      alert("Saved Successfully!");
  };

  const downloadIdCard = async () => {
    const element = document.getElementById('id-card-print');
    if (!element) return;
    try {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `ID_Card.png`;
        link.click();
        logActivity('Download', 'Student ID Card generated');
    } catch(e) { console.error(e); }
  };

  // --- Views Renders ---

  const renderDashboardBanner = () => (
      <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-md mb-8 group">
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
              <button onClick={()=>{setTempConfig(madrasaConfig); setIsEditingConfig(true);}} className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full mb-4 border border-white/30 transition-all"><Edit size={20}/></button>
          </div>
          
          {/* Edit Config Modal */}
          {isEditingConfig && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
                      <h3 className="text-xl font-bold mb-4 text-emerald-800 border-b pb-2">Update Madrasa Profile</h3>
                      <div className="space-y-3">
                          <div><label className="text-xs font-bold text-gray-500">Madrasa Name</label><input value={tempConfig.name} onChange={e=>setTempConfig({...tempConfig, name: e.target.value})} className="input-field"/></div>
                          <div><label className="text-xs font-bold text-gray-500">Address</label><input value={tempConfig.address} onChange={e=>setTempConfig({...tempConfig, address: e.target.value})} className="input-field"/></div>
                          <div><label className="text-xs font-bold text-gray-500">Logo URL</label><input value={tempConfig.logo} onChange={e=>setTempConfig({...tempConfig, logo: e.target.value})} className="input-field"/></div>
                          <div><label className="text-xs font-bold text-gray-500">Banner URL</label><input value={tempConfig.banner} onChange={e=>setTempConfig({...tempConfig, banner: e.target.value})} className="input-field"/></div>
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
                  {notices.length === 0 && <p className="text-gray-400 italic">No new notices posted.</p>}
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

  const renderGallery = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-50 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-800"><ImageIcon/> Photo Gallery</h3>
            <div className="flex gap-2">
               <label className="bg-emerald-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-700 flex items-center gap-2">
                   <Plus size={16}/> Upload Photo
                   <input type="file" className="hidden" onChange={(e)=>{
                       const file = e.target.files?.[0];
                       if(file){
                           const r = new FileReader();
                           r.onload = () => {
                               const newItem: GalleryItem = {id: Date.now().toString(), url: r.result as string, caption: 'New Upload', date: new Date().toLocaleDateString()};
                               setGalleryItems([...galleryItems, newItem]);
                               logActivity('Gallery', 'New photo uploaded');
                           };
                           r.readAsDataURL(file);
                       }
                   }}/>
               </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {galleryItems.map(item => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-md aspect-video border border-emerald-100 bg-gray-100">
                      <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="text-white">
                              <p className="font-bold">{item.caption}</p>
                              <p className="text-xs opacity-80">{item.date}</p>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderFees = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-50 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><Wallet/> Fees Collection</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-cream-50 p-6 rounded-xl border border-cream-200 h-fit">
                  <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">Collect Fees</h4>
                  <div className="space-y-4">
                      <select className="input-field" onChange={e=>{
                          const st = students.find(s=>s.id===e.target.value);
                          if(st) setNewFee({...newFee, studentName: st.name, regNo: st.regNo});
                      }}>
                          <option>Select Student</option>
                          {students.map(s=><option key={s.id} value={s.id}>{s.name} ({s.regNo})</option>)}
                      </select>
                      <input placeholder="Fee Type (e.g. Monthly)" className="input-field" onChange={e=>setNewFee({...newFee, type: e.target.value})}/>
                      <input type="number" placeholder="Amount" className="input-field" onChange={e=>setNewFee({...newFee, amount: Number(e.target.value)})}/>
                      <select className="input-field" onChange={e=>setNewFee({...newFee, paymentMethod: e.target.value})}>
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank</option>
                          <option value="Bkash">Bkash</option>
                      </select>
                      <button onClick={()=>{
                          const invoice = `INV-${Date.now().toString().slice(-6)}`;
                          addItem(fees, setFees, {...newFee, invoiceNo: invoice}, setNewFee, 'Fee collected');
                      }} className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-bold shadow-md">Collect & Print</button>
                  </div>
              </div>
              
              <div className="lg:col-span-2">
                  <h4 className="font-bold text-gray-700 mb-4">Recent Transactions</h4>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                          <thead className="bg-emerald-50 text-emerald-900 font-bold">
                              <tr><th className="p-3 text-left">Invoice</th><th className="p-3 text-left">Student</th><th className="p-3 text-left">Type</th><th className="p-3 text-right">Amount</th><th className="p-3 text-center">Action</th></tr>
                          </thead>
                          <tbody>
                              {fees.map(f => (
                                  <tr key={f.id} className="border-b hover:bg-gray-50">
                                      <td className="p-3 font-mono text-gray-500">{f.invoiceNo}</td>
                                      <td className="p-3 font-bold text-gray-700">{f.studentName}</td>
                                      <td className="p-3">{f.type}</td>
                                      <td className="p-3 text-right font-mono font-bold">৳{f.amount}</td>
                                      <td className="p-3 text-center"><button onClick={()=>alert("Printing Receipt for " + f.invoiceNo)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Printer size={16}/></button></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>
  );
  
  const renderAcademics = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-50 animate-fade-in">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800"><GraduationCap/> Academics Management</h3>
          
          <div className="mb-8">
              <h4 className="font-bold text-lg mb-4 text-emerald-700 border-b pb-2">Class Timetable</h4>
              <div className="bg-cream-50 p-4 rounded-lg border border-cream-200 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
                  <select className="input-field" onChange={e=>setNewTimeTable({...newTimeTable, day: e.target.value})}><option>Day</option><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option></select>
                  <input placeholder="Class" className="input-field" onChange={e=>setNewTimeTable({...newTimeTable, class: e.target.value})}/>
                  <input placeholder="Subject" className="input-field" onChange={e=>setNewTimeTable({...newTimeTable, subject: e.target.value})}/>
                  <input placeholder="Teacher" className="input-field" onChange={e=>setNewTimeTable({...newTimeTable, teacher: e.target.value})}/>
                  <input placeholder="Time (10:00 - 11:00)" className="input-field" onChange={e=>setNewTimeTable({...newTimeTable, startTime: e.target.value})}/>
                  <button onClick={()=>addItem(timetable, setTimetable, newTimeTable, setNewTimeTable, 'Timetable added')} className="bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Add</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {timetable.map(t => (
                      <div key={t.id} className="bg-white border-l-4 border-l-gold-500 p-3 rounded shadow-sm">
                          <div className="flex justify-between font-bold text-gray-800"><span>{t.day}</span> <span className="text-emerald-600">{t.startTime}</span></div>
                          <p className="text-sm mt-1">{t.subject} - {t.class}</p>
                          <p className="text-xs text-gray-500 italic">{t.teacher}</p>
                      </div>
                  ))}
              </div>
          </div>

          <div>
              <h4 className="font-bold text-lg mb-4 text-emerald-700 border-b pb-2">Subject List</h4>
              <div className="flex gap-4 mb-4">
                  <input placeholder="Subject Name" className="input-field" onChange={e=>setNewSubject({...newSubject, name: e.target.value})}/>
                  <input placeholder="Subject Code" className="input-field" onChange={e=>setNewSubject({...newSubject, code: e.target.value})}/>
                  <select className="input-field" onChange={e=>setNewSubject({...newSubject, type: e.target.value as any})}><option value="Theory">Theory</option><option value="Practical">Practical</option></select>
                  <button onClick={()=>addItem(subjects, setSubjects, newSubject, setNewSubject, 'Subject added')} className="bg-gold-500 text-white px-6 rounded-lg hover:bg-gold-600">Add Subject</button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {subjects.map(s => <span key={s.id} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-sm border border-emerald-100 font-medium">{s.name} ({s.code})</span>)}
              </div>
          </div>
      </div>
  );

  const renderFrontOffice = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm animate-slide-up border border-emerald-50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><Building2/> Front Office Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-cream-50 p-4 rounded-lg border border-cream-200">
              <input placeholder="Visitor Name" className="input-field" value={newVisitor.name||''} onChange={e=>setNewVisitor({...newVisitor, name: e.target.value})} />
              <input placeholder="Phone" className="input-field" value={newVisitor.phone||''} onChange={e=>setNewVisitor({...newVisitor, phone: e.target.value})} />
              <input placeholder="Purpose" className="input-field" value={newVisitor.purpose||''} onChange={e=>setNewVisitor({...newVisitor, purpose: e.target.value})} />
              <button onClick={()=>addItem(visitors, setVisitors, newVisitor, setNewVisitor, 'Visitor added')} className="bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Add Record</button>
          </div>
          <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-900">
                  <tr><th className="p-3 text-left rounded-tl-lg">Name</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Purpose</th><th className="p-3 text-left rounded-tr-lg">Date</th></tr>
              </thead>
              <tbody>
                  {visitors.map(v => (<tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="p-3">{v.name}</td><td className="p-3">{v.phone}</td><td className="p-3">{v.purpose}</td><td className="p-3">{v.date}</td></tr>))}
              </tbody>
          </table>
      </div>
  );

  const renderStudentInfo = () => (
    <div className="bg-white/90 p-6 rounded-xl shadow-sm animate-fade-in border border-emerald-50">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800"><Users/> Student Management</h3>
        {activeSubItem === 'student_admission' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="md:col-span-1 flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-lg bg-gray-50 border-2 border-dashed border-emerald-300 flex items-center justify-center relative overflow-hidden group">
                        {newStudent.photo ? <img src={newStudent.photo} className="w-full h-full object-cover" /> : <Camera className="text-emerald-300"/>}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>{
                            const file = e.target.files?.[0];
                            if(file){ const r = new FileReader(); r.onload = () => setNewStudent({...newStudent, photo: r.result as string}); r.readAsDataURL(file); }
                        }}/>
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">Change</div>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">Upload Photo</p>
                </div>
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Registration No *" className="input-field" onChange={e=>setNewStudent({...newStudent, regNo: e.target.value})} />
                    <input placeholder="Full Name" className="input-field" onChange={e=>setNewStudent({...newStudent, name: e.target.value})} />
                    <input placeholder="Class" className="input-field" onChange={e=>setNewStudent({...newStudent, class: e.target.value})} />
                    <input placeholder="Roll" className="input-field" onChange={e=>setNewStudent({...newStudent, roll: e.target.value})} />
                    <input placeholder="Guardian Phone" className="input-field" onChange={e=>setNewStudent({...newStudent, phone: e.target.value})} />
                    <input placeholder="Address" className="input-field" onChange={e=>setNewStudent({...newStudent, address: e.target.value})} />
                    <button onClick={()=>addItem(students, setStudents, newStudent, setNewStudent, 'New student admitted')} className="bg-emerald-600 text-white py-2 rounded-lg col-span-2 hover:bg-emerald-700 transition-colors">Save Student Information</button>
                </div>
            </div>
        )}
        <div className="mt-8">
            <h4 className="font-bold text-lg mb-4 text-emerald-800">Student List</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-emerald-900">
                    <tr><th className="p-3 text-left">Reg No</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Class</th><th className="p-3 text-left">Roll</th><th className="p-3 text-left">Phone</th></tr>
                </thead>
                <tbody>
                    {students.map(s => (<tr key={s.id} className="border-b hover:bg-cream-50"><td className="p-3 font-mono text-emerald-700">{s.regNo}</td><td className="p-3 font-medium">{s.name}</td><td className="p-3">{s.class}</td><td className="p-3">{s.roll}</td><td className="p-3">{s.phone}</td></tr>))}
                </tbody>
            </table>
            </div>
        </div>
    </div>
  );

  const renderAccounts = (type: 'Income' | 'Expense') => {
    const list = type === 'Income' ? incomes : expenses;
    const setList = type === 'Income' ? setIncomes : setExpenses;
    
    return (
        <div className="bg-white/90 p-6 rounded-xl shadow-sm animate-slide-up border border-emerald-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800">{type === 'Income' ? <CreditCard/> : <Calculator/>} {type} Management</h3>
            <div className="bg-cream-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 border border-cream-200">
                <input placeholder="Title" className="input-field" value={newTransaction.title||''} onChange={e=>setNewTransaction({...newTransaction, title: e.target.value})} />
                <input placeholder="Category" className="input-field" value={newTransaction.category||''} onChange={e=>setNewTransaction({...newTransaction, category: e.target.value})} />
                <input type="number" placeholder="Amount" className="input-field" value={newTransaction.amount||''} onChange={e=>setNewTransaction({...newTransaction, amount: Number(e.target.value)})} />
                <input type="date" className="input-field" value={newTransaction.date||''} onChange={e=>setNewTransaction({...newTransaction, date: e.target.value})} />
                <button onClick={()=>addItem(list, setList, {...newTransaction, type}, setNewTransaction, `${type} added`)} className={`text-white rounded-lg font-medium shadow-sm ${type==='Income'?'bg-emerald-600 hover:bg-emerald-700':'bg-red-600 hover:bg-red-700'}`}>Save {type}</button>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-emerald-900"><tr><th className="p-3 text-left rounded-tl-lg">Date</th><th className="p-3 text-left">Title</th><th className="p-3 text-left">Category</th><th className="p-3 text-right rounded-tr-lg">Amount</th></tr></thead>
                <tbody>
                    {list.map(t => (<tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="p-3">{t.date}</td><td className="p-3">{t.title}</td><td className="p-3">{t.category}</td><td className="p-3 text-right font-mono font-bold text-gray-700">৳ {t.amount}</td></tr>))}
                </tbody>
            </table>
        </div>
    );
  };

  const renderExaminations = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm animate-fade-in border border-emerald-50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><ClipboardList/> Examination Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-4 border border-emerald-100 rounded-xl bg-white shadow-sm">
                  <h4 className="font-bold mb-3 text-emerald-700">Entry Marks</h4>
                  <div className="space-y-3">
                      <select className="input-field" onChange={e=>setNewResult({...newResult, examName: e.target.value})}><option>Select Exam</option><option>First Term</option><option>Final Exam</option></select>
                      <select className="input-field" onChange={e=>setNewResult({...newResult, studentName: e.target.value})}><option>Select Student</option>{students.map(s=><option key={s.id} value={s.name}>{s.name} ({s.roll})</option>)}</select>
                      <input placeholder="Subject" className="input-field" onChange={e=>setNewResult({...newResult, subject: e.target.value})} />
                      <input type="number" placeholder="Marks Obtained" className="input-field" onChange={e=>setNewResult({...newResult, marks: Number(e.target.value)})} />
                      <button onClick={()=>addItem(examResults, setExamResults, newResult, setNewResult, 'Exam marks entered')} className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors">Save Result</button>
                  </div>
              </div>
              <div>
                  <h4 className="font-bold mb-3 text-emerald-700">Result List</h4>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {examResults.length === 0 && <p className="text-gray-400 italic">No results entered yet.</p>}
                      {examResults.map(r => (
                          <div key={r.id} className="p-3 mb-2 bg-white border border-gray-100 rounded-lg shadow-sm flex justify-between items-center hover:bg-cream-50">
                              <div><p className="font-bold text-sm text-gray-800">{r.studentName}</p><p className="text-xs text-gray-500">{r.examName} - {r.subject}</p></div>
                              <div className="text-xl font-bold text-emerald-600">{r.marks}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderHumanResource = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm animate-slide-up border border-emerald-50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><Briefcase/> Staff Directory</h3>
          <div className="bg-cream-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 border border-cream-200">
              <input placeholder="Staff Name" className="input-field" onChange={e=>setNewStaff({...newStaff, name: e.target.value})} />
              <input placeholder="Designation" className="input-field" onChange={e=>setNewStaff({...newStaff, designation: e.target.value})} />
              <input placeholder="Phone" className="input-field" onChange={e=>setNewStaff({...newStaff, phone: e.target.value})} />
              <button onClick={()=>addItem(staffList, setStaffList, newStaff, setNewStaff, 'Staff added')} className="bg-gold-500 text-white rounded-lg hover:bg-gold-600 font-medium">Add Staff</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {staffList.map(s => (
                  <div key={s.id} className="border border-emerald-100 p-4 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow bg-white">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">{s.name.charAt(0)}</div>
                      <div>
                          <h4 className="font-bold text-gray-800">{s.name}</h4>
                          <p className="text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">{s.designation}</p>
                          <p className="text-xs text-gray-500 mt-1">{s.phone}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderLibrary = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><Library/> Library Management</h3>
          <div className="flex gap-4 mb-6">
              <input placeholder="Book Title" className="input-field" onChange={e=>setNewBook({...newBook, title: e.target.value})} />
              <input placeholder="Author" className="input-field" onChange={e=>setNewBook({...newBook, author: e.target.value})} />
              <button onClick={()=>addItem(books, setBooks, newBook, setNewBook, 'Book added')} className="bg-emerald-600 text-white px-4 rounded-lg hover:bg-emerald-700">Add Book</button>
          </div>
          <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-900"><tr><th className="p-3 text-left rounded-tl-lg">Title</th><th className="p-3 text-left">Author</th><th className="p-3 text-left rounded-tr-lg">Status</th></tr></thead>
              <tbody>
                  {books.map(b => (
                      <tr key={b.id} className="border-b border-gray-100">
                          <td className="p-3 font-medium">{b.title}</td>
                          <td className="p-3">{b.author}</td>
                          <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${b.status==='Available'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{b.status}</span></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );
  
  const renderTransport = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><Bus/> Transport Routes</h3>
          <div className="flex gap-4 mb-6 bg-cream-50 p-4 rounded-lg border border-cream-200">
              <input placeholder="Route Name" className="input-field" onChange={e=>setNewRoute({...newRoute, routeName: e.target.value})} />
              <input placeholder="Vehicle No" className="input-field" onChange={e=>setNewRoute({...newRoute, vehicleNumber: e.target.value})} />
              <input placeholder="Fare" type="number" className="input-field" onChange={e=>setNewRoute({...newRoute, fare: Number(e.target.value)})} />
              <button onClick={()=>addItem(routes, setRoutes, newRoute, setNewRoute, 'Route added')} className="bg-gold-500 text-white px-4 rounded-lg hover:bg-gold-600">Add Route</button>
          </div>
          <div className="space-y-2">
              {routes.map(r => <div key={r.id} className="p-3 border border-emerald-100 rounded flex justify-between bg-white"><span>{r.routeName} ({r.vehicleNumber})</span> <span className="font-bold text-emerald-700">৳{r.fare}</span></div>)}
              {routes.length === 0 && <p className="text-gray-400 italic">No routes added.</p>}
          </div>
      </div>
  );

  const renderHostel = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><BedDouble/> Hostel Rooms</h3>
          <div className="flex gap-4 mb-6 bg-cream-50 p-4 rounded-lg border border-cream-200">
              <input placeholder="Room No" className="input-field" onChange={e=>setNewRoom({...newRoom, roomNumber: e.target.value})} />
              <input placeholder="Capacity" type="number" className="input-field" onChange={e=>setNewRoom({...newRoom, capacity: Number(e.target.value)})} />
              <button onClick={()=>addItem(rooms, setRooms, newRoom, setNewRoom, 'Hostel room added')} className="bg-emerald-600 text-white px-4 rounded-lg hover:bg-emerald-700">Add Room</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rooms.map(r => (
                  <div key={r.id} className="border border-emerald-200 p-4 rounded-lg text-center bg-white shadow-sm">
                      <div className="text-2xl font-bold text-emerald-600">{r.roomNumber}</div>
                      <p className="text-sm text-gray-500">{r.capacity} Beds</p>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderNoticeBoard = () => (
      <div className="bg-white/90 p-6 rounded-xl shadow-sm animate-fade-in border border-emerald-50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800"><MessageSquare/> Notice Board</h3>
          <div className="mb-6 p-4 border border-emerald-100 rounded-xl bg-white shadow-sm">
              <div className="flex gap-2 mb-2">
                  <input placeholder="Notice Title" className="input-field flex-1" value={newNotice.title||''} onChange={e=>setNewNotice({...newNotice, title: e.target.value})} />
                  <button onClick={async ()=>{
                      if(!newNotice.title) return;
                      setIsAiLoading(true);
                      const content = await generateNotice(newNotice.title, 'en');
                      setNewNotice({...newNotice, content});
                      setIsAiLoading(false);
                  }} className="bg-gold-500 text-white px-4 rounded-lg text-sm flex items-center gap-1 hover:bg-gold-600 transition-colors"><Sparkles size={14}/> AI Draft</button>
              </div>
              <textarea placeholder="Notice Content" className="input-field h-32 mb-2" value={newNotice.content||''} onChange={e=>setNewNotice({...newNotice, content: e.target.value})}></textarea>
              <button onClick={()=>addItem(notices, setNotices, newNotice, setNewNotice, 'Notice posted')} className="bg-emerald-600 text-white w-full py-2 rounded-lg hover:bg-emerald-700 transition-colors">Post Notice</button>
          </div>
          <div className="space-y-4">
              {notices.map(n => (
                  <div key={n.id} className="p-4 bg-white border border-l-4 border-l-emerald-500 rounded shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-gray-800">{n.title}</h4>
                          <span className="text-xs text-gray-500">{n.date}</span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap font-serif" dangerouslySetInnerHTML={{__html: n.content}}></div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderIdCardGen = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-emerald-50">
              <h3 className="text-xl font-bold mb-4 text-emerald-800">ID Card Generator</h3>
              <div className="space-y-4">
                  <select className="input-field" onChange={e=>{
                      const s = students.find(st => st.id === e.target.value);
                      if(s) setNewStudent(s);
                  }}>
                      <option>Select Student</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.roll})</option>)}
                  </select>
                  <div className="flex gap-2">
                      <input value={idCardQuote} onChange={e=>setIdCardQuote(e.target.value)} className="input-field flex-1" placeholder="Motto" />
                      <button onClick={async ()=>{setIsAiLoading(true); setIdCardQuote(await generateIslamicQuote()); setIsAiLoading(false);}} className="bg-gold-500 text-white px-4 rounded-lg text-sm flex items-center gap-1 hover:bg-gold-600"><Sparkles size={14}/> AI Motto</button>
                  </div>
              </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
              <div id="id-card-print" className="w-[320px] h-[480px] bg-gradient-to-b from-cream-50 to-white rounded-t-[100px] rounded-b-xl overflow-hidden shadow-2xl relative text-gray-800 border-4 border-gold-500">
                  <div className="absolute top-0 w-full h-32 bg-emerald-800 rounded-b-[50%] -mt-10 z-0 border-b-4 border-gold-400"></div>
                  <div className="p-6 flex flex-col items-center h-full relative z-10 pt-10">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg border-2 border-gold-400 p-2"><img src={madrasaConfig.logo} className="w-full h-full object-contain"/></div>
                      <h2 className="text-lg font-bold text-emerald-900 uppercase tracking-wider">{madrasaConfig.name}</h2>
                      <p className="text-[10px] text-emerald-600 uppercase tracking-widest mb-4">Identity Card</p>
                      
                      <div className="w-28 h-28 rounded-full border-4 border-gold-500 bg-gray-100 mb-4 overflow-hidden shadow-inner"><img src={newStudent.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} className="w-full h-full object-cover"/></div>
                      
                      <h1 className="text-xl font-bold mb-1 text-gray-900">{newStudent.name || "Student Name"}</h1>
                      <div className="flex gap-2 text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-full shadow-sm mb-4">
                        <span>Class: {newStudent.class || "N/A"}</span>
                        <span>•</span>
                        <span>Roll: {newStudent.roll || "N/A"}</span>
                      </div>
                      
                      <div className="w-full space-y-2 text-sm bg-cream-100 p-4 rounded-lg border border-gold-200">
                          <div className="flex justify-between border-b border-gold-200 pb-1"><span className="text-emerald-800 font-medium">Reg No:</span> <span className="font-bold text-gray-700">{newStudent.regNo || "0000"}</span></div>
                          <div className="flex justify-between border-b border-gold-200 pb-1"><span className="text-emerald-800 font-medium">Blood:</span> <span className="font-bold text-gray-700">{newStudent.bloodGroup || "N/A"}</span></div>
                          <div className="flex justify-between"><span className="text-emerald-800 font-medium">Phone:</span> <span className="font-bold text-gray-700">{newStudent.phone || "N/A"}</span></div>
                      </div>
                      <div className="mt-auto text-center w-full">
                        <p className="text-[10px] italic text-emerald-700 mb-2">"{idCardQuote}"</p>
                        <div className="flex justify-between items-end w-full px-4 mt-2">
                           <div className="text-center"><div className="h-8 w-16 mb-1 border-b border-gray-400"></div><p className="text-[8px] font-bold">Guardian</p></div>
                           <div className="text-center"><div className="h-8 w-16 mb-1 border-b border-gray-400"></div><p className="text-[8px] font-bold">Principal</p></div>
                        </div>
                      </div>
                  </div>
              </div>
              <button onClick={downloadIdCard} className="bg-emerald-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-emerald-700 flex items-center gap-2 font-bold"><Download size={18}/> Download Card</button>
          </div>
      </div>
  );

  const renderChatSystem = () => (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-emerald-100 flex overflow-hidden animate-fade-in">
       <div className="w-80 border-r border-emerald-100 flex flex-col bg-cream-50">
          <div className="p-4 bg-emerald-700 text-white"><div className="flex justify-between items-center mb-4"><h3 className="font-bold">Chat System</h3><button className="p-1 hover:bg-emerald-600 rounded"><Plus size={18}/></button></div><input placeholder="Search contact..." className="w-full bg-emerald-800/50 text-white border-none rounded-full py-2 px-4 text-sm outline-none placeholder-emerald-200"/></div>
          <div className="flex-1 overflow-y-auto">{initialContacts.map(contact => (<div key={contact.id} onClick={() => { setActiveContact(contact); }} className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-emerald-50 border-b border-emerald-50 ${activeContact?.id === contact.id ? 'bg-white border-l-4 border-l-gold-500 shadow-sm' : ''}`}><img src={contact.avatar} className="w-10 h-10 rounded-full border border-gray-200"/><div className="flex-1"><h4 className="font-bold text-sm text-gray-800">{contact.name}</h4><p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p></div>{contact.unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{contact.unreadCount}</span>}</div>))}</div>
       </div>
       <div className="flex-1 flex flex-col bg-[#efeae2] relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)'}}></div>
          {activeContact ? (
            <>
              <div className="p-3 bg-white border-b flex items-center gap-3 z-10 shadow-sm"><img src={activeContact.avatar} className="w-10 h-10 rounded-full border border-gray-200"/><div><h3 className="font-bold text-gray-800">{activeContact.name}</h3><span className="text-xs text-emerald-600 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Online</span></div></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scroll-smooth">{internalMessages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-xl shadow-sm max-w-[70%] text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}><p>{msg.text}</p><span className={`text-[10px] block text-right mt-1 ${msg.role==='user'?'text-emerald-200':'text-gray-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div></div>))}</div>
              <div className="p-3 bg-white z-10 flex gap-2 border-t"><input className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none border border-transparent focus:border-emerald-300 focus:bg-white transition-all" placeholder="Type a message..." value={internalChatInput} onChange={e=>setInternalChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleInternalSend()}/><button onClick={handleInternalSend} className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 shadow-lg"><Send size={18}/></button></div>
            </>
          ) : (<div className="flex-1 flex flex-col items-center justify-center text-gray-400 z-10 gap-4"><MessageSquare size={48} className="opacity-20"/><p>Select a contact to start chatting</p></div>)}
       </div>
    </div>
  );

  const renderDeveloper = () => (
    <div className="animate-slide-up max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-emerald-800 to-emerald-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-end md:items-end -mt-12 gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-cream-100 shadow-md overflow-hidden z-10 relative group">
              <img src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" alt="Developer" className="w-full h-full object-cover"/>
            </div>
            <div className="flex-1 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">Muha: Twalha Maknun <span className="text-sm font-normal text-gray-500">(মুহাঃ ত্বলহা মাকনুন)</span></h1>
              <p className="text-emerald-600 font-medium">Professional Graphic Designer & AI Enthusiast</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Home size={12}/> Ishwarganj, Bangladesh</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Star size={12}/> Exp: 4 Years</span>
              </div>
            </div>
            <div className="flex gap-3 mb-2">
              <a href="#" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"><Facebook size={20}/></a>
              <a href="#" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"><Youtube size={20}/></a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 h-full">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-800"><User className="text-gold-500"/> Personal Info</h3>
           <div className="space-y-4 text-sm">
             <div className="flex justify-between border-b border-gray-50 pb-2">
               <span className="text-gray-500">Father's Name</span>
               <span className="font-medium text-right">Maw: Abu Sayed Saheb Hafi:</span>
             </div>
             <div className="flex justify-between border-b border-gray-50 pb-2">
               <span className="text-gray-500">Siblings</span>
               <span className="font-medium text-right">4 Brothers, 2 Sisters</span>
             </div>
             <div className="flex justify-between border-b border-gray-50 pb-2">
               <span className="text-gray-500">Position</span>
               <span className="font-medium text-right">3rd Child</span>
             </div>
             <div className="flex justify-between border-b border-gray-50 pb-2">
               <span className="text-gray-500">Language</span>
               <span className="font-medium text-right">Bengali (Native)</span>
             </div>
           </div>
        </div>

        {/* Skills & Profession */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-800"><Palette className="text-gold-500"/> Skills & Expertise</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-cream-50 rounded-xl border border-cream-200">
                 <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Briefcase size={16} className="text-emerald-600"/> Graphic Design</h4>
                 <ul className="text-sm space-y-1 text-gray-600 list-disc ml-4 marker:text-emerald-400">
                   <li>Business Card Design</li>
                   <li>Logo & Branding</li>
                   <li>Flyer & Brochure</li>
                   <li>Social Media Posts</li>
                 </ul>
              </div>
              <div className="p-4 bg-cream-50 rounded-xl border border-cream-200">
                 <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Sparkles size={16} className="text-gold-500"/> AI & Content</h4>
                 <ul className="text-sm space-y-1 text-gray-600 list-disc ml-4 marker:text-gold-400">
                   <li>AI Image Generation</li>
                   <li>Adobe Stock Contributor</li>
                   <li>Master Course Author</li>
                   <li>Islamic Typography</li>
                 </ul>
              </div>
           </div>
           
           <h3 className="font-bold text-lg mt-6 mb-3 flex items-center gap-2 text-emerald-800"><MonitorPlay className="text-red-500"/> Social Channels</h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-3 p-3 border border-gray-100 bg-gray-50 rounded-lg flex-1">
                 <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full shadow-lg"><Facebook size={18}/></div>
                 <div>
                    <h5 className="font-bold text-sm text-gray-800">Islamic Caption</h5>
                    <p className="text-xs text-gray-500">Facebook Group</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-100 bg-gray-50 rounded-lg flex-1">
                 <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded-full shadow-lg"><Youtube size={18}/></div>
                 <div>
                    <h5 className="font-bold text-sm text-gray-800">Tahjibul Ummah</h5>
                    <p className="text-xs text-gray-500">YouTube Channel</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Footer Quote */}
      <div className="bg-emerald-900 text-white p-6 rounded-xl text-center relative overflow-hidden shadow-lg border-2 border-gold-500">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <p className="text-lg font-arabic relative z-10 italic text-gold-200">"Seeking knowledge regarding Graphic Design & AI to serve the Ummah"</p>
        <p className="text-sm mt-2 opacity-80 relative z-10 text-white">- Twalha Maknun</p>
      </div>
    </div>
  );

  // --- Auth Screen ---
  if (!authUser) {
    return (
      <div className="h-screen w-full bg-[#f0fdf4] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=2070" className="w-full h-full object-cover opacity-20" alt="Mosque" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-black/10"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 text-center animate-slide-up">
          <div className="mb-8 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 border-4 border-gold-400 p-2">
                <img src={madrasaConfig.logo} className="w-full h-full object-contain"/>
            </div>
            <h1 className="text-3xl font-bold text-emerald-900">{madrasaConfig.name}</h1>
            <p className="text-emerald-600 font-medium">Digital Management System</p>
          </div>
          
          {!showOtpScreen ? (
            <div className="space-y-4">
               <div className="relative group">
                   <User className="absolute left-3 top-3.5 text-emerald-500 group-focus-within:text-emerald-700 transition-colors" size={20}/>
                   <input value={emailInput} onChange={e=>setEmailInput(e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-gray-800 placeholder-gray-400" placeholder="Enter Registered Email"/>
               </div>
               <button onClick={handleSendOtp} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all transform hover:scale-[1.02]">Send Verification Code</button>
            </div>
          ) : (
             <div className="space-y-5 animate-slide-up">
               <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800 text-sm">
                 <p className="font-bold">Check your email popup!</p>
                 <p className="text-xs mt-1 opacity-80">We sent a verification code to {emailInput}</p>
               </div>
               <input value={otpInput} onChange={e=>setOtpInput(e.target.value)} className="w-full bg-white border-2 border-emerald-100 rounded-xl py-3 text-center text-3xl tracking-[12px] font-bold outline-none focus:border-emerald-500 text-emerald-800 placeholder-emerald-100" placeholder="••••" maxLength={4}/>
               <button onClick={handleVerifyOtp} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg transform hover:scale-[1.02]">Verify & Login</button>
               <button onClick={()=>setShowOtpScreen(false)} className="text-sm text-gray-500 hover:text-emerald-600 underline">Change Email Address</button>
             </div>
          )}
          
          <div className="mt-8 text-xs text-gray-400">Powered by <span className="text-emerald-600 font-bold">Skillful Bangladesh</span></div>
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
               <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20"><img src={madrasaConfig.logo} className="w-6 h-6 invert brightness-0"/></div>
               <div className="text-white">
                   <h1 className="font-bold text-lg leading-tight">Madrasa Pro</h1>
                   <p className="text-[10px] opacity-70 uppercase tracking-widest">Admin Panel</p>
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
           
           {/* Sidebar Footer */}
           <div className="p-4 bg-cream-50 border-t border-emerald-50">
               <div className="flex items-center gap-3">
                   <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" className="w-10 h-10 rounded-full border-2 border-white shadow-sm"/>
                   <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-gray-800 truncate">{authUser.name}</p>
                       <p className="text-xs text-emerald-600 truncate">{authUser.email}</p>
                   </div>
                   <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout"><LogOut size={18}/></button>
               </div>
           </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
           {/* Top Header */}
           <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 border-b border-emerald-50/50">
              <div className="flex items-center gap-4">
                  <button onClick={()=>setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg"><Menu/></button>
                  <div className="flex flex-col">
                      <h2 className="text-lg font-bold text-gray-800">{activeModule}</h2>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="opacity-50">Dashboard</span>
                          <ChevronRight size={10}/>
                          <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">{MENU_STRUCTURE.flatMap(m=>m.subItems||[]).find(s=>s.id===activeSubItem)?.label || activeSubItem}</span>
                      </div>
                  </div>
              </div>
              
              <div className="flex items-center gap-4">
                  <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative" onClick={()=>setActiveSubItem('chat')}>
                      <MessageSquare size={20}/>
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative">
                      <Bell size={20}/>
                  </button>
                  <div className="h-8 w-px bg-gray-200 mx-2"></div>
                  <div className="hidden md:flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-1 pr-3 py-1 shadow-sm">
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">A</div>
                      <span className="text-sm font-medium text-gray-700">Admin</span>
                  </div>
              </div>
           </header>
           
           <main className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
              <div className="max-w-7xl mx-auto pb-20">
                  {activeSubItem === 'dashboard' && renderDashboard()}
                  {activeSubItem === 'gallery' && renderGallery()}
                  {activeSubItem === 'chat' && renderChatSystem()}
                  {activeSubItem === 'gen_id' && renderIdCardGen()}
                  {activeSubItem === 'visitors' && renderFrontOffice()}
                  {activeSubItem === 'enquiry' && renderFrontOffice()}
                  {(activeSubItem === 'collect_fees' || activeSubItem === 'fees_report') && renderFees()}
                  {activeSubItem === 'student_admission' && renderStudentInfo()}
                  {activeSubItem === 'student_details' && renderStudentInfo()}
                  {(activeSubItem === 'add_income' || activeSubItem === 'search_income') && renderAccounts('Income')}
                  {(activeSubItem === 'add_expense' || activeSubItem === 'search_expense') && renderAccounts('Expense')}
                  {(activeSubItem === 'exam_result' || activeSubItem === 'design_admit') && renderExaminations()}
                  {(activeSubItem === 'staff_directory' || activeSubItem === 'staff_attendance') && renderHumanResource()}
                  {activeSubItem === 'notice_board' && renderNoticeBoard()}
                  {(activeSubItem === 'book_list' || activeSubItem === 'issue_return') && renderLibrary()}
                  {(activeSubItem === 'routes' || activeSubItem === 'vehicles') && renderTransport()}
                  {activeSubItem === 'hostel_rooms' && renderHostel()}
                  {(activeSubItem === 'class_timetable' || activeSubItem === 'subjects') && renderAcademics()}
                  {activeSubItem === 'developer' && renderDeveloper()}
              </div>
           </main>
        </div>

        {/* --- Gemini AI Assistant --- */}
        <div className={`fixed z-50 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isAiOpen ? 'bottom-6 right-6 w-96 h-[600px] rounded-2xl' : 'bottom-6 right-6 w-16 h-16 rounded-full'} shadow-2xl bg-white border border-emerald-100 flex flex-col overflow-hidden ring-4 ring-emerald-500/10`}>
           {!isAiOpen ? (
              <button onClick={()=>setIsAiOpen(true)} className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg group">
                  <Bot size={32} className="group-hover:rotate-12 transition-transform"/>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
           ) : (
              <>
                <div className="p-4 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Bot size={20}/></div>
                        <div>
                            <h3 className="font-bold text-sm leading-tight">Islamic Assistant</h3>
                            <p className="text-[10px] opacity-80 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> Online</p>
                        </div>
                    </div>
                    <button onClick={()=>setIsAiOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-50 scroll-smooth">
                    {aiHistory.length===0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2"><Sparkles size={32} className="text-emerald-500"/></div>
                            <p className="text-sm">Assalamu Alaikum! <br/>Ask me about School Management, Islam, or the Developer.</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="text-xs bg-white border border-emerald-100 px-3 py-1 rounded-full cursor-pointer hover:bg-emerald-50" onClick={()=>setAiInput("Who is the developer?")}>Who created this?</span>
                                <span className="text-xs bg-white border border-emerald-100 px-3 py-1 rounded-full cursor-pointer hover:bg-emerald-50" onClick={()=>setAiInput("Write a notice for Eid holiday")}>Eid Notice</span>
                            </div>
                        </div>
                    )}
                    {aiHistory.map((m,i)=>(
                        <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                            {m.role !== 'user' && <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px] font-bold mr-2 mt-1">AI</div>}
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.role==='user'?'bg-emerald-600 text-white rounded-br-none':'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isAiLoading && (
                        <div className="flex justify-start">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-2">AI</div>
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={aiEndRef}/>
                </div>
                
                <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                    <input className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-2.5 px-4 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all" placeholder="Type your question..." value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAiSend()}/>
                    <button onClick={handleAiSend} disabled={!aiInput.trim()} className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-transform active:scale-95"><Send size={18}/></button>
                </div>
              </>
           )}
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
