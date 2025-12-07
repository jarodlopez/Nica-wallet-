import React, { useState, useEffect } from 'react';
import { 
  Home, Plus, PieChart, Settings, ArrowUpRight, ArrowDownLeft,  
  ShoppingBag, Coffee, Zap, Car, MapPin, Gift, CreditCard, 
  Heart, LogOut, Trash2, LayoutGrid, Briefcase, X, User, Lock, Mail
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged, updateProfile 
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, deleteDoc, query, orderBy, onSnapshot, doc, serverTimestamp 
} from "firebase/firestore";

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAzhISkpS1PpfyA4gXngKxvsYbMv4bOFFo",
  authDomain: "nicawallett.firebaseapp.com",
  projectId: "nicawallett",
  storageBucket: "nicawallett.firebasestorage.app",
  messagingSenderId: "1087542817342",
  appId: "1:1087542817342:web:ccd126bd991b86e43bd76f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COMPONENTES UI ---
const ICONS_MAP = { Car, Coffee, ShoppingBag, Zap, MapPin, Gift, CreditCard, Heart, Briefcase, LayoutGrid, Home };
const CATS = [
  { id: 'c1', name: 'Comida', icon: 'ShoppingBag', color: 'bg-orange-100 text-orange-800' },
  { id: 'c2', name: 'Transporte', icon: 'Car', color: 'bg-blue-100 text-blue-800' },
  { id: 'c3', name: 'Hogar', icon: 'Home', color: 'bg-purple-100 text-purple-800' },
  { id: 'c4', name: 'Ocio', icon: 'Coffee', color: 'bg-pink-100 text-pink-800' },
  { id: 'c5', name: 'Servicios', icon: 'Zap', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'c6', name: 'Salud', icon: 'Heart', color: 'bg-red-100 text-red-800' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState('NIO');
  const [rate] = useState(36.65);

  // --- AUTH STATES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [userName, setUserName] = useState('');

  // --- ESCUCHA DE SESIÓN ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // --- ESCUCHA DE DATOS (Solo si hay usuario) ---
  useEffect(() => {
    if (!user) return;
    // La magia de la seguridad: 'users/' + user.uid
    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // --- MANEJADORES AUTH ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: userName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message.includes('invalid-credential') ? 'Credenciales incorrectas' : err.message);
    }
  };

  const format = (amt) => {
    const val = currency === 'USD' ? amt / rate : amt;
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
  };

  // --- VISTAS ---
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F9F7F2] text-[#1A4D2E]">Cargando...</div>;

  // PANTALLA DE LOGIN / REGISTRO
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F9F7F2]">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-[#E5E0D8]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1A4D2E] mb-2">NicaWallet</h1>
          <p className="text-gray-400 text-sm">Finanzas elegantes y privadas</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="bg-[#F9F7F2] flex items-center p-3 rounded-xl border border-[#E5E0D8]">
              <User size={20} className="text-gray-400 mr-3" />
              <input type="text" placeholder="Tu Nombre" className="bg-transparent outline-none flex-1" 
                value={userName} onChange={e => setUserName(e.target.value)} required />
            </div>
          )}
          
          <div className="bg-[#F9F7F2] flex items-center p-3 rounded-xl border border-[#E5E0D8]">
            <Mail size={20} className="text-gray-400 mr-3" />
            <input type="email" placeholder="Correo electrónico" className="bg-transparent outline-none flex-1" 
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="bg-[#F9F7F2] flex items-center p-3 rounded-xl border border-[#E5E0D8]">
            <Lock size={20} className="text-gray-400 mr-3" />
            <input type="password" placeholder="Contraseña" className="bg-transparent outline-none flex-1" 
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

          <button type="submit" className="w-full bg-[#1A4D2E] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#143d24] transition-colors">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-[#1A4D2E] font-medium text-sm hover:underline">
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );

  // APP PRINCIPAL (Diseño Responsive Web Completo)
  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D2D2D] pb-24 md:pb-0">
      
      {/* HEADER WEB */}
      <header className="bg-white border-b border-[#E5E0D8] sticky top-0 z-30 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#1A4D2E]">NicaWallet</h1>
          <p className="text-xs text-[#D4AF37] font-bold tracking-widest uppercase">Gold Edition</p>
        </div>
        <div className="flex items-center gap-4">
           <span className="hidden md:block text-sm font-medium">{user.displayName || user.email}</span>
           <button onClick={() => signOut(auth)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full"><LogOut size={18}/></button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        
        {view === 'home' && <HomeView transactions={transactions} format={format} currency={currency} setCurrency={setCurrency} />}
        {view === 'add' && <AddView user={user} setView={setView} />}
        {view === 'stats' && <div className="text-center py-20 text-gray-400">Estadísticas (Próximamente)</div>}
        
      </main>

      {/* BARRA DE NAVEGACIÓN FLOTANTE (Móvil y Desktop) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1A4D2E] text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-8 z-40">
        <NavBtn icon={Home} active={view === 'home'} onClick={() => setView('home')} />
        
        <button onClick={() => setView('add')} className="bg-[#D4AF37] p-3 rounded-full -mt-8 border-4 border-[#F9F7F2] text-[#1A4D2E] shadow-lg hover:scale-105 transition-transform">
          <Plus size={28} strokeWidth={3} />
        </button>

        <NavBtn icon={PieChart} active={view === 'stats'} onClick={() => setView('stats')} />
      </div>

    </div>
  );
}

// --- SUB-COMPONENTES INTERNOS ---

const HomeView = ({ transactions, format, currency, setCurrency }) => {
  const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  const income = transactions.filter(t => t.type === 'income').reduce((a,b) => a+b.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a,b) => a+b.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tarjeta de Balance */}
      <div className="bg-[#1A4D2E] rounded-3xl p-8 text-[#F9F7F2] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-8">
          <div>
            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-1">Total Disponible</p>
            <h2 className="text-5xl font-serif font-medium">{format(balance)}</h2>
          </div>
          <button onClick={() => setCurrency(c => c === 'NIO' ? 'USD' : 'NIO')} 
            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-[#D4AF37]/30 text-[#D4AF37] transition-colors">
            {currency}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 mb-1 text-[#4ADE80]">
                 <ArrowDownLeft size={16} /> <span className="text-xs font-bold uppercase text-white/60">Ingresos</span>
              </div>
              <p className="text-xl font-serif">{format(income)}</p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 mb-1 text-[#F87171]">
                 <ArrowUpRight size={16} /> <span className="text-xs font-bold uppercase text-white/60">Gastos</span>
              </div>
              <p className="text-xl font-serif">{format(expense)}</p>
           </div>
        </div>
      </div>

      {/* Lista de Transacciones */}
      <div>
        <h3 className="text-xl font-serif font-bold text-[#1A4D2E] mb-4">Movimientos Recientes</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-[#E5E0D8] overflow-hidden">
           {transactions.length === 0 ? (
             <div className="p-8 text-center text-gray-400">No hay movimientos aún</div>
           ) : transactions.map((t) => {
             const isInc = t.type === 'income';
             const Icon = ICONS_MAP[t.icon] || Zap;
             return (
               <div key={t.id} className="flex items-center justify-between p-4 border-b border-[#F9F7F2] last:border-0 hover:bg-gray-50 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${isInc ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-800'}`}>
                     <Icon size={20} />
                   </div>
                   <div>
                     <p className="font-bold text-[#2D2D2D]">{t.description}</p>
                     <p className="text-xs text-gray-400">{new Date(t.createdAt?.toDate()).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <div className={`font-bold font-serif text-lg ${isInc ? 'text-[#1A4D2E]' : 'text-[#2D2D2D]'}`}>
                   {isInc ? '+' : '-'} {format(t.amount)}
                 </div>
               </div>
             )
           })}
        </div>
      </div>
    </div>
  )
}

const AddView = ({ user, setView }) => {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('expense');
  const [cat, setCat] = useState(CATS[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !desc) return;
    
    await addDoc(collection(getFirestore(), 'users', user.uid, 'transactions'), {
      amount: parseFloat(amount),
      description: desc,
      type,
      category: cat.name,
      icon: cat.icon,
      createdAt: serverTimestamp()
    });
    setView('home');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#E5E0D8] animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-[#1A4D2E]">Nueva Transacción</h2>
        <button onClick={() => setView('home')} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
      </div>

      <div className="flex bg-[#F9F7F2] p-1 rounded-full mb-8">
        <button onClick={()=>setType('expense')} className={`flex-1 py-3 rounded-full font-bold transition-all ${type==='expense' ? 'bg-[#1A4D2E] text-white shadow-md' : 'text-gray-400'}`}>Gasto</button>
        <button onClick={()=>setType('income')} className={`flex-1 py-3 rounded-full font-bold transition-all ${type==='income' ? 'bg-[#1A4D2E] text-white shadow-md' : 'text-gray-400'}`}>Ingreso</button>
      </div>

      <div className="text-center mb-8">
        <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest block mb-2">Monto</label>
        <div className="flex items-center justify-center">
          <span className="text-4xl font-serif mr-2 text-[#2D2D2D]">C$</span>
          <input type="number" autoFocus placeholder="0" className="text-6xl font-serif text-[#2D2D2D] w-48 text-center outline-none placeholder:text-gray-200"
            value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4 mb-8">
         <input type="text" placeholder="Concepto (Ej: Taxi, Súper...)" className="w-full p-4 bg-[#F9F7F2] rounded-xl border border-transparent focus:border-[#D4AF37] outline-none font-medium"
           value={desc} onChange={e => setDesc(e.target.value)} />
         
         <div className="grid grid-cols-3 gap-3">
            {CATS.map(c => (
              <button key={c.id} onClick={()=>setCat(c)} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${cat.id === c.id ? 'border-[#1A4D2E] bg-[#1A4D2E]/5' : 'border-[#E5E0D8]'}`}>
                 {React.createElement(ICONS_MAP[c.icon], { size: 20, className: cat.id === c.id ? 'text-[#1A4D2E]' : 'text-gray-400' })}
                 <span className={`text-[10px] font-bold ${cat.id === c.id ? 'text-[#1A4D2E]' : 'text-gray-400'}`}>{c.name}</span>
              </button>
            ))}
         </div>
      </div>

      <button onClick={handleSubmit} className="w-full bg-[#1A4D2E] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#143d24]">
        Guardar
      </button>
    </div>
  );
};

const NavBtn = ({ icon: Icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-colors ${active ? 'text-white' : 'text-white/50 hover:text-white'}`}>
    <Icon size={24} strokeWidth={active ? 3 : 2} />
  </button>
);
