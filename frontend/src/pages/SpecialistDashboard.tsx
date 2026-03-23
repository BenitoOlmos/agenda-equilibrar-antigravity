import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, LogOut, 
  ChevronLeft, ChevronRight, 
  Clock, Video, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

const CalendarWidget = ({ month, year, selectedDay, onDaySelect, onPrevMonth, onNextMonth }: any) => (
  <div className="space-y-2 py-3">
    <div className="flex items-center justify-between text-[11px] px-1 mb-1">
      <button onClick={onPrevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-300"><ChevronLeft className="w-3 h-3" /></button>
      <span className="font-bold text-slate-600 tracking-tight">{month} - {year}</span>
      <button onClick={onNextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-300"><ChevronRight className="w-3 h-3" /></button>
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

const SpecialistDashboard = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'list'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const agendaFilterSpec = currentUser?.id || currentUser?.userId || 'GUEST_LOCK';

  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Modal States
  const [showApptModal, setShowApptModal] = useState(false);
  const [newAppt, setNewAppt] = useState<any>({ clientId: '', specialistId: currentUser.id || '', serviceId: '', date: '', sessionType: 'IN_PERSON', status: 'SCHEDULED' });
  const [isEditingAppt, setIsEditingAppt] = useState(false);
  
  // Bulk block mode
  const [isBlockMode, setIsBlockMode] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [apptsRes, usersRes, servicesRes] = await Promise.all([
        fetch('/api/data/appointments').then(res => res.json()),
        fetch('/api/data/users').then(res => res.json()),
        fetch('/api/data/services').then(res => res.json())
      ]);
      setAppointments(apptsRes);
      setUsers(usersRes);
      setServices(servicesRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSaveAppt = async (e: any) => {
    e.preventDefault();
    if (isEditingAppt) {
      await fetch(`/api/data/appointments/${newAppt.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({...newAppt, date: new Date(newAppt.date).toISOString()}) 
      });
    } else {
      if (isBlockMode && blockEndTime) {
         const start = new Date(newAppt.date);
         const end = new Date(blockEndTime);
         const durationMatch = services.find(s => s.id === newAppt.serviceId)?.duration || 30;
         
         const promises = [];
         let current = new Date(start);
         while (current < end) {
            promises.push(fetch('/api/data/appointments', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({...newAppt, date: current.toISOString()}) 
            }));
            current = new Date(current.getTime() + durationMatch * 60000);
         }
         await Promise.all(promises);
      } else {
         await fetch('/api/data/appointments', { 
           method: 'POST', 
           headers: { 'Content-Type': 'application/json' }, 
           body: JSON.stringify({...newAppt, date: new Date(newAppt.date).toISOString()}) 
         });
      }
    }
    setShowApptModal(false);
    fetchDashboardData();
  };

  const professionals = users.filter((u:any) => u.role === 'SPECIALIST' || u.role === 'ADMIN');
  const patients = users.filter((u:any) => u.role === 'CLIENT');
  const filteredAppointments = appointments.filter(a => agendaFilterSpec === 'ALL' || a.specialistId === agendaFilterSpec);

  // Helper arrays for dynamic grids
  const startOfWeek = new Date(selectedDate);
  const dow = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - dow + 1);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
     const d = new Date(startOfWeek);
     d.setDate(d.getDate() + i);
     return d;
  });

  const getMonthDays = () => {
     const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
     const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
     const days = [];
     
     // pad start
     const startDow = startOfMonth.getDay() || 7;
     for (let i = startDow - 1; i > 0; i--) {
        const d = new Date(startOfMonth);
        d.setDate(d.getDate() - i);
        days.push({ date: d, isCurrentMonth: false });
     }
     
     // real month days
     for (let i = 1; i <= endOfMonth.getDate(); i++) {
        const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i);
        days.push({ date: d, isCurrentMonth: true });
     }
     
     // pad end
     const remain = 35 - days.length; // 5 weeks grid
     for(let i=1; i<= (remain > 0 ? remain : 42 - days.length); i++) {
        const d = new Date(endOfMonth);
        d.setDate(d.getDate() + i);
        days.push({ date: d, isCurrentMonth: false });
     }
     return days;
  };

  const monthGrid = getMonthDays();

  // Reusable Appointment Block Renderer
  const renderApptBlock = (appt: any) => {
     const date = new Date(appt.date);
     const hr = date.getHours();
     const min = date.getMinutes();
     if (hr < 8 || hr > 20) return null;
     
     const startMinutesOffset = ((hr - 8) * 60) + min;
     const topPixels = (startMinutesOffset / 60) * 96; 
     const heightPixels = (appt.service.duration / 60) * 96;
     
     const spColor = appt.specialist.profile?.color || '#3b82f6';

     return (
       <div key={appt.id} onClick={() => { setIsEditingAppt(true); setNewAppt({...appt, date: new Date(appt.date).toISOString().slice(0,16)}); setShowApptModal(true); }} className="absolute left-1 right-1 sm:left-2 sm:right-4 rounded-xl border p-2 sm:p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden"
            style={{
              top: `${topPixels}px`, 
              height: `${Math.max(heightPixels, 35)}px`,
              backgroundColor: `${spColor}15`,
              borderColor: `${spColor}50`,
              borderLeftWidth: '5px',
              borderLeftColor: spColor
            }}>
          <div className="flex justify-between items-start">
             <div className="flex flex-col">
                <div className="text-[10px] sm:text-xs font-bold text-slate-800 tracking-tight flex items-center leading-tight">
                   {appt.client.profile.firstName} {viewMode==='week'?'':appt.client.profile.lastName}
                </div>
                <div className="text-[9px] sm:text-[10px] font-medium text-slate-500 mt-0.5 truncate max-w-[80px] sm:max-w-[120px]">{appt.service.name}</div>
             </div>
             <div className="text-[9px] sm:text-[10px] font-bold text-slate-600 bg-white/60 px-1 sm:px-2 py-0.5 rounded-md border border-slate-200 flex items-center shadow-sm">
                {date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
             </div>
          </div>
       </div>
     );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 border-slate-200 font-sans text-slate-800 overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      
      {/* Header Superior */}
      <header className="bg-[#1e293b] text-white h-14 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
        <div className="flex items-center space-x-8">
          <div className="h-16 flex items-center space-x-3 px-6 border-b border-slate-700/50 flex-shrink-0 bg-[#0f172a]">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-inner shrink-0">
               <img src={LOGO_URL} className="w-6 object-contain" alt="Logo" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-slate-100">Portal <span className="text-[#00A89C]">Especialista</span></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-l border-slate-700 pl-6 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold leading-tight">{currentUser.profile?.firstName || 'Mi Perfil'}</div>
              <div className="text-[10px] text-emerald-400 font-mono">EN LÍNEA</div>
            </div>
            <div className="w-9 h-9 bg-[#00A89C] rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-[#1e293b]">ES</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Lateral */}
        <aside className={`${isMobileMode ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 shrink-0`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {!isMobileMode && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2">Menú Principal</span>}
            <button onClick={() => setIsMobileMode(!isMobileMode)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
              <LogOut className={`w-4 h-4 transition-transform ${isMobileMode ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            <button onClick={() => setActiveTab('agenda')} className={`w-full flex items-center ${isMobileMode ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'agenda' ? 'bg-[#00A89C]/10 text-[#00A89C]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <CalendarIcon className={`w-5 h-5 ${isMobileMode ? '' : 'mr-3'} ${activeTab === 'agenda' ? 'text-[#00A89C]' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!isMobileMode && <span className="text-sm font-semibold tracking-wide">Matriz de Agenda</span>}
              {activeTab === 'agenda' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00A89C] rounded-r-md"></div>}
            </button>
          </nav>

          {/* Mini Calendar */}
          {!isMobileMode && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 hidden md:block">
              <CalendarWidget 
                 month={selectedDate.toLocaleString('es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())} 
                 year={selectedDate.getFullYear()} 
                 selectedDay={selectedDate.getDate()} 
                 onDaySelect={(d: number) => {
                   const newD = new Date(selectedDate);
                   newD.setDate(d);
                   setSelectedDate(newD);
                 }}
                 onPrevMonth={() => {
                   const newD = new Date(selectedDate);
                   newD.setMonth(newD.getMonth() - 1);
                   setSelectedDate(newD);
                 }}
                 onNextMonth={() => {
                   const newD = new Date(selectedDate);
                   newD.setMonth(newD.getMonth() + 1);
                   setSelectedDate(newD);
                 }}
              />
            </div>
          )}

          <div className="p-4 border-t border-slate-800">
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className={`w-full flex items-center ${isMobileMode ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group`}>
              <LogOut className={`w-5 h-5 ${isMobileMode ? '' : 'mr-3'} group-hover:text-red-400`} />
              {!isMobileMode && <span className="text-sm font-bold">Cerrar Sesión</span>}
            </button>
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
           
           {activeTab === 'agenda' && (
              <div className="flex flex-col h-full animate-fade-in max-w-[1400px] mx-auto">
                 {/* Agenda Toolbar */}
                 <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                     <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
                       <button onClick={() => setViewMode('day')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Diario</button>
                       <button onClick={() => setViewMode('week')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Semanal</button>
                       <button onClick={() => setViewMode('month')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Mensual</button>
                       <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Lista</button>
                     </div>
                     <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                     <span className="text-sm md:text-xl font-black text-slate-700 tracking-tight capitalize group flex items-center cursor-pointer truncate">
                        {viewMode === 'week' 
                          ? `${weekDays[0].getDate()} ${weekDays[0].toLocaleString('es-ES', {month: 'short'})} - ${weekDays[6].getDate()} ${weekDays[6].toLocaleString('es-ES', {month: 'short'})} ${selectedDate.getFullYear()}`
                          : viewMode === 'month'
                          ? `${selectedDate.toLocaleString('es-ES', {month: 'long'})} ${selectedDate.getFullYear()}`
                          : selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                     </span>
                   </div>
                   
                   <div className="flex flex-wrap items-center w-full xl:w-auto gap-3">
                     <div className="flex space-x-2">
                       <button onClick={() => {
                          const newD = new Date(selectedDate);
                          if(viewMode==='week') newD.setDate(newD.getDate() - 7);
                          else if(viewMode==='month') newD.setMonth(newD.getMonth() - 1);
                          else newD.setDate(newD.getDate() - 1);
                          setSelectedDate(newD);
                       }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                       <button onClick={() => {
                          setSelectedDate(new Date());
                       }} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-sm shadow-sm transition-colors">Hoy</button>
                       <button onClick={() => {
                          const newD = new Date(selectedDate);
                          if(viewMode==='week') newD.setDate(newD.getDate() + 7);
                          else if(viewMode==='month') newD.setMonth(newD.getMonth() + 1);
                          else newD.setDate(newD.getDate() + 1);
                          setSelectedDate(newD);
                       }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm transition-colors"><ChevronRight className="w-5 h-5" /></button>
                     </div>
                     
                     <div className="w-full flex flex-col sm:flex-row gap-2">
                       <button onClick={() => { setIsEditingAppt(false); setIsBlockMode(false); setNewAppt({ clientId: '', specialistId: currentUser.id || currentUser.userId || '', serviceId: '', date: selectedDate.toISOString().slice(0,16), sessionType: 'IN_PERSON', status: 'SCHEDULED' }); setShowApptModal(true); }} className="bg-[#00A89C] hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all shadow-[#00A89C]/20 w-full sm:w-auto">
                          + Agendar Reservación
                       </button>
                       <button onClick={() => { setIsEditingAppt(false); setIsBlockMode(true); setNewAppt({ clientId: '', specialistId: currentUser.id || currentUser.userId || '', serviceId: '', date: selectedDate.toISOString().slice(0,16), sessionType: 'IN_PERSON', status: 'SCHEDULED' }); setShowApptModal(true); }} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md transition-all shadow-orange-500/20 flex justify-center items-center w-full sm:w-auto">
                          BLOQUEO AGENDA
                       </button>
                     </div>
                   </div>
                 </div>

                 {viewMode === 'list' && (
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-200">
                              <th className="p-4 font-bold">Fecha / Horario</th>
                              <th className="p-4 font-bold">Paciente</th>
                              <th className="p-4 font-bold">Servicio</th>
                              <th className="p-4 font-bold">Estado</th>
                              <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-slate-100">
                             {filteredAppointments
                                .filter(a => new Date(a.date).toDateString() === selectedDate.toDateString())
                                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((appt: any) => (
                                <tr key={appt.id} className="hover:bg-slate-50 transition-colors hidden-actions-row">
                                  <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                                     <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-emerald-500 mr-2 opacity-70" />
                                        {new Date(appt.date).toLocaleDateString()} {new Date(appt.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                                     </div>
                                  </td>
                                  <td className="p-4 font-medium text-slate-800">
                                     {appt.client.profile.firstName} {appt.client.profile.lastName}
                                     <div className="text-[10px] text-slate-400 font-mono mt-0.5">{appt.client.profile.documentId}</div>
                                  </td>
                                  <td className="p-4 text-slate-600">
                                     <span className="px-2 py-1 bg-slate-100 rounded-md text-xs border border-slate-200 font-medium">{appt.service.name}</span>
                                     <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 flex items-center">
                                       {appt.sessionType === 'ONLINE' ? <Video className="w-3 h-3 mr-1 inline"/> : <MapPin className="w-3 h-3 mr-1 inline"/>} 
                                       {appt.sessionType}
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                       appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                       appt.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                       'bg-amber-50 text-amber-600 border border-amber-100'
                                     }`}>{appt.status}</span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button onClick={() => { setIsEditingAppt(true); setNewAppt({...appt, date: new Date(appt.date).toISOString().slice(0,16)}); setShowApptModal(true); }} className="text-[#00A89C] hover:bg-[#00A89C]/10 font-bold text-xs bg-transparent border border-slate-200 px-3 py-1.5 rounded-md transition-colors shadow-sm">Editar</button>
                                  </td>
                                </tr>
                             ))}
                             {filteredAppointments.filter(a => new Date(a.date).toDateString() === selectedDate.toDateString()).length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No hay citas agendadas para este día.</td></tr>
                             )}
                          </tbody>
                        </table>
                      </div>
                   </div>
                 )}

                 {viewMode === 'day' && (
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-[80px_1fr] relative min-w-[350px]">
                       <div className="bg-slate-50 border-r border-slate-200 sticky left-0 z-20">
                          {hours.map(hour => (
                            <div key={hour} className="h-24 border-b border-slate-200 relative flex justify-center pt-2">
                               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1">{hour.toString().padStart(2, '0')}:00</span>
                            </div>
                          ))}
                       </div>
                       <div className="relative isolate">
                          {hours.map(hour => (
                             <div key={hour} className="h-24 border-b border-slate-100 relative group">
                                <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 transition-colors pointer-events-none"></div>
                             </div>
                          ))}
                          {filteredAppointments
                             .filter(a => new Date(a.date).toDateString() === selectedDate.toDateString())
                             .map(renderApptBlock)}
                       </div>
                     </div>
                   </div>
                 )}

                 {viewMode === 'week' && (
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
                     <div className="min-w-[800px] grid grid-cols-[80px_repeat(7,1fr)]">
                        {/* Headers */}
                        <div className="bg-slate-50 border-r border-b border-slate-200 sticky left-0 top-0 z-30"></div>
                        {weekDays.map((d, i) => (
                          <div key={i} className={`p-3 text-center border-b border-slate-200 sticky top-0 z-20 font-bold text-sm ${d.toDateString() === new Date().toDateString() ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-700'}`}>
                             {d.toLocaleDateString('es-ES', {weekday:'short'}).toUpperCase()} <span className="text-xl ml-1">{d.getDate()}</span>
                          </div>
                        ))}

                        {/* Timeline */}
                        <div className="bg-slate-50 border-r border-slate-200 sticky left-0 z-20">
                          {hours.map(hour => (
                            <div key={hour} className="h-24 border-b border-slate-200 relative flex justify-center pt-2">
                               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1">{hour.toString().padStart(2, '0')}:00</span>
                            </div>
                          ))}
                        </div>

                        {/* Grid Columns */}
                        {weekDays.map((d, i) => (
                           <div key={i} className="relative border-r border-slate-100 last:border-r-0">
                              {hours.map(hour => (
                                 <div key={hour} className="h-24 border-b border-slate-100 relative"></div>
                              ))}
                              {filteredAppointments
                               .filter(a => new Date(a.date).toDateString() === d.toDateString())
                               .map(renderApptBlock)}
                           </div>
                        ))}
                     </div>
                   </div>
                 )}

                 {viewMode === 'month' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-w-[600px]">
                      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                         {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                            <div key={d} className="p-3 text-center text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
                         ))}
                      </div>
                      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                         {monthGrid.map((dayObj, i) => {
                            const isToday = dayObj.date.toDateString() === new Date().toDateString();
                            const dayAppts = filteredAppointments.filter(a => new Date(a.date).toDateString() === dayObj.date.toDateString());
                            
                            return (
                               <div key={i} onClick={() => { setSelectedDate(dayObj.date); setViewMode('day'); }} className={`border-r border-b border-slate-100 p-2 overflow-hidden transition-colors cursor-pointer hover:bg-slate-50 ${!dayObj.isCurrentMonth ? 'bg-slate-50/50 opacity-50' : 'bg-white'}`}>
                                  <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#00A89C] text-white shadow-md' : 'text-slate-600'}`}>
                                     {dayObj.date.getDate()}
                                  </div>
                                  <div className="space-y-1">
                                    {dayAppts.slice(0, 4).map(appt => (
                                      <div key={appt.id} className="text-[9px] truncate bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-100 font-medium">
                                        {new Date(appt.date).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})} {appt.client.profile.firstName}
                                      </div>
                                    ))}
                                    {dayAppts.length > 4 && (
                                       <div className="text-[9px] font-bold text-slate-500 text-center">+ {dayAppts.length - 4} citas</div>
                                    )}
                                  </div>
                               </div>
                            )
                         })}
                      </div>
                    </div>
                 )}
              </div>
           )}

        </main>
      </div>

      {showApptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md my-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
               {isBlockMode ? <span className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm mr-2">BLOQUEO</span> : ''}
               {isEditingAppt ? 'Detalles de Cita / Bloqueo' : isBlockMode ? 'Bloquear Múltiples Horas' : 'Agendar Nueva Hora'}
            </h3>
            <form onSubmit={handleSaveAppt} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Especialista Requerido</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.specialistId} onChange={(e) => setNewAppt({...newAppt, specialistId: e.target.value})} disabled={true}>
                  <option value="">Seleccione...</option>
                  {professionals.map(s => <option key={s.id} value={s.id}>{s.name || (s.profile?.firstName + ' ' + s.profile?.lastName)}</option>)}
                </select>
              </div>

              {!isBlockMode && (
                 <>
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Paciente / Cliente</label>
                     <select required={!isBlockMode} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.clientId} onChange={(e) => setNewAppt({...newAppt, clientId: e.target.value})}>
                       <option value="">Seleccione o cree uno...</option>
                       {patients.map(p => <option key={p.id} value={p.id}>{p.profile?.firstName} {p.profile?.lastName} ({p.profile?.documentId})</option>)}
                     </select>
                   </div>
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Servicio a Realizar / Programa</label>
                     <select required={!isBlockMode} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.serviceId} onChange={(e) => setNewAppt({...newAppt, serviceId: e.target.value})}>
                       <option value="">Seleccione...</option>
                       {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.duration}min</option>)}
                     </select>
                   </div>
                 </>
              )}

              {isBlockMode && (
                 <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
                    <p className="text-xs text-orange-600 font-bold mb-3 uppercase tracking-wider">Parámetros de Bloqueo</p>
                    
                    <div className="space-y-3">
                       <div><label className="text-[10px] font-bold text-slate-500 uppercase">Servicio "Asignado" que definirá duración</label>
                         <select required={isBlockMode} className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-orange-500 text-sm" value={newAppt.serviceId} onChange={(e) => setNewAppt({...newAppt, serviceId: e.target.value})}>
                           <option value="">Seleccione un Bloque Base...</option>
                           {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.duration}min</option>)}
                         </select>
                       </div>
                       <div><label className="text-[10px] font-bold text-slate-500 uppercase">Cliente "Asignado" Temporal</label>
                         <select required={isBlockMode} className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none focus:border-orange-500 text-sm" value={newAppt.clientId} onChange={(e) => setNewAppt({...newAppt, clientId: e.target.value})}>
                           <option value="">Asigna un paciente de relleno...</option>
                           {patients.map(p => <option key={p.id} value={p.id}>{p.profile?.firstName} {p.profile?.lastName}</option>)}
                         </select>
                       </div>
                    </div>
                 </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-xs font-bold text-slate-500 uppercase">{isBlockMode ? 'Hora y Fecha Inicial' : 'Fecha y Hora'}</label><input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.date} onChange={(e) => setNewAppt({...newAppt, date: e.target.value})} /></div>
                 
                 {isBlockMode ? (
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Hora de Fin (Tope)</label><input required type="datetime-local" className="w-full bg-slate-50 border border-orange-200 focus:bg-orange-50 rounded-lg p-3 outline-none focus:border-orange-500" value={blockEndTime} onChange={(e) => setBlockEndTime(e.target.value)} /></div>
                 ) : (
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Modalidad</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.sessionType} onChange={(e) => setNewAppt({...newAppt, sessionType: e.target.value})}>
                          <option value="IN_PERSON">Presencial</option>
                          <option value="ONLINE">Telemedicina</option>
                      </select>
                   </div>
                 )}
              </div>
              
              {isEditingAppt && (
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Estado de la Cita</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.status} onChange={(e) => setNewAppt({...newAppt, status: e.target.value})}>
                        <option value="SCHEDULED">Agendada / Pendiente</option>
                        <option value="COMPLETED">Asistió / Completada</option>
                        <option value="CANCELLED">Cancelada / Anulada</option>
                    </select>
                 </div>
              )}
              
              <div className="flex space-x-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowApptModal(false)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-colors ${isBlockMode ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30' : 'bg-[#00A89C] hover:bg-emerald-500 shadow-[#00A89C]/30'}`}>
                   {isEditingAppt ? 'Guardar Cambios' : isBlockMode ? 'Aplicar Ráfaga' : 'Agendar / Bloquear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SpecialistDashboard;
