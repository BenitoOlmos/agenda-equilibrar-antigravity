import { useState, useEffect } from 'react';
import { Calendar, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/data/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
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
            <span className="font-bold text-[15px] tracking-tight text-slate-100">Portal <span className="text-secondary">Coordinador</span></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 border-l border-slate-700 pl-6 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold leading-tight">Mesa de Ayuda</div>
              <div className="text-[10px] text-blue-400 font-mono">OPERATIVO</div>
            </div>
            <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-[#1e293b]">CO</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`${isMobileMode ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20`}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {!isMobileMode && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2">Menú Operativo</span>}
            <button onClick={() => setIsMobileMode(!isMobileMode)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
              <LogOut className={`w-4 h-4 transition-transform ${isMobileMode ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {[
              { id: 'agenda', label: 'Calendario Global', icon: Calendar },
              { id: 'users', label: 'Directorio', icon: Users }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${isMobileMode ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all duration-200 group relative ${
                  activeTab === item.id 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isMobileMode ? '' : 'mr-3'} ${activeTab === item.id ? 'text-secondary' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!isMobileMode && <span className="text-sm font-semibold tracking-wide">{item.label}</span>}
              </button>
            ))}
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
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Panel de Control General</h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">Asigna horas, reubica especialistas y atiende recepción.</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:bg-secondary-hover transition-colors">
                + Agendar Cita
              </button>
            </div>
          </header>

          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {appointments.map((cita: any, i: number) => {
                  const time = new Date(cita.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={i} className="flex bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden items-center justify-between p-2 pl-6 hover:shadow-md transition-shadow group">
                      <div className="flex items-center space-x-6">
                         <div className="flex flex-col border-r border-slate-100 pr-6">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{new Date(cita.date).toLocaleDateString()}</span>
                           <span className="text-2xl font-black text-slate-800 tracking-tight leading-loose">{time}</span>
                         </div>
                         <div>
                           <h4 className="font-black text-lg text-slate-800 flex items-center">
                             {cita.client.profile.firstName} {cita.client.profile.lastName}
                           </h4>
                           <div className="flex items-center text-sm font-bold text-slate-500">
                             <div className="flex items-center space-x-2 mr-3 bg-slate-50 p-1 rounded-md px-2 border border-slate-100">
                               <img src={`https://ui-avatars.com/api/?name=${cita.specialist.profile.firstName}+${cita.specialist.profile.lastName}&background=random&color=fff&rounded=true&bold=true`} className="w-4 h-4 rounded-full"/>
                               <span>{cita.specialist.profile.firstName} {cita.specialist.profile.lastName}</span>
                             </div>
                             <span className="text-secondary">{cita.service.name}</span>
                           </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 pr-4">
                        <span className={`px-4 py-2 text-xs font-black tracking-widest uppercase rounded-xl border ${cita.sessionType === 'ONLINE' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-[#00A89C] border-emerald-100'}`}>
                            {cita.sessionType}
                        </span>
                        
                        <div className="flex space-x-2 border-l border-slate-100 pl-6">
                           <button className="text-xs text-slate-500 font-bold px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Mover Hora</button>
                           <button className="text-xs text-red-500 font-bold px-4 py-2 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors">Cancelar</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
                <Users className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Directorio de Perfiles</h3>
                <p className="text-slate-500">Buscador y directorio de pacientes/especialistas.</p>
                <button className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold hidden border border-slate-200">Exportar Excel</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
