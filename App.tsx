
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, UserPlus, Wallet, BookOpen, 
  Bus, Bed, MessageSquare, User, Settings, LogOut, 
  Menu, X, Save, Printer, Search, Plus, Trash2, Send, Bot, CheckCircle
} from 'lucide-react';
import { auth, db } from './firebaseConfig';
import { 
  onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile 
} from 'firebase/auth';
import { 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc 
} from 'firebase/firestore';
import * as GeminiService from './services/geminiService';
import { 
  Student, FeeInvoice, LibraryBook, Transaction, Notice, 
  ChatMessage, AuthUser, Module 
} from './types';

// --- Components ---

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // UI State
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: string, text: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const aiSessionRef = useRef<any>(null);

  // Forms State
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ gender: 'Male', bloodGroup: 'A+' });
  const [admissionTab, setAdmissionTab] = useState<'basic'|'guardian'|'academic'>('basic');
  const [newInvoice, setNewInvoice] = useState<Partial<FeeInvoice>>({ status: 'Unpaid', paymentMethod: 'Cash' });
  const [newBook, setNewBook] = useState<Partial<LibraryBook>>({});
  const [chatMsg, setChatMsg] = useState('');

  // --- Effects ---

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({ uid: u.uid, email: u.email!, name: u.displayName || 'Admin', role: 'admin' });
        loadData();
        initAI();
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const loadData = () => {
    onSnapshot(collection(db, 'students'), (snap) => setStudents(snap.docs.map(d => ({id:d.id, ...d.data()} as Student))));
    onSnapshot(query(collection(db, 'invoices'), orderBy('date', 'desc')), (snap) => setInvoices(snap.docs.map(d => ({id:d.id, ...d.data()} as FeeInvoice))));
    onSnapshot(collection(db, 'books'), (snap) => setBooks(snap.docs.map(d => ({id:d.id, ...d.data()} as LibraryBook))));
    onSnapshot(query(collection(db, 'messages'), orderBy('timestamp', 'asc')), (snap) => setMessages(snap.docs.map(d => ({id:d.id, ...d.data()} as ChatMessage))));
  };

  const initAI = async () => {
    aiSessionRef.current = await GeminiService.startChatSession();
  };

  // --- Handlers ---

  const handleAuth = async () => {
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name });
      }
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const saveStudent = async () => {
    if (!newStudent.name || !newStudent.regNo) return alert("Name and Reg No required");
    await addDoc(collection(db, 'students'), { ...newStudent, createdAt: serverTimestamp() });
    alert("Student Admitted Successfully!");
    setNewStudent({ gender: 'Male' });
  };

  const saveInvoice = async () => {
    await addDoc(collection(db, 'invoices'), { ...newInvoice, date: new Date().toISOString().split('T')[0] });
    alert("Invoice Generated!");
  };

  const sendMessage = async () => {
    if (!chatMsg.trim()) return;
    await addDoc(collection(db, 'messages'), {
      text: chatMsg,
      senderId: user?.uid,
      senderName: user?.name,
      timestamp: serverTimestamp()
    });
    setChatMsg('');
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const text = aiInput;
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text }]);
    try {
      const res = await aiSessionRef.current.sendMessage({ message: text });
      setAiMessages(prev => [...prev, { role: 'model', text: res.text }]);
    } catch (e) {
      setAiMessages(prev => [...prev, { role: 'model', text: "AI Service Unavailable" }]);
    }
  };

  // --- Renders ---

  const renderSidebar = () => (
    <div className={`bg-emerald-900 text-emerald-50 w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? '' : '-ml-64'} md:relative fixed h-full z-20`}>
      <div className="h-16 flex items-center justify-center border-b border-emerald-800 font-bold text-xl tracking-wider">
        MADRASA PRO
      </div>
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {[
          { m: Module.DASHBOARD, i: LayoutDashboard, l: 'Dashboard' },
          { m: Module.STUDENT_ADMISSION, i: UserPlus, l: 'Admission' },
          { m: Module.STUDENT_LIST, i: Users, l: 'Student List' },
          { m: Module.FEES_INVOICE, i: Wallet, l: 'Fees Invoice' },
          { m: Module.LIBRARY, i: BookOpen, l: 'Library' },
          { m: Module.COMMUNICATE, i: MessageSquare, l: 'Live Chat' },
          { m: Module.DEVELOPER, i: User, l: 'Developer Info' },
        ].map(item => (
          <button key={item.m} onClick={() => { setActiveModule(item.m); if(window.innerWidth<768) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-emerald-800 transition-colors ${activeModule === item.m ? 'bg-emerald-800 border-r-4 border-emerald-400' : ''}`}>
            <item.i size={18} /> <span>{item.l}</span>
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
            {user?.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-xs text-emerald-300">Online</p>
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="w-full bg-emerald-800 hover:bg-red-600 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  // --- Views ---

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">{authMode === 'login' ? 'Login to Madrasa' : 'Create Account'}</h2>
          {authError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{authError}</p>}
          <div className="space-y-4">
            {authMode === 'register' && <input className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />}
            <input className="input-field" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input-field" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
            <button onClick={handleAuth} className="btn-primary w-full py-3">{authMode === 'login' ? 'Sign In' : 'Register'}</button>
            <div className="text-center text-sm text-gray-500 cursor-pointer hover:text-emerald-600" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "New here? Create Account" : "Already have account? Login"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{activeModule}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setAiChatOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all">
              <Bot size={18} /> <span>Ask AI</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          
          {/* DASHBOARD */}
          {activeModule === Module.DASHBOARD && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
               <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                 <h3 className="text-gray-500 text-sm">Total Students</h3>
                 <p className="text-3xl font-bold text-gray-800 mt-2">{students.length}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                 <h3 className="text-gray-500 text-sm">Today's Collection</h3>
                 <p className="text-3xl font-bold text-gray-800 mt-2">৳ {invoices.filter(i => i.date === new Date().toISOString().split('T')[0]).reduce((a, b) => a + Number(b.amount), 0)}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                 <h3 className="text-gray-500 text-sm">Library Books</h3>
                 <p className="text-3xl font-bold text-gray-800 mt-2">{books.length}</p>
               </div>
            </div>
          )}

          {/* STUDENT ADMISSION (Detailed) */}
          {activeModule === Module.STUDENT_ADMISSION && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in max-w-4xl mx-auto">
               <div className="flex border-b border-gray-200">
                 {['basic', 'guardian', 'academic'].map(tab => (
                   <button key={tab} onClick={() => setAdmissionTab(tab as any)} 
                     className={`flex-1 py-4 font-medium text-sm uppercase tracking-wide transition-colors ${admissionTab === tab ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500 hover:bg-gray-50'}`}>
                     {tab} Info
                   </button>
                 ))}
               </div>
               <div className="p-8">
                 {admissionTab === 'basic' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="form-group"><label>Registration No</label><input className="input-field" value={newStudent.regNo||''} onChange={e=>setNewStudent({...newStudent, regNo:e.target.value})}/></div>
                     <div className="form-group"><label>Full Name</label><input className="input-field" value={newStudent.name||''} onChange={e=>setNewStudent({...newStudent, name:e.target.value})}/></div>
                     <div className="form-group"><label>Date of Birth</label><input type="date" className="input-field" value={newStudent.dob||''} onChange={e=>setNewStudent({...newStudent, dob:e.target.value})}/></div>
                     <div className="form-group"><label>Gender</label><select className="input-field" value={newStudent.gender} onChange={e=>setNewStudent({...newStudent, gender:e.target.value as any})}><option>Male</option><option>Female</option></select></div>
                     <div className="form-group"><label>Blood Group</label><input className="input-field" value={newStudent.bloodGroup||''} onChange={e=>setNewStudent({...newStudent, bloodGroup:e.target.value})}/></div>
                     <div className="form-group"><label>Religion</label><input className="input-field" value={newStudent.religion||''} onChange={e=>setNewStudent({...newStudent, religion:e.target.value})}/></div>
                   </div>
                 )}
                 {admissionTab === 'guardian' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="form-group"><label>Father Name</label><input className="input-field" value={newStudent.fatherName||''} onChange={e=>setNewStudent({...newStudent, fatherName:e.target.value})}/></div>
                     <div className="form-group"><label>Father Phone</label><input className="input-field" value={newStudent.fatherPhone||''} onChange={e=>setNewStudent({...newStudent, fatherPhone:e.target.value})}/></div>
                     <div className="form-group"><label>Mother Name</label><input className="input-field" value={newStudent.motherName||''} onChange={e=>setNewStudent({...newStudent, motherName:e.target.value})}/></div>
                     <div className="form-group"><label>Guardian NID</label><input className="input-field" value={newStudent.guardianNid||''} onChange={e=>setNewStudent({...newStudent, guardianNid:e.target.value})}/></div>
                   </div>
                 )}
                 {admissionTab === 'academic' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="form-group"><label>Class</label><input className="input-field" value={newStudent.class||''} onChange={e=>setNewStudent({...newStudent, class:e.target.value})}/></div>
                     <div className="form-group"><label>Roll Number</label><input className="input-field" value={newStudent.roll||''} onChange={e=>setNewStudent({...newStudent, roll:e.target.value})}/></div>
                     <div className="form-group"><label>Admission Date</label><input type="date" className="input-field" value={newStudent.admissionDate||''} onChange={e=>setNewStudent({...newStudent, admissionDate:e.target.value})}/></div>
                     <div className="form-group"><label>Previous School</label><input className="input-field" value={newStudent.previousSchool||''} onChange={e=>setNewStudent({...newStudent, previousSchool:e.target.value})}/></div>
                   </div>
                 )}
               </div>
               <div className="p-4 bg-gray-50 border-t flex justify-end">
                  <button onClick={saveStudent} className="btn-primary flex items-center gap-2"><Save size={18}/> Save Student</button>
               </div>
            </div>
          )}

          {/* FEES INVOICE */}
          {activeModule === Module.FEES_INVOICE && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-lg mb-6 text-gray-800">Generate Fee Invoice</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <input className="input-field" placeholder="Student Name" onChange={e=>setNewInvoice({...newInvoice, studentName:e.target.value})}/>
                  <input className="input-field" placeholder="Fee Title (e.g. Monthly Fee)" onChange={e=>setNewInvoice({...newInvoice, title:e.target.value})}/>
                  <input className="input-field" type="number" placeholder="Amount" onChange={e=>setNewInvoice({...newInvoice, amount:Number(e.target.value)})}/>
                  <select className="input-field" onChange={e=>setNewInvoice({...newInvoice, status:e.target.value as any})}><option>Unpaid</option><option>Paid</option></select>
                  <button onClick={saveInvoice} className="btn-primary col-span-2">Create Invoice</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase"><tr><th className="p-3">Date</th><th className="p-3">Student</th><th className="p-3">Title</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{inv.date}</td><td className="p-3 font-medium">{inv.studentName}</td><td className="p-3">{inv.title}</td><td className="p-3">৳ {inv.amount}</td>
                          <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${inv.status==='Paid'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{inv.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* DEVELOPER PROFILE */}
          {activeModule === Module.DEVELOPER && (
             <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100 animate-slide-up">
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                <div className="px-8 pb-8 relative">
                   <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg absolute -top-12 border-4 border-white">
                      <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-2xl">TM</div>
                   </div>
                   <div className="mt-16">
                      <h2 className="text-2xl font-bold text-gray-800">Muhammad: Talhah Maknun</h2>
                      <p className="text-emerald-600 font-medium">Professional Graphic Designer & Developer</p>
                      
                      <div className="mt-6 space-y-4">
                         <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><User size={18}/></div>
                            <div><p className="text-sm font-bold text-gray-700">Personal Info</p><p className="text-sm text-gray-500">From Ishwarganj, Bangladesh. 3rd child of Maw: Abu Sayed Saheb Hafi:.</p></div>
                         </div>
                         <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle size={18}/></div>
                            <div><p className="text-sm font-bold text-gray-700">Skills</p><p className="text-sm text-gray-500">Logo Design, Flyers, Business Cards, Social Media Design (4+ Years Exp).</p></div>
                         </div>
                      </div>
                      <div className="mt-8 pt-6 border-t flex gap-4">
                         <button className="flex-1 bg-[#1877F2] text-white py-2 rounded-lg text-sm font-bold shadow-sm">Facebook Group</button>
                         <button className="flex-1 bg-[#FF0000] text-white py-2 rounded-lg text-sm font-bold shadow-sm">YouTube Channel</button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* CHAT */}
          {activeModule === Module.COMMUNICATE && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-140px)] flex flex-col">
                <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Public Chat Room</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]">
                   {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-xs p-3 rounded-lg text-sm shadow-sm ${msg.senderId === user.uid ? 'bg-emerald-100 text-gray-800' : 'bg-white text-gray-800'}`}>
                            <p className="text-[10px] font-bold text-emerald-800 mb-1">{msg.senderName}</p>
                            {msg.text}
                         </div>
                      </div>
                   ))}
                </div>
                <div className="p-3 bg-gray-100 flex gap-2">
                   <input className="flex-1 input-field rounded-full" placeholder="Type message..." value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()}/>
                   <button onClick={sendMessage} className="p-3 bg-emerald-600 text-white rounded-full shadow hover:bg-emerald-700"><Send size={18}/></button>
                </div>
             </div>
          )}

        </main>
      </div>

      {/* AI Chat Widget */}
      {aiChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-slide-up">
           <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><Bot size={18}/> <span className="font-bold">Islamic Assistant</span></div>
              <button onClick={()=>setAiChatOpen(false)}><X size={18}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {aiMessages.map((m,i)=>(<div key={i} className={`p-3 rounded-lg text-sm ${m.role==='user'?'bg-emerald-600 text-white ml-auto':'bg-white border mr-auto'}`}>{m.text}</div>))}
           </div>
           <div className="p-3 border-t flex gap-2">
              <input className="flex-1 input-field" placeholder="Ask anything..." value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendAiMessage()}/>
              <button onClick={sendAiMessage} className="p-2 bg-emerald-600 text-white rounded-lg"><Send size={18}/></button>
           </div>
        </div>
      )}

      {/* Global CSS for Inputs/Buttons */}
      <style>{`
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #059669; ring: 2px solid #05966920; }
        .btn-primary { background-color: #059669; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: background-color 0.2s; }
        .btn-primary:hover { background-color: #047857; }
        .form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
      `}</style>
    </div>
  );
};

export default App;
