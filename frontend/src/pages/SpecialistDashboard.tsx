import { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, LogOut } from 'lucide-react';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const SpecialistDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/data/appointments')
      .then(res => res.json())
      .then(data => {
        // Mock filtering by a specialist (e.g. ID of Fernando or Maria Paz)
        // For demonstration, we just show all or filter by the first specialist
        setAppointments(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen bg-background-alt font-sans text-carbon overflow-hidden">
      
      {/* Sidebar Focus: Specialist */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col">
        <div className="h-24 flex flex-col justify-center px-8 border-b border-gray-50/50">
          <img src={LOGO_URL} alt="Equilibrar" className="h-10 w-auto object-contain object-left mb-1" />
          <span className="text-[10px] tracking-[0.2em] text-primary font-bold uppercase">Portal Especialista</span>
        </div>
        
        <div className="p-8">
          <h3 className="text-sm font-bold text-carbon mb-4 tracking-wide uppercase">Mi Día</h3>
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Próxima Cita</p>
              <p className="text-lg font-bold text-carbon">09:00 AM</p>
              <p className="text-sm text-carbon/70">Camila Rojas - Online</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
           <button className="w-full relative flex items-center px-4 py-3.5 rounded-2xl text-sm font-medium text-primary bg-primary/5">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
              <Calendar className="mr-4 h-5 w-5" />
              <span>Mi Agenda</span>
           </button>
        </nav>
        
        <div className="p-6 border-t border-gray-50/50">
          <button onClick={() => window.location.href = '/login'} className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-carbon/50 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Agenda Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-background-alt to-white">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-carbon">Mis Horas y Sesiones</h2>
            <p className="text-gray-500 mt-2">Gestiona tus enlaces de Meet y disponibilidades.</p>
          </div>
          <button className="px-5 py-2.5 bg-carbon text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-colors">
            + Bloquear Horario
          </button>
        </header>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((cita: any, i: number) => {
               const time = new Date(cita.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               return (
              <div key={i} className="flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Time Strip */}
                <div className={`w-32 flex flex-col items-center justify-center p-6 border-r border-gray-100 ${cita.sessionType === 'ONLINE' ? 'bg-primary/5 text-primary' : 'bg-secondary/5 text-secondary-hover'}`}>
                  <span className="text-xl font-bold">{time}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold mt-1">{cita.sessionType}</span>
                </div>
                
                {/* Details */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <h4 className="text-lg font-bold text-carbon">{cita.client.profile.firstName} {cita.client.profile.lastName}</h4>
                  <p className="text-sm text-carbon/60">{cita.service.name}</p>
                  
                  <div className="mt-4 flex items-center text-sm">
                    {cita.sessionType === 'ONLINE' ? (
                      <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                        <Video className="w-4 h-4 mr-2" />
                        <a href={cita.meetLink} className="hover:underline font-medium" target="_blank" rel="noreferrer">
                          {cita.meetLink || 'Generar Enlace Meet'}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="font-medium">{cita.notes || 'Consulta Presencial'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="w-48 p-6 flex flex-col justify-center gap-3 border-l border-gray-50 bg-gray-50/30">
                  <button className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors">Editar Enlace</button>
                  <button className="w-full px-4 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">Cancelar / Reprogramar</button>
                </div>
              </div>
            )})}
          </div>
        )}
      </main>
    </div>
  );
};

export default SpecialistDashboard;
