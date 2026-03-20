import { useState, useEffect } from 'react';
import { 
  Users, Calendar as CalendarIcon, LogOut, DollarSign, 
  CheckCircle2, Mail, Database, Search, ChevronLeft, ChevronRight, 
  Clock, ChevronDown, List, UserPlus, Filter, 
  MoreVertical, ChevronLast, Plus, Smartphone, Monitor
} from 'lucide-react';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

const CalendarWidget = ({ month, year, selectedDay, onDaySelect }: any) => (
  <div className="space-y-2 py-3">
    <div className="flex items-center justify-between text-[11px] px-1 mb-1">
      <button className="p-1 hover:bg-slate-100 rounded text-slate-300"><ChevronLeft className="w-3 h-3" /></button>
      <span className="font-bold text-slate-600 tracking-tight">{month} - {year}</span>
      <button className="p-1 hover:bg-slate-100 rounded text-slate-300"><ChevronRight className="w-3 h-3" /></button>
    </div>
    <div className="grid grid-cols-7 gap-1 text-[9px] text-center font-medium text-slate-400 mb-1">
      {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <span key={d}>{d}</span>)}
    </div>
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        const isToday = day === selectedDay;
        return (
          <button 
            key={`day-${month}-${day}`} 
            onClick={() => onDaySelect && onDaySelect(day)}
            className={`h-6 w-6 flex items-center justify-center text-[10px] rounded-full transition-all 
              ${isToday ? 'bg-[#00A89C] text-white font-bold shadow-sm shadow-[#00A89C]/30' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {day}
          </button>
        );
      })}
    </div>
  </div>
);

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Data States
  const [stats, setStats] = useState({ specialists: 0, clients: 0, appointmentsToday: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [dbTab, setDbTab] = useState('Users');
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchUser, setSearchUser] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [searchService, setSearchService] = useState('');
  const [searchPayment, setSearchPayment] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('ALL');
  const [paymentFilterMethod, setPaymentFilterMethod] = useState('ALL');

  // Modal States
  const [showApptModal, setShowApptModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Form States
  const [newSvc, setNewSvc] = useState<any>({ name: '', description: '', duration: 30, price: 0 });
  const [newProgram, setNewProgram] = useState<any>({ id: '', name: '', description: '', price: 0, services: [] });
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const PRESET_COLORS = [
    'bg-[#b3e5fc] border-[#03a9f4] text-[#01579b]',
    'bg-[#c8e6c9] border-[#4caf50] text-[#1b5e20]',
    'bg-[#ffecb3] border-[#ffc107] text-[#795548]',
    'bg-[#f8bbd0] border-[#e91e63] text-[#880e4f]',
    'bg-[#ffccbc] border-[#ff5722] text-[#bf360c]',
    'bg-[#e1bee7] border-[#ba68c8] text-[#4a148c]',
  ];
  const [newUser, setNewUser] = useState<any>({ firstName: '', lastName: '', email: '', role: 'CLIENT', password: '', phone: '', address: '', rut: '', color: PRESET_COLORS[0], healthSystem: '', complementaryInsurance: '' });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [newAppt, setNewAppt] = useState({ clientId: '', specialistId: '', serviceId: '', date: '', sessionType: 'IN_PERSON' });

  // Filter Agenda State
  const [agendaFilterSpec, setAgendaFilterSpec] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, apptsRes, paymentsRes, usersRes, servicesRes, programsRes] = await Promise.all([
        fetch('/api/data/stats').then(res => res.json()),
        fetch('/api/data/appointments').then(res => res.json()),
        fetch('/api/data/payments').then(res => res.json()),
        fetch('/api/data/users').then(res => res.json()),
        fetch('/api/data/services').then(res => res.json()),
        fetch('/api/data/programs').then(res => res.json())
      ]);
      setStats(statsRes);
      setAppointments(apptsRes);
      setPayments(paymentsRes);
      setUsers(usersRes);
      setServices(servicesRes);
      setPrograms(programsRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async (e: any) => {
    e.preventDefault();
    if (isEditingService) {
      await fetch(`/api/data/services/${newSvc.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSvc) });
    } else {
      await fetch('/api/data/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSvc) });
    }
    setShowServiceModal(false);
    fetchDashboardData();
  };

  const handleSaveProgram = async (e: any) => {
    e.preventDefault();
    if (isEditingProgram) {
      await fetch(`/api/data/programs/${newProgram.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProgram) });
    } else {
      await fetch('/api/data/programs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProgram) });
    }
    setShowProgramModal(false);
    fetchDashboardData();
  };

  const handleSaveUser = async (e: any) => {
    e.preventDefault();
    const url = isEditingUser ? `/api/data/users/${newUser.id}` : '/api/data/users';
    const method = isEditingUser ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { 
          method, headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ...newUser, documentId: newUser.rut, specialty: 'General' }) 
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(`Error: No se pudo guardar. ${errData.error || ''}`);
        return;
      }
      setShowUserModal(false);
      fetchDashboardData();
    } catch (error) {
      alert('Error de conexión fallida al servidor.');
    }
  };

  const handleCreateAppt = async (e: any) => {
    e.preventDefault();
    await fetch('/api/data/appointments', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...newAppt, status: 'SCHEDULED' }) 
    });
    setShowApptModal(false);
    fetchDashboardData();
  };

  const professionals = users
    .filter(u => u.role === 'SPECIALIST')
    .map(s => {
      const name = `${s.profile.firstName} ${s.profile.lastName}`;
      return {
        id: s.id,
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(' ','+')}&background=random&color=fff&rounded=true&bold=true`
      };
    });

  const gridAppointments = appointments.map(app => {
    const start = new Date(app.date);
    const end = new Date(start.getTime() + app.service.duration * 60000);
    const isOnline = app.sessionType === 'ONLINE';
    
    return {
      id: app.id,
      profId: app.specialistId,
      name: `${app.client.profile?.firstName} ${app.client.profile?.lastName}`,
      type: app.service?.name,
      time: `${start.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} - ${end.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`,
      color: app.specialist?.profile?.color || 'bg-slate-100 border-slate-300 text-slate-700',
      startHour: start.getHours() + (start.getMinutes() / 60),
      duration: (app.service?.duration / 60) || 1,
      hasPrice: true,
      hasHome: !isOnline,
      hasGlobe: isOnline,
      rawDate: start
    };
  });

  // Calculate position for the current time marker
  const now = new Date();
  const timePos = Math.max(0, (now.getHours() - 8) * 80 + (now.getMinutes() / 60) * 80);

  // Optional: Inject Demo Hooks to preview AgendaPro UI immediately
  if (professionals.length >= 2 && gridAppointments.filter(app => !app.id.toString().startsWith('d')).length === 0) {
    const prof1 = professionals[0].id;
    const prof2 = professionals[1].id;
    gridAppointments.push(
      { id: 'd1', profId: prof1, name: 'Bárbara Troncoso', type: 'Sesión individual', time: '10:00 - 11:00', color: 'bg-[#b3e5fc] border-[#03a9f4] text-[#01579b]', startHour: 10, duration: 1, hasPrice: true, hasHome: false, hasGlobe: false, rawDate: new Date() },
      { id: 'd2', profId: prof1, name: 'José Molero', type: 'Primera cita', time: '14:00 - 16:00', color: 'bg-[#c8e6c9] border-[#4caf50] text-[#1b5e20]', startHour: 14, duration: 2, hasPrice: true, hasHome: false, hasGlobe: false, rawDate: new Date() },
      { id: 'd3', profId: prof1, name: 'Ferran Santana', type: 'Consulta', time: '18:00 - 19:00', color: 'bg-[#ffecb3] border-[#ffc107] text-[#795548]', startHour: 18, duration: 1, hasPrice: false, hasHome: false, hasGlobe: true, rawDate: new Date() },
      { id: 'd4', profId: prof2, name: 'Clase personalizada', type: '0/10', time: '11:00 - 13:00', color: 'bg-[#ffccbc] border-[#ff5722] text-[#bf360c]', startHour: 11, duration: 2, hasPrice: false, hasHome: true, hasGlobe: false, rawDate: new Date() },
      { id: 'd5', profId: prof2, name: 'Felix Nieto', type: 'Sesión individual', time: '15:00 - 17:00', color: 'bg-[#c8e6c9] border-[#4caf50] text-[#1b5e20]', startHour: 15, duration: 2, hasPrice: true, hasHome: true, hasGlobe: false, rawDate: new Date() },
    );
  }

  // Mobile Version Intercept
  if (isMobileMode && activeTab === 'agenda') {
    return (
      <div className="flex flex-col h-screen bg-[#1e2329] text-white font-sans max-w-[430px] mx-auto shadow-2xl overflow-hidden relative border-x border-slate-700">
        <div className="bg-[#1e2329] pt-12 pb-4 px-4 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <button className="p-2"><Filter className="w-5 h-5" /></button>
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full cursor-pointer">
              <span className="text-sm font-semibold">{now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
              <ChevronDown className="w-4 h-4 opacity-60" />
            </div>
            <button className="p-2 text-[#00A89C]" onClick={() => setIsMobileMode(false)}><Monitor className="w-5 h-5" /></button>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mb-4 overflow-x-auto no-scrollbar">
            {[1,2,3,4,5,6,7].map(num => {
               const dayDate = new Date();
               dayDate.setDate(now.getDate() - now.getDay() + num);
               return (
                 <div key={num} className={`flex flex-col items-center min-w-[45px] py-1 rounded-xl ${dayDate.getDate() === now.getDate() ? 'bg-[#00A89C] text-white' : ''}`}>
                   <span className="opacity-60 mb-1">{dayDate.toLocaleDateString('es-ES', {weekday: 'short'})}</span>
                   <span className="font-bold text-base">{dayDate.getDate()}</span>
                 </div>
               )
            })}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-t-3xl overflow-y-auto px-4 pt-6 text-slate-900 pb-24">
          <div className="flex items-center justify-between mb-8 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-3">
              <img src={professionals[0]?.avatar || LOGO_URL} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
              <span className="font-bold text-slate-700">{professionals[0]?.name || 'Equilibrar'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
          <div className="relative pl-12 space-y-12 pb-10">
             <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-slate-100"></div>
             {gridAppointments.filter(app => app.profId === professionals[0]?.id).map(app => (
                <div key={app.id} className="relative mt-8">
                  <span className="absolute -left-12 top-0 text-[11px] font-bold text-slate-400">{app.time.split(' ')[0]}</span>
                  <div className={`rounded-2xl p-4 shadow-sm relative ${app.color} border border-opacity-30 border-current bg-opacity-30`}>
                    <div className="text-[11px] font-bold opacity-70 mb-1">{app.time}</div>
                    <div className="font-bold text-sm tracking-tight">{app.name}</div>
                    <div className="text-xs mt-0.5 opacity-90">{app.type}</div>
                  </div>
                  <div className="absolute left-[-24px] right-0 top-[20%] h-[2px] bg-red-400/40 z-10 hidden">
                    {/* Time line hook if needed */}
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <style>{`
        .stripe-bg { background-image: repeating-linear-gradient(45deg, #f8fafc 0, #f8fafc 8px, #e2e8f0 8px, #e2e8f0 16px); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* Header Superior (AgendaPro Style) */}
      <header className="bg-[#1e293b] text-white h-14 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
        <div className="flex items-center space-x-8">
          <div className="h-16 flex items-center space-x-3 px-6 border-b border-slate-700/50 flex-shrink-0">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-inner shrink-0">
               <img src={LOGO_URL} className="w-6 object-contain" alt="Logo" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-slate-100">Portal <span className="text-secondary">Coordinador</span></span>
          </div>
          <nav className="flex items-center space-x-1.5 hidden md:flex">
            {[
              { id: 'dashboard', label: 'Resumen' },
              { id: 'agenda', label: 'Agenda' },
              { id: 'services', label: 'Servicios' },
              { id: 'users', label: 'Usuarios' },
              { id: 'payments', label: 'Pagos' },
              { id: 'database', label: 'DB Raw' },
              { id: 'settings', label: 'Ajustes' },
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-all ${
                   activeTab === item.id 
                    ? 'bg-[#00A89C] text-white shadow-sm shadow-[#00A89C]/20' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-300" title="Ver Móvil" onClick={() => setIsMobileMode(true)}>
             <Smartphone className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"><Search className="w-4 h-4" /></button>
          <button onClick={() => window.location.href='/login'} className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"><LogOut className="w-4 h-4" /></button>
          <div className="w-8 h-8 bg-gradient-to-tr from-[#00A89C] to-emerald-400 rounded-full flex flex-col items-center justify-center text-[11px] font-bold border-2 border-slate-700 shadow-sm leading-none">PS</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Contextual Sidebar only for AGENDA */}
        {activeTab === 'agenda' && (
          <aside className="w-[280px] bg-white border-r border-slate-200 overflow-y-auto flex flex-col p-5 custom-scrollbar shrink-0 shadow-sm z-20 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button onClick={() => setViewMode('calendar')} className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-white/50'}`}><CalendarIcon className="w-3.5 h-3.5 mr-1.5" /> Calendario</button>
                <button onClick={() => setViewMode('list')} className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-white/50'}`}><List className="w-3.5 h-3.5 mr-1.5" /> Lista</button>
              </div>
              <button className="p-1 text-slate-300 hover:text-slate-500"><ChevronLast className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sucursal</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold appearance-none focus:ring-2 focus:ring-[#00A89C]/20 cursor-pointer">
                    <option>Casa Matriz (Equilibrar)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Especialista Visualizado</label>
                <div className="relative">
                  <select 
                    value={agendaFilterSpec}
                    onChange={(e) => setAgendaFilterSpec(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold appearance-none focus:ring-2 focus:ring-[#00A89C]/20 cursor-pointer"
                  >
                    <option value="ALL">Todos los especialistas</option>
                    {professionals.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <button onClick={() => setShowApptModal(true)} className="w-full py-2.5 px-3 bg-[#00A89C] hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center transition-all shadow-md shadow-[#00A89C]/20">
                <Plus className="w-4 h-4 mr-2" />
                Asignar Nueva Hora
              </button>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
              <CalendarWidget 
                month={selectedDate.toLocaleDateString('es-ES', {month:'long'})} 
                year={selectedDate.getFullYear()} 
                selectedDay={selectedDate.getDate()}
                onDaySelect={(d: number) => {
                  const newD = new Date(selectedDate);
                  newD.setDate(d);
                  setSelectedDate(newD);
                }}
              />
            </div>
          </aside>
        )}

        {/* Main Content Render Space */}
        <main className={`flex-1 flex flex-col min-w-0 ${activeTab === 'agenda' ? 'bg-white shadow-inner' : 'bg-transparent overflow-y-auto p-8'}`}>
          
          {loading ? (
             <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A89C]"></div>
             </div>
          ) : (
            <>
               {/* ======================= AGENDA TAB (CUSTOM GRID CALENDAR) ======================= */}
               {activeTab === 'agenda' && (
                  <div className="flex flex-col h-full bg-slate-50">
                    {viewMode === 'calendar' ? (
                      <>
                        {/* Cabecera Grid Semana */}
                        <div className="flex border-b border-slate-200 shrink-0 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
                           <div className="w-20 border-r border-slate-100 flex items-center justify-center bg-slate-50/50 shadow-[2px_0_5px_rgba(0,0,0,0.01)] z-40">
                              <Clock className="w-4 h-4 text-slate-300" />
                           </div>
                           {Array.from({ length: 7 }, (_, i) => {
                              const d = new Date(selectedDate);
                              const currentDay = d.getDay();
                              d.setDate(d.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + i);
                              const isToday = d.toDateString() === new Date().toDateString();
                              return (
                                 <div key={`head-day-${i}`} className={`flex-1 min-w-[150px] py-5 flex flex-col items-center justify-center border-r border-slate-100 transition-colors ${isToday ? 'bg-[#00A89C]/5' : 'bg-white hover:bg-slate-50/50'}`}>
                                    <span className={`text-[10px] uppercase font-extrabold tracking-widest ${isToday ? 'text-[#00A89C]' : 'text-slate-400'}`}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                    <span className={`text-2xl font-black mt-1 ${isToday ? 'text-[#00A89C]' : 'text-slate-800'}`}>{d.getDate()}</span>
                                 </div>
                              );
                           })}
                        </div>

                        {/* Cuerpo Grid Semana */}
                        <div className="flex-1 overflow-auto relative custom-scrollbar bg-slate-50/30">
                             <div className="flex min-h-[960px]">
                                {/* Horas Left Gutter */}
                                <div className="w-20 flex-shrink-0 bg-white border-r border-slate-100 z-10 sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.01)] flex flex-col">
                                   {hours.map(hour => (
                                   <div key={hour} className="h-[80px] border-b border-slate-50 flex items-start justify-center pt-3 shrink-0">
                                      <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{hour.toString().padStart(2, '0')}:00</span>
                                   </div>
                                   ))}
                                </div>

                                {/* Contenedor Grilla */}
                                <div className="flex-1 flex relative">
                                   {/* Background Lines */}
                                   <div className="absolute inset-0 pointer-events-none flex flex-col">
                                   {hours.map(hour => (
                                      <div key={`line-${hour}`} className="h-[80px] border-b border-slate-100/50 w-full shrink-0" />
                                   ))}
                                   </div>

                                   {/* Columnas Días de Semana */}
                                   {Array.from({ length: 7 }, (_, i) => {
                                      const d = new Date(selectedDate);
                                      const currentDay = d.getDay();
                                      d.setDate(d.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + i);
                                      return (
                                         <div key={`col-day-${i}`} className="flex-1 min-w-[150px] border-r border-slate-100/50 relative">
                                            {gridAppointments
                                               .filter(app => new Date(app.rawDate).toDateString() === d.toDateString() || (app.id.toString().startsWith('d') && d.toDateString() === new Date().toDateString()))
                                               .filter(app => agendaFilterSpec === 'ALL' || app.profId === agendaFilterSpec)
                                               .map(app => (
                                               <div
                                                  key={`${app.id}-${i}`}
                                                  className={`absolute inset-x-2 rounded-xl border-l-[6px] p-3 shadow-sm z-20 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col ${app.color}`}
                                                  style={{ top: `${(app.startHour - 8) * 80 + 5}px`, height: `${app.duration * 80 - 10}px` }}
                                               >
                                                  <div className="flex justify-between items-start mb-0.5"><span className="font-extrabold text-xs truncate leading-tight tracking-tight">{app.name}</span><MoreVertical className="w-3.5 h-3.5 opacity-20 hover:opacity-100 shrink-0" /></div>
                                                  <div className="font-semibold text-[10px] opacity-80 mb-1 truncate leading-tight">{app.type}</div>
                                                  <div className="mt-auto flex items-center justify-between font-bold text-[10px]"><div className="flex items-center opacity-80">{app.time}</div><span>{app.hasGlobe ? '🌐' : '🏠'}</span></div>
                                               </div>
                                            ))}
                                         </div>
                                      );
                                   })}

                                   {/* Marcador Tiempo Real */}
                                   {timePos >= 0 && timePos <= (hours.length * 80) && (
                                      <div className="absolute w-full flex items-center pointer-events-none z-40" style={{ top: `${timePos}px` }}>
                                         <div className="relative flex items-center w-full">
                                            <div className="absolute -left-1 w-14 h-6 bg-[#f06292] rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg border-2 border-white ring-2 ring-pink-100/50">
                                               {now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                            <div className="w-full h-0.5 bg-[#f06292] shadow-sm"></div>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 overflow-auto p-8 custom-scrollbar relative">
                         <div className="max-w-4xl mx-auto space-y-3 pb-24">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 capitalize px-2">Citas del <span className="text-[#00A89C]">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span></h3>
                            {gridAppointments
                               .filter(app => new Date(app.rawDate).toDateString() === selectedDate.toDateString() || (app.id.toString().startsWith('d') && selectedDate.toDateString() === new Date().toDateString()))
                               .filter(app => agendaFilterSpec === 'ALL' || app.profId === agendaFilterSpec)
                               .sort((a,b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
                               .map((app, i) => (
                                  <div key={`${app.id}-list-${i}`} className={`flex items-center p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all ${app.color.replace('bg-', 'border-l-4 border-').replace('text-', '')}`}>
                                     <div className="w-28 shrink-0 flex flex-col justify-center border-r border-slate-100 pr-4 mr-4">
                                        <div className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">{new Date(app.rawDate).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: '2-digit' })}</div>
                                        <div className="font-black text-slate-800 text-lg mt-0.5">{app.time.split(' - ')[0]}<span className="text-xs text-slate-400 font-semibold ml-0.5">hs</span></div>
                                     </div>
                                     <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-[15px]">{app.name}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{app.type}</p>
                                     </div>
                                     <div className="w-56 shrink-0 flex items-center space-x-3 text-xs font-semibold text-slate-700">
                                        <img src={professionals.find(p => p.id === app.profId)?.avatar} className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" alt="" />
                                        <span className="truncate">{professionals.find(p => p.id === app.profId)?.name}</span>
                                     </div>
                                     <div className="shrink-0 text-lg ml-6 bg-slate-50 w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 shadow-sm">{app.hasGlobe ? '🌐' : '🏠'}</div>
                                  </div>
                               ))}
                               {gridAppointments
                                  .filter(app => new Date(app.rawDate).toDateString() === selectedDate.toDateString() || (app.id.toString().startsWith('d') && selectedDate.toDateString() === new Date().toDateString()))
                                  .filter(app => agendaFilterSpec === 'ALL' || app.profId === agendaFilterSpec)
                                  .length === 0 && (
                                  <div className="text-center text-slate-400 py-16 font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                     No hay citas agendadas para este día.
                                  </div>
                               )}
                         </div>
                      </div>
                    )}
                  </div>
               )}

               {/* ======================= OTHER TABS ======================= */}
               {activeTab === 'dashboard' && (
                 <div className="max-w-6xl mx-auto w-full animate-fade-in">
                   <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-8 hidden">Resumen General</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Especialistas Activos', value: stats.specialists.toString(), color: 'bg-white text-indigo-700 border-indigo-100', icon: Users },
                        { label: 'Pacientes Registrados', value: stats.clients.toString(), color: 'bg-white text-emerald-700 border-emerald-100', icon: UserPlus },
                        { label: 'Citas Hoy', value: stats.appointmentsToday.toString(), color: 'bg-white text-purple-700 border-purple-100', icon: CalendarIcon },
                      ].map((stat, i) => (
                        <div key={i} className={`p-6 rounded-2xl border shadow-sm ${stat.color} relative overflow-hidden flex flex-col`}>
                          <stat.icon className="absolute right-4 top-4 w-16 h-16 opacity-5" />
                          <p className="text-xs font-bold opacity-60 mb-1 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-4xl font-extrabold">{stat.value}</p>
                        </div>
                      ))}
                   </div>
                 </div>
               )}

               {activeTab === 'services' && (
                  <div className="flex flex-col space-y-8 animate-fade-in max-w-6xl mx-auto w-full">
                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                       <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">Directorio de Servicios</h3>
                          </div>
                          <div className="flex items-center space-x-3">
                             <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input type="text" placeholder="Buscar servicio..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-[#00A89C] w-full md:w-64 shadow-sm" value={searchService} onChange={(e) => setSearchService(e.target.value)} />
                             </div>
                             <button onClick={() => { setIsEditingService(false); setNewSvc({ name: '', description: '', duration: 30, price: 0 }); setShowServiceModal(true); }} className="bg-[#00A89C] hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all shadow-[#00A89C]/20 shrink-0">
                                + Nuevo Servicio
                             </button>
                          </div>
                       </div>
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                           <th className="p-5 font-bold">Servicio / Programa</th>
                           <th className="p-5 font-bold">Duración</th>
                           <th className="p-5 font-bold">Valor (CLP)</th>
                           <th className="p-5 font-bold text-right">Acciones</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm">
                           {services.filter((s:any) => `${s.name} ${s.description}`.toLowerCase().includes(searchService.toLowerCase())).map((svc: any) => (
                           <tr key={svc.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                              <td className="p-5 font-bold text-slate-700">
                                 {svc.name}
                                 <p className="text-xs text-slate-500 font-normal mt-1">{svc.description}</p>
                              </td>
                              <td className="p-5 text-slate-600 font-medium">{svc.duration} min</td>
                              <td className="p-5 font-extrabold text-[#00A89C]">${svc.price.toLocaleString()}</td>
                              <td className="p-5 text-right space-x-2">
                                 <button onClick={() => { setIsEditingService(true); setNewSvc(svc); setShowServiceModal(true); }} className="text-[#00A89C] hover:text-emerald-700 font-bold text-xs bg-[#00A89C]/10 px-3 py-1.5 rounded-md">Editar</button>
                                 <button className="text-red-500 hover:text-red-600 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-md">Eliminar</button>
                              </td>
                           </tr>
                           ))}
                        </tbody>
                     </table>
                     </div>
                     
                     {/* ======================= PROGRAMS DIRECTORY ======================= */}
                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                       <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-[#f8fafc] gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">Paquetes / Programas</h3>
                            <p className="text-xs text-slate-500 mt-1">Planes que agrupan servicios internos pre-establecidos.</p>
                          </div>
                          <button onClick={() => { setIsEditingProgram(false); setNewProgram({ name: '', description: '', price: 0, services: [] }); setShowProgramModal(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all shadow-indigo-500/20 shrink-0 whitespace-nowrap">
                             + Crear Programa
                          </button>
                       </div>
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                               <th className="p-5 font-bold">Programa</th>
                               <th className="p-5 font-bold">Servicios Inlcuidos</th>
                               <th className="p-5 font-bold">Valor (CLP)</th>
                               <th className="p-5 font-bold text-right">Acciones</th>
                             </tr>
                          </thead>
                          <tbody className="text-sm">
                             {programs.filter((p:any) => `${p.name} ${p.description}`.toLowerCase().includes(searchService.toLowerCase())).map((prog: any) => (
                             <tr key={prog.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                <td className="p-5 font-bold text-slate-700">
                                   <div className="flex items-center space-x-2">
                                      <span className={`w-2 h-2 rounded-full ${prog.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                      <span>{prog.name}</span>
                                   </div>
                                   <p className="text-xs text-slate-500 font-normal mt-1">{prog.description}</p>
                                </td>
                                <td className="p-5 text-slate-600 font-medium">
                                   <div className="flex flex-wrap gap-1 max-w-[200px]">
                                     {prog.services?.map((ps:any) => (
                                        <span key={ps.serviceId} className="px-2 py-0.5 bg-slate-100 text-[10px] rounded-md border border-slate-200 truncate">{ps.service.name}</span>
                                     ))}
                                   </div>
                                </td>
                                <td className="p-5 font-extrabold text-indigo-600">${prog.price.toLocaleString()}</td>
                                <td className="p-5 text-right space-x-2">
                                   <button onClick={() => { setIsEditingProgram(true); setNewProgram({...prog, services: prog.services.map((s:any) => s.serviceId)}); setShowProgramModal(true); }} className="text-indigo-600 hover:bg-indigo-50 font-bold text-xs bg-indigo-50/50 px-3 py-1.5 rounded-md">Editar</button>
                                </td>
                             </tr>
                             ))}
                          </tbody>
                       </table>
                     </div>

                  </div>
               )}

               {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in max-w-7xl mx-auto w-full">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Directorio de Perfiles</h3>
                      </div>
                      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 items-center w-full md:w-auto">
                        <select className="bg-white border text-sm text-slate-600 border-slate-200 rounded-xl px-4 py-2 focus:outline-[#00A89C] w-full md:w-auto shrink-0" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                           <option value="ALL">Roles: Todos</option>
                           <option value="CLIENT">Pacientes / Clientes</option>
                           <option value="SPECIALIST">Especialistas</option>
                           <option value="COORDINATOR">Coordinadores</option>
                           <option value="ADMIN">Administradores</option>
                        </select>
                        <div className="relative w-full md:w-auto">
                           <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                           <input type="text" placeholder="Buscar por nombre, RUT, correo..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-[#00A89C] w-full md:w-64 shadow-sm" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
                        </div>
                        <button onClick={() => { setIsEditingUser(false); setNewUser({firstName: '', lastName: '', email: '', role: 'CLIENT', password: '', phone: '', address: '', rut: '', color: '#00A89C', healthSystem: '', complementaryInsurance: ''}); setShowUserModal(true); }} className="bg-[#7AC943] hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors shadow-green-500/20 whitespace-nowrap shrink-0 w-full md:w-auto">
                          + Registrar Perfil
                        </button>
                      </div>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                          <th className="p-5 font-bold">Resumen de Cuenta</th>
                          <th className="p-5 font-bold">Contacto</th>
                          <th className="p-5 font-bold">Tipo</th>
                          <th className="p-5 font-bold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {users.filter((u:any) => (userRoleFilter === 'ALL' || u.role === userRoleFilter) && `${u.profile?.firstName} ${u.profile?.lastName} ${u.email} ${u.profile?.documentId}`.toLowerCase().includes(searchUser.toLowerCase())).map((user: any, i: number) => (
                           <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                            <td className="p-5 flex items-center space-x-3">
                              <img src={`https://ui-avatars.com/api/?name=${user.profile?.firstName}+${user.profile?.lastName}&background=random&color=fff&rounded=true`} className="w-9 h-9 rounded-full shadow-sm" alt="Avatar"/>
                              <div>
                                 <div className="font-extrabold text-slate-700 tracking-tight">{user.profile?.firstName} {user.profile?.lastName}</div>
                                 <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.profile?.documentId}</div>
                              </div>
                            </td>
                            <td className="p-5 text-slate-500 font-medium">
                              <div className="flex items-center mb-1"><Mail className="w-3.5 h-3.5 mr-2 opacity-50"/> {user.email}</div>
                              {user.profile?.phone && <div className="flex items-center text-xs"><Smartphone className="w-3.5 h-3.5 mr-2 opacity-50"/> {user.profile?.phone}</div>}
                            </td>
                            <td className="p-5">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                user.role === 'ADMIN' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                user.role === 'COORDINATOR' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                user.role === 'SPECIALIST' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                'bg-green-50 text-green-600 border border-green-100'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-5 text-right space-x-2">
                              <button onClick={() => { setIsEditingUser(true); setNewUser({id: user.id, email: user.email, role: user.role, firstName: user.profile?.firstName||'', lastName: user.profile?.lastName||'', rut: user.profile?.documentId||'', phone: user.profile?.phone||'', address: user.profile?.address||'', color: user.profile?.color || '#00A89C', healthSystem: user.profile?.healthSystem || '', complementaryInsurance: user.profile?.complementaryInsurance || ''}); setShowUserModal(true); }} className="text-[#00A89C] hover:bg-[#00A89C]/20 font-bold text-xs bg-[#00A89C]/10 px-3 py-1.5 rounded-md transition-colors">Editar</button>
                              
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               )}

               {activeTab === 'payments' && (
                  <div className="max-w-6xl mx-auto w-full animate-fade-in">
                     <div className="bg-gradient-to-r from-[#1e293b] to-slate-800 p-8 rounded-2xl text-white shadow-xl mb-8 relative overflow-hidden flex items-center justify-between">
                         <div className="relative z-10">
                           <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-2">Ingresos Consolidados</p>
                           <h3 className="text-5xl font-black">${payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</h3>
                         </div>
                         <DollarSign className="w-32 h-32 opacity-10 transform rotate-12" />
                     </div>

                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                       <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
                         <h3 className="text-lg font-bold text-slate-800">Transacciones e Ingresos</h3>
                         <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 items-center w-full md:w-auto">
                            <select className="bg-white border text-sm text-slate-600 border-slate-200 rounded-xl px-4 py-2 focus:outline-[#00A89C] shrink-0 w-full md:w-auto" value={paymentFilterStatus} onChange={(e) => setPaymentFilterStatus(e.target.value)}>
                              <option value="ALL">Todos los Estados</option>
                              <option value="COMPLETED">Pagados</option>
                              <option value="PENDING">Pendientes</option>
                            </select>
                            <select className="bg-white border text-sm text-slate-600 border-slate-200 rounded-xl px-4 py-2 focus:outline-[#00A89C] shrink-0 w-full md:w-auto" value={paymentFilterMethod} onChange={(e) => setPaymentFilterMethod(e.target.value)}>
                              <option value="ALL">Todos los Métodos</option>
                              <option value="CASH">Efectivo</option>
                              <option value="TRANSFER">Transferencia</option>
                              <option value="DEBIT">Débito</option>
                              <option value="CREDIT">Crédito</option>
                              <option value="GATEWAY">Pasarela Online</option>
                            </select>
                            <div className="relative w-full md:w-auto">
                               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pr-0.5" />
                               <input type="text" placeholder="Buscar paciente o servicio..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-[#00A89C] w-full md:w-60 shadow-sm" value={searchPayment} onChange={(e) => setSearchPayment(e.target.value)} />
                            </div>
                         </div>
                       </div>
                       <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                             <th className="p-5 font-bold">Paciente</th>
                             <th className="p-5 font-bold">Concepto</th>
                             <th className="p-5 font-bold">Método</th>
                             <th className="p-5 font-bold">Monto</th>
                             <th className="p-5 font-bold">Estado</th>
                             <th className="p-5 font-bold text-right">Ticket</th>
                           </tr>
                         </thead>
                       <tbody className="text-sm">
                           {payments.filter((tx:any) => (paymentFilterStatus === 'ALL' || tx.status === paymentFilterStatus) && (paymentFilterMethod === 'ALL' || tx.paymentMethod === paymentFilterMethod) && `${tx.user.profile.firstName} ${tx.user.profile.lastName} ${tx.appointment?.service?.name}`.toLowerCase().includes(searchPayment.toLowerCase())).map((tx: any, i: number) => (
                             <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                               <td className="p-5 font-bold text-slate-700">{tx.user.profile.firstName} {tx.user.profile.lastName}</td>
                               <td className="p-5 text-slate-500 font-medium">{tx.appointment?.service?.name || 'Manual'}</td>
                               <td className="p-5">
                                 <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap border border-slate-200">
                                   {tx.paymentMethod === 'CASH' ? 'Efectivo' : tx.paymentMethod === 'TRANSFER' ? 'Transferencia' : tx.paymentMethod === 'DEBIT' ? 'Débito' : tx.paymentMethod === 'CREDIT' ? 'Crédito' : tx.paymentMethod === 'GATEWAY' ? 'Pasarela Online' : 'No Definido'}
                                 </span>
                               </td>
                               <td className="p-5 font-extrabold text-slate-800">${tx.amount.toLocaleString()}</td>
                               <td className="p-5">
                                 {tx.status === 'COMPLETED' ? (
                                   <span className="flex items-center text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                                     <CheckCircle2 className="w-4 h-4 mr-1.5" /> Pagado
                                   </span>
                                 ) : (
                                   <span className="flex items-center text-amber-500 text-[11px] font-bold uppercase tracking-wider">
                                     <Clock className="w-4 h-4 mr-1.5" /> Pendiente
                                   </span>
                                 )}
                               </td>
                               <td className="p-5 text-right flex justify-end space-x-2">
                                 <button onClick={() => { setEditingPayment(tx); setShowPaymentModal(true); }} className="text-[#00A89C] hover:bg-emerald-50 font-bold text-xs bg-emerald-50/50 px-3 py-1.5 rounded-md transition-colors border border-emerald-100">Editar</button>
                                 <button onClick={() => alert(`Detalle de Pago:\n\nID Transacción: ${tx.id}\nPaciente: ${tx.user.profile.firstName} ${tx.user.profile.lastName}\nRUT: ${tx.user.profile.documentId || 'N/A'}\nMonto: $${tx.amount}\nFecha: ${new Date(tx.createdAt).toLocaleString()}\nEstado: ${tx.status}`)} className="text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold text-xs px-3 py-1.5 rounded-md shadow-sm">Recibo</button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                  </div>
               )}

               {activeTab === 'database' && (
                  <div className="flex flex-col h-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-w-7xl mx-auto w-full border border-slate-700">
                    <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700/50">
                      <div className="flex items-center space-x-3 text-slate-300">
                        <Database className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-mono font-bold text-sm tracking-wide">RAW_DATABASE_INSPECTOR</h3>
                      </div>
                      <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg">
                        {['Users', 'Services', 'Appointments', 'Payments'].map(t => (
                          <button key={t} onClick={() => setDbTab(t)} className={`px-4 py-1.5 text-xs font-mono font-bold rounded-md transition-colors ${dbTab === t ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-2">
                        <table className="w-full text-left border-collapse text-xs whitespace-nowrap font-mono">
                          <thead className="text-slate-500 bg-slate-900/50">
                            {dbTab === 'Users' && <tr><th className="p-3">ID</th><th className="p-3">Role</th><th className="p-3">Email</th><th className="p-3">Profile</th><th className="p-3">RUT</th></tr>}
                            {dbTab === 'Services' && <tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Price</th><th className="p-3">Duration</th></tr>}
                            {dbTab === 'Appointments' && <tr><th className="p-3">ID</th><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Status</th></tr>}
                            {dbTab === 'Payments' && <tr><th className="p-3">ID</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr>}
                          </thead>
                          <tbody className="text-slate-300">
                            {dbTab === 'Users' && users.map((u, i) => (
                              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50"><td className="p-3 text-slate-600">{u.id}</td><td className="p-3 text-indigo-400">{u.role}</td><td className="p-3">{u.email}</td><td className="p-3">{u.profile?.firstName} {u.profile?.lastName}</td><td className="p-3 text-slate-500">{u.profile?.documentId}</td></tr>
                            ))}
                            {dbTab === 'Services' && services.map((s, i) => (
                              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50"><td className="p-3 text-slate-600">{s.id}</td><td className="p-3 text-emerald-400">{s.name}</td><td className="p-3">${s.price}</td><td className="p-3">{s.duration}m</td></tr>
                            ))}
                            {dbTab === 'Appointments' && appointments.map((a, i) => (
                              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50"><td className="p-3 text-slate-600">{a.id}</td><td className="p-3 text-sky-400">{new Date(a.date).toLocaleString()}</td><td className="p-3">{a.sessionType}</td><td className="p-3">{a.status}</td></tr>
                            ))}
                            {dbTab === 'Payments' && payments.map((p, i) => (
                              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50"><td className="p-3 text-slate-600">{p.id}</td><td className="p-3 text-emerald-400">${p.amount}</td><td className="p-3">{p.status}</td></tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                  </div>
               )}
            </>
          )}
        </main>
      </div>

      {/* ===================== MODALS ===================== */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{isEditingService ? 'Modificar Servicio' : 'Añadir Servicio'}</h3>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Nombre</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newSvc.name} onChange={(e) => setNewSvc({...newSvc, name: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Descripción</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newSvc.description} onChange={(e) => setNewSvc({...newSvc, description: e.target.value})} /></div>
              <div className="flex space-x-4">
                <div className="flex-1"><label className="text-xs font-bold text-slate-500 uppercase">Minutos</label><input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newSvc.duration} onChange={(e) => setNewSvc({...newSvc, duration: Number(e.target.value)})} /></div>
                <div className="flex-1"><label className="text-xs font-bold text-slate-500 uppercase">Valor ($)</label><input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newSvc.price} onChange={(e) => setNewSvc({...newSvc, price: Number(e.target.value)})} /></div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-white font-bold bg-[#00A89C] rounded-xl hover:bg-emerald-500 shadow-lg shadow-[#00A89C]/30 transition-colors">{isEditingService ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProgramModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{isEditingProgram ? 'Editar Programa / Paquete' : 'Crear Programa / Paquete'}</h3>
            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Nombre del Programa</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500" value={newProgram.name} onChange={(e) => setNewProgram({...newProgram, name: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Descripción</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500" value={newProgram.description} onChange={(e) => setNewProgram({...newProgram, description: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Valor Total ($)</label><input required type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 font-bold text-indigo-700" value={newProgram.price} onChange={(e) => setNewProgram({...newProgram, price: Number(e.target.value)})} /></div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase block mb-3">Servicios Base Incorporados (Check)</label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {services.map((svc:any) => (
                    <label key={svc.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                      <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                        checked={newProgram.services.includes(svc.id)}
                        onChange={(e) => {
                          if (e.target.checked) setNewProgram({...newProgram, services: [...newProgram.services, svc.id]});
                          else setNewProgram({...newProgram, services: newProgram.services.filter((id:string) => id !== svc.id)});
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{svc.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{svc.duration} min • ${svc.price.toLocaleString()} CLP</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowProgramModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-colors">{isEditingProgram ? 'Actualizar Programa' : 'Crear Programa'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && editingPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Actualizar Cobro</h3>
            <p className="text-xs text-slate-500 mb-6 font-mono text-ellipsis overflow-hidden">Tickt: {editingPayment.id}</p>
            <form onSubmit={async (e) => {
                e.preventDefault();
                await fetch(`/api/data/payments/${editingPayment.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: editingPayment.status, amount: editingPayment.amount, paymentMethod: editingPayment.paymentMethod }) });
                setShowPaymentModal(false);
                fetchDashboardData();
            }} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Monto Total ($)</label><input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-emerald-500 font-bold text-emerald-600" value={editingPayment.amount} onChange={(e) => setEditingPayment({...editingPayment, amount: Number(e.target.value)})} /></div>
              
              <div><label className="text-xs font-bold text-slate-500 uppercase">Caja / Tipo de Pago</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-emerald-500 cursor-pointer text-slate-700 font-bold" value={editingPayment.paymentMethod || ''} onChange={(e) => setEditingPayment({...editingPayment, paymentMethod: e.target.value})}>
                  <option value="">No Registrado</option>
                  <option value="CASH">Dinero en Efectivo</option>
                  <option value="TRANSFER">Transferencia Bancaria</option>
                  <option value="DEBIT">Tarjeta Débito (Transbank)</option>
                  <option value="CREDIT">Tarjeta Crédito / Cuotas</option>
                  <option value="GATEWAY">Pasarela de Pago Online (MercadoPago/Flow)</option>
                </select>
              </div>

              <div><label className="text-xs font-bold text-slate-500 uppercase">Estado del Ticket</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-emerald-500 cursor-pointer text-slate-700 font-bold" value={editingPayment.status} onChange={(e) => setEditingPayment({...editingPayment, status: e.target.value})}>
                  <option value="PENDING">Pendiente / Por Pagar</option>
                  <option value="COMPLETED">Completado / Pagado</option>
                  <option value="REFUNDED">Reembolsado / Anulado</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-white font-bold bg-emerald-500 rounded-xl hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 transition-colors">Guardar Cobro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-1">{isEditingUser ? 'Editar Perfil' : 'Registrar Perfil'}</h3>
            <p className="text-xs text-slate-500 mb-6">{isEditingUser ? 'Modifica los datos del usuario en la base de datos.' : 'Completa los datos para habilitar una cuenta de acceso.'}</p>
            <form onSubmit={handleSaveUser} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Tipo Perfil</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                  <option value="CLIENT">Paciente / Cliente</option>
                  <option value="SPECIALIST">Especialista Médico</option>
                  <option value="COORDINATOR">Coordinador(a)</option>
                  <option value="ADMIN">Administración Sistema</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Correo Identidad</label><input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /></div>
              {!isEditingUser && (
                 <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Clave Inicial</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></div>
              )}
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">RUT</label><input required type="text" placeholder="12.345.678-9" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.rut} onChange={(e) => setNewUser({...newUser, rut: e.target.value})} /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Celular</label><input type="text" placeholder="+56 9..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Nombres</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} /></div>
              <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Apellidos</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} /></div>
              
              {newUser.role === 'CLIENT' && (
                 <>
                   <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Previsión / Salud</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.healthSystem || ''} onChange={(e) => setNewUser({...newUser, healthSystem: e.target.value})}>
                       <option value="">Ninguna / Particular</option>
                       <option value="FONASA A">FONASA A</option>
                       <option value="FONASA B">FONASA B</option>
                       <option value="FONASA C">FONASA C</option>
                       <option value="FONASA D">FONASA D</option>
                       <option value="ISAPRE Banmédica">ISAPRE Banmédica</option>
                       <option value="ISAPRE Colmena">ISAPRE Colmena</option>
                       <option value="ISAPRE Consorcio">ISAPRE Consorcio</option>
                       <option value="ISAPRE CruzBlanca">ISAPRE CruzBlanca</option>
                       <option value="ISAPRE Nueva Masvida">ISAPRE Nueva Masvida</option>
                       <option value="ISAPRE Vida Tres">ISAPRE Vida Tres</option>
                     </select>
                   </div>
                   <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase">Seguro Complementario</label><input type="text" placeholder="Ej: MetLife, BICE, Falabella..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newUser.complementaryInsurance || ''} onChange={(e) => setNewUser({...newUser, complementaryInsurance: e.target.value})} /></div>
                 </>
              )}
              
              {newUser.role === 'SPECIALIST' && (
                 <div className="col-span-2 mt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Color Asignado en la Agenda</label>
                    <div className="flex items-center space-x-3">
                       <input type="color" className="w-12 h-12 rounded cursor-pointer p-1 bg-white border border-slate-200" value={newUser.color || '#3b82f6'} onChange={(e) => setNewUser({...newUser, color: e.target.value})} />
                       <span className="text-xs font-mono text-slate-400">{newUser.color || '#3b82f6'}</span>
                    </div>
                 </div>
              )}

              <div className="col-span-2 flex space-x-3 pt-6 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-white font-bold bg-[#7AC943] rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all">{isEditingUser ? 'Guardar Cambios' : 'Registrar Credencial'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Bloquear/Agendar Hora</h3>
            <form onSubmit={handleCreateAppt} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Profesional A Cargo</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" onChange={(e) => setNewAppt({...newAppt, specialistId: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {professionals.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Paciente</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" onChange={(e) => setNewAppt({...newAppt, clientId: e.target.value})}>
                  <option value="">Buscar Paciente...</option>
                  {users.filter(u => u.role === 'CLIENT').map(c => <option key={c.id} value={c.id}>{c.profile.firstName} {c.profile.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Servicio</label>
                   <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" onChange={(e) => setNewAppt({...newAppt, serviceId: e.target.value})}>
                     <option value="">Tipología...</option>
                     {services.map(srv => <option key={srv.id} value={srv.id}>{srv.name}</option>)}
                   </select>
                 </div>
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Modalidad</label>
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" onChange={(e) => setNewAppt({...newAppt, sessionType: e.target.value})}>
                     <option value="IN_PERSON">Presencial</option>
                     <option value="ONLINE">Telemedicina</option>
                   </select>
                 </div>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Fecha y Bloque</label>
                <input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" onChange={(e) => setNewAppt({...newAppt, date: e.target.value})} />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowApptModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cerrar</button>
                <button type="submit" className="flex-1 py-3 text-white font-bold bg-[#00A89C] rounded-xl hover:bg-emerald-500 shadow-lg shadow-[#00A89C]/30 transition-colors">Guardar Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CoordinatorDashboard;
