import { useState, useEffect } from 'react';
import { Calendar, CreditCard, User, LogOut } from 'lucide-react';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const ClientPortal = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/data/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data));
  }, []);

  return (
    <div className="min-h-screen bg-background-alt font-sans text-carbon">
      
      {/* Top Navbar Minimalist */}
      <nav className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <img src={LOGO_URL} alt="Equilibrar" className="h-10 w-auto object-contain" />
        <div className="flex items-center space-x-6">
          <button className="text-sm font-medium hover:text-primary transition-colors">Mis Horas</button>
          <button className="text-sm font-medium hover:text-primary transition-colors">Mis Pagos</button>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
            <User className="h-5 w-5" />
          </div>
          <button onClick={() => window.location.href = '/login'} className="text-carbon/50 hover:text-red-500">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-carbon mb-2">Portal Paciente</h1>
            <p className="text-carbon/60">Gestiona tus próximos servicios, profesionales y pagos.</p>
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5 transition-all">
             Agendar Nueva Hora
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <Calendar className="mr-2 text-primary" /> Próximas Atenciones
            </h3>
            
            {appointments.map((cita: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 bg-gray-50 rounded-lg text-sm font-bold text-carbon border border-gray-200">
                      {new Date(cita.date).toLocaleDateString()} - {new Date(cita.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${cita.sessionType === 'ONLINE' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {cita.sessionType}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-carbon">{cita.service.name}</h4>
                  <p className="text-sm text-carbon/60">Con {cita.specialist.profile.firstName} {cita.specialist.profile.lastName}</p>
                </div>
                
                <div className="flex flex-col space-y-2 min-w-[140px]">
                  {cita.sessionType === 'ONLINE' && cita.meetLink ? (
                    <a href={cita.meetLink} target="_blank" rel="noreferrer" className="text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 border border-blue-200">
                      Entrar a Sesión
                    </a>
                  ) : null}
                  {cita.payment?.status !== 'COMPLETED' ? (
                     <button className="flex items-center justify-center px-4 py-2 bg-carbon text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">
                        <CreditCard className="w-4 h-4 mr-2" /> Pagar Ahora
                     </button>
                  ) : (
                    <div className="text-center px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200 flex items-center justify-center">
                      ✓ Pagado
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             <div className="bg-gradient-to-br from-secondary/10 to-transparent p-6 rounded-3xl border border-secondary/20">
               <h3 className="font-bold text-carbon mb-4">Mis Programas Activos</h3>
               <div className="bg-white p-4 rounded-xl border border-gray-100 mb-3 shadow-sm">
                 <p className="font-bold text-sm text-carbon">Programa Bienestar</p>
                 <div className="w-full bg-gray-100 rounded-full h-2 mt-3 mb-1">
                   <div className="bg-secondary h-2 rounded-full" style={{ width: '25%' }}></div>
                 </div>
                 <p className="text-xs text-carbon/50 text-right">Sesión 1 de 4</p>
               </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-carbon mb-4">Historial de Pagos</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                   <span className="text-carbon/70">19 Mar 2026</span>
                   <span className="font-bold text-carbon">$35.000</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;
