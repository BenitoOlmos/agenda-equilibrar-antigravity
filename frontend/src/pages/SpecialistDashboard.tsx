import { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, LogOut, MoveUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const SpecialistDashboard = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/data/appointments')
      .then(res => res.json())
      .then(data => {
        // Mock filtering by a specialist
        setAppointments(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* Header Superior */}
      <header className="bg-[#1e293b] text-white h-14 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
        <div className="flex items-center space-x-8">
          <div className="h-16 flex items-center space-x-3 px-6 border-b border-slate-700/50 flex-shrink-0">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-inner shrink-0">
               <img src={LOGO_URL} className="w-6 object-contain" alt="Logo" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-slate-100">Portal <span className="text-[#00A89C]">Especialista</span></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-l border-slate-700 pl-6 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold leading-tight">Mi Perfil</div>
              <div className="text-[10px] text-emerald-400 font-mono">EN LÍNEA</div>
            </div>
            <div className="w-9 h-9 bg-[#00A89C] rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-[#1e293b]">ES</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`${isMobileMode ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {!isMobileMode && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2">Menú Principal</span>}
            <button onClick={() => setIsMobileMode(!isMobileMode)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
              <LogOut className={`w-4 h-4 transition-transform ${isMobileMode ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            <button onClick={() => setActiveTab('agenda')} className={`w-full flex items-center ${isMobileMode ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all duration-200 group relative ${activeTab === 'agenda' ? 'bg-[#00A89C]/10 text-[#00A89C]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <Calendar className={`w-5 h-5 ${isMobileMode ? '' : 'mr-3'} ${activeTab === 'agenda' ? 'text-[#00A89C]' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!isMobileMode && <span className="text-sm font-semibold tracking-wide">Mis Horas</span>}
            </button>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button onClick={() => navigate('/login')} className={`w-full flex items-center ${isMobileMode ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group`}>
              <LogOut className={`w-5 h-5 ${isMobileMode ? '' : 'mr-3'} group-hover:text-red-400`} />
              {!isMobileMode && <span className="text-sm font-bold">Cerrar Sesión</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-8 custom-scrollbar relative">
          <header className="mb-8 flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Mis Horarios</h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">Gestiona tus enlaces de Meet y pacientes programados.</p>
            </div>
            <button className="px-5 py-2.5 bg-[#00A89C] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#00A89C]/20 hover:bg-emerald-500 transition-colors">
              + Bloquear Horario
            </button>
          </header>

          {loading ? (
             <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A89C]"></div>
             </div>
          ) : (
             <div className="grid gap-4">
                {appointments.map((cita: any, i: number) => {
                   const time = new Date(cita.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   return (
                   <div key={i} className="flex bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                     {/* Time Strip */}
                     <div className={`w-36 flex flex-col items-center justify-center p-6 border-r border-slate-100 ${cita.sessionType === 'ONLINE' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-[#00A89C]'}`}>
                       <span className="text-2xl font-black">{time}</span>
                       <span className="text-[10px] uppercase tracking-widest font-black mt-1 opacity-70">{cita.sessionType}</span>
                     </div>
                     
                     {/* Details */}
                     <div className="flex-1 p-6 flex flex-col justify-center relative">
                       <h4 className="text-xl font-black text-slate-800 tracking-tight">{cita.client.profile.firstName} {cita.client.profile.lastName}</h4>
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{cita.service.name}</p>
                       
                       <div className="mt-4 flex items-center text-sm">
                         {cita.sessionType === 'ONLINE' ? (
                           <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 font-bold hover:bg-indigo-100 transition-colors">
                             <Video className="w-4 h-4 mr-2" />
                             <a href={cita.meetLink} className="hover:underline flex items-center" target="_blank" rel="noreferrer">
                               {cita.meetLink || 'Generar Enlace Meet'}
                               <MoveUpRight className="w-3 h-3 ml-1 opacity-50" />
                             </a>
                           </div>
                         ) : (
                           <div className="flex items-center text-[#00A89C] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold">
                             <MapPin className="w-4 h-4 mr-2" />
                             <span>{cita.notes || 'Consulta Presencial Módulo 3'}</span>
                           </div>
                         )}
                       </div>
                     </div>
                     
                     {/* Actions */}
                     <div className="w-56 p-6 flex flex-col justify-center gap-3 border-l border-slate-50 bg-slate-50/50">
                       <button className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm">Atender / Editar</button>
                       <button className="w-full px-4 py-2 bg-white border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors shadow-sm">Reprogramar</button>
                     </div>
                   </div>
                 )})}
                 {appointments.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
                        <Calendar className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Día Despejado</h3>
                        <p className="text-slate-500">No posees citas ni sesiones este día.</p>
                    </div>
                 )}
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SpecialistDashboard;
