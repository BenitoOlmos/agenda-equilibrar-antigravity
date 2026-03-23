import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, LogOut, 
  ChevronLeft, ChevronRight, 
  Clock, ChevronDown, Video, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const SpecialistDashboard = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const agendaFilterSpec = currentUser.id || 'ALL';

  // Data States
  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Modal States
  const [showApptModal, setShowApptModal] = useState(false);
  const [newAppt, setNewAppt] = useState<any>({ clientId: '', specialistId: currentUser.id || '', serviceId: '', date: '', sessionType: 'IN_PERSON', status: 'SCHEDULED' });
  const [isEditingAppt, setIsEditingAppt] = useState(false);

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
      await fetch('/api/data/appointments', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({...newAppt, date: new Date(newAppt.date).toISOString()}) 
      });
    }
    setShowApptModal(false);
    fetchDashboardData();
  };

  const professionals = users.filter((u:any) => u.role === 'SPECIALIST' || u.role === 'ADMIN');
  const patients = users.filter((u:any) => u.role === 'CLIENT');

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

          {/* Mini Calendar - Only visible if sidebar is expanded */}
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
              <div className="flex flex-col h-full animate-fade-in max-w-7xl mx-auto">
                 {/* Agenda Toolbar */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="flex items-center space-x-4">
                     <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                       <button onClick={() => setViewMode('calendar')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Matriz</button>
                       <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Lista</button>
                     </div>
                     <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                     <span className="text-xl font-black text-slate-700 tracking-tight capitalize group flex items-center cursor-pointer">
                        {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        <ChevronDown className="w-4 h-4 ml-2 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                     </span>
                   </div>
                   
                   <div className="flex items-center w-full md:w-auto space-x-3">
                     <button onClick={() => {
                        const newD = new Date(selectedDate);
                        newD.setDate(newD.getDate() - 1);
                        setSelectedDate(newD);
                     }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                     <button onClick={() => {
                        setSelectedDate(new Date());
                     }} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-sm shadow-sm transition-colors">Hoy</button>
                     <button onClick={() => {
                        const newD = new Date(selectedDate);
                        newD.setDate(newD.getDate() + 1);
                        setSelectedDate(newD);
                     }} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 shadow-sm transition-colors"><ChevronRight className="w-5 h-5" /></button>
                     
                     <div className="w-px h-8 bg-slate-200 mx-2"></div>
                     <button onClick={() => { setIsEditingAppt(false); setNewAppt({ clientId: '', specialistId: currentUser.id || '', serviceId: '', date: selectedDate.toISOString().slice(0,16), sessionType: 'IN_PERSON', status: 'SCHEDULED' }); setShowApptModal(true); }} className="bg-[#00A89C] hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all shadow-[#00A89C]/20 shrink-0 w-full md:w-auto">
                        + Asignar / Bloquear Hora
                     </button>
                   </div>
                 </div>

                 {viewMode === 'list' ? (
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-200">
                              <th className="p-4 font-bold">Horario</th>
                              <th className="p-4 font-bold">Paciente</th>
                              <th className="p-4 font-bold">Servicio</th>
                              <th className="p-4 font-bold">Estado</th>
                              <th className="p-4 font-bold text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-slate-100">
                             {appointments
                                .filter(a => {
                                   const isSpec = agendaFilterSpec === 'ALL' || a.specialistId === agendaFilterSpec;
                                   const isDay = new Date(a.date).toDateString() === selectedDate.toDateString();
                                   return isSpec && isDay;
                                })
                                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((appt: any) => (
                                <tr key={appt.id} className="hover:bg-slate-50 transition-colors hidden-actions-row">
                                  <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                                     <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-emerald-500 mr-2 opacity-70" />
                                        {new Date(appt.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
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
                             {appointments.filter(a => (agendaFilterSpec === 'ALL' || a.specialistId === agendaFilterSpec) && new Date(a.date).toDateString() === selectedDate.toDateString()).length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No hay citas agendadas para este día.</td></tr>
                             )}
                          </tbody>
                        </table>
                      </div>
                   </div>
                 ) : (
                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-[80px_1fr] relative">
                       {/* Column Timeline Headers */}
                       <div className="bg-slate-50 border-r border-slate-200 sticky left-0 z-20">
                          {hours.map(hour => (
                            <div key={hour} className="h-24 border-b border-slate-200 relative flex justify-center pt-2">
                               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1">{hour.toString().padStart(2, '0')}:00</span>
                            </div>
                          ))}
                       </div>
                       
                       {/* Main Grid */}
                       <div className="relative isolate min-w-[300px]">
                          {hours.map(hour => (
                             <div key={hour} className="h-24 border-b border-slate-100 relative group">
                                <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 transition-colors pointer-events-none"></div>
                             </div>
                          ))}
                          
                          {/* Event Blocks mapped to grid dimensions */}
                          {appointments.filter(a => {
                              const isSpec = agendaFilterSpec === 'ALL' || a.specialistId === agendaFilterSpec;
                              const isDay = new Date(a.date).toDateString() === selectedDate.toDateString();
                              return isSpec && isDay;
                          }).map(appt => {
                             const date = new Date(appt.date);
                             const hr = date.getHours();
                             const min = date.getMinutes();
                             if (hr < 8 || hr > 20) return null;
                             
                             const startMinutesOffset = ((hr - 8) * 60) + min;
                             const topPixels = (startMinutesOffset / 60) * 96; // 96px is h-24
                             const heightPixels = (appt.service.duration / 60) * 96;
                             
                             const spColor = appt.specialist.profile?.color || '#3b82f6';
                             const isOnline = appt.sessionType === 'ONLINE';

                             return (
                               <div key={appt.id} onClick={() => { setIsEditingAppt(true); setNewAppt({...appt, date: new Date(appt.date).toISOString().slice(0,16)}); setShowApptModal(true); }} className="absolute left-2 right-4 rounded-xl border p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden"
                                    style={{
                                      top: `${topPixels}px`, 
                                      height: `${Math.max(heightPixels, 40)}px`,
                                      backgroundColor: `${spColor}15`, // 15% opacity hex
                                      borderColor: `${spColor}50`,
                                      borderLeftWidth: '5px',
                                      borderLeftColor: spColor
                                    }}>
                                  <div className="flex justify-between items-start">
                                     <div className="flex flex-col">
                                        <div className="text-xs font-bold text-slate-800 tracking-tight flex items-center">
                                           {appt.client.profile.firstName} {appt.client.profile.lastName}
                                        </div>
                                        <div className="text-[10px] font-medium text-slate-500 mt-0.5">{appt.service.name} • {appt.service.duration} min</div>
                                     </div>
                                     <div className="text-[10px] font-bold text-slate-600 bg-white/60 px-2 py-0.5 rounded-md border border-slate-200 flex items-center shadow-sm">
                                        {date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}
                                        {isOnline ? <Video className="w-3 h-3 ml-1.5 text-indigo-500" /> : <MapPin className="w-3 h-3 ml-1.5 text-[#00A89C]" />}
                                     </div>
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                     </div>
                   </div>
                 )}
              </div>
           )}

        </main>
      </div>

      {showApptModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{isEditingAppt ? 'Detalles de Cita' : 'Bloquear/Agendar Hora'}</h3>
            <form onSubmit={handleSaveAppt} className="space-y-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase">Profesional A Cargo</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.specialistId} onChange={(e) => setNewAppt({...newAppt, specialistId: e.target.value})} disabled={true}>
                  <option value="">Seleccione...</option>
                  {professionals.map(s => <option key={s.id} value={s.id}>{s.name || (s.profile?.firstName + ' ' + s.profile?.lastName)}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Paciente / Cliente</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.clientId} onChange={(e) => setNewAppt({...newAppt, clientId: e.target.value})}>
                  <option value="">Seleccione o cree uno...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.profile?.firstName} {p.profile?.lastName} ({p.profile?.documentId})</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-slate-500 uppercase">Servicio a Realizar / Programa</label>
                <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.serviceId} onChange={(e) => setNewAppt({...newAppt, serviceId: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.duration}min</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Fecha y Hora</label><input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.date} onChange={(e) => setNewAppt({...newAppt, date: e.target.value})} /></div>
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Modalidad</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-[#00A89C]" value={newAppt.sessionType} onChange={(e) => setNewAppt({...newAppt, sessionType: e.target.value})}>
                        <option value="IN_PERSON">Presencial</option>
                        <option value="ONLINE">Telemedicina</option>
                    </select>
                 </div>
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
                <button type="submit" className="flex-1 py-3 text-white font-bold bg-[#00A89C] rounded-xl hover:bg-emerald-500 shadow-lg shadow-[#00A89C]/30 transition-colors">{isEditingAppt ? 'Guardar Cambios' : 'Agendar / Bloquear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SpecialistDashboard;
