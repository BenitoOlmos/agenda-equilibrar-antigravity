import { useState, useEffect } from 'react';
import { Users, Calendar, LogOut } from 'lucide-react';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('agenda');
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/data/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  return (
    <div className="flex h-screen bg-background-alt font-sans text-carbon overflow-hidden">
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col">
        <div className="h-24 flex flex-col justify-center px-8 border-b border-gray-50/50">
          <img src={LOGO_URL} alt="Equilibrar" className="h-10 w-auto object-contain object-left mb-1" />
          <span className="text-[10px] tracking-[0.2em] text-secondary font-bold uppercase">Coordinación</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {[
            { id: 'agenda', label: 'Calendario Global', icon: Calendar },
            { id: 'users', label: 'Pacientes y Docs', icon: Users }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'text-secondary bg-secondary/10 shadow-sm' 
                  : 'text-carbon/60 hover:bg-gray-50 hover:text-carbon'
              }`}
            >
              <item.icon className="mr-4 h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-gray-50/50">
          <button onClick={() => window.location.href = '/login'} className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-carbon/50 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-white">
        <header className="mb-10 flex justify-between items-end border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-carbon">Panel de Coordinación</h2>
            <p className="text-gray-500 mt-2">Gestiona el flujo operativo: asigna horas y especialistas.</p>
          </div>
          <div className="flex space-x-3">
             <button className="px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-secondary-hover transition-colors shadow-lg shadow-secondary/30">+ Agendar Paciente</button>
             <button className="px-5 py-2.5 bg-carbon text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg">+ Especialista</button>
          </div>
        </header>

        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Citas en Sistema</h3>
            <div className="grid gap-4">
              {appointments.map((cita: any, i: number) => (
                <div key={i} className="flex bg-white rounded-2xl border border-gray-100 p-4 shadow-sm items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">{new Date(cita.date).toLocaleString()}</span>
                    <h4 className="font-bold text-carbon mt-1">{cita.client.profile.firstName} {cita.client.profile.lastName}</h4>
                    <p className="text-sm text-gray-500">con {cita.specialist.profile.firstName} ({cita.service.name})</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-md ${cita.sessionType === 'ONLINE' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {cita.sessionType}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                     <button className="text-sm text-primary font-bold px-3 py-2 bg-primary/5 rounded-lg hover:bg-primary/10">Reprogramar</button>
                     <button className="text-sm text-red-500 font-bold px-3 py-2 bg-red-50 rounded-lg hover:bg-red-100">Cancelar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="p-10 text-center text-gray-500 font-medium">Buscador y directorio de pacientes/especialistas.</div>
        )}
      </main>
    </div>
  );
};

export default CoordinatorDashboard;
