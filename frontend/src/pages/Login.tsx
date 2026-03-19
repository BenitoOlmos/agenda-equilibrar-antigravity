import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const LOGO_URL = 'https://www.clinicaequilibrar.cl/assets/logo-CYF-QZPl.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      setTimeout(() => {
        if (email === 'admin@equilibrar.cl') {
          navigate('/admin');
        } else if (email === 'coord@equilibrar.cl') {
          navigate('/coordinator');
        } else if (email === 'mariapaz@equilibrar.cl' || email === 'fernando@equilibrar.cl') {
          navigate('/specialist');
        } else if (email.includes('cliente')) {
          navigate('/client');
        } else {
          setError('Credenciales inválidas');
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Error al conectar con el servidor');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-alt p-4 sm:p-8">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className={`w-full max-w-md overflow-hidden rounded-3xl shadow-2xl glass-panel transition-all duration-700 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="p-8 sm:p-12">
          
          <div className="mb-10 flex flex-col items-center">
            <img src={LOGO_URL} alt="Clínica Equilibrar Logo" className="h-20 w-auto mb-6 drop-shadow-sm transition-transform hover:scale-105 duration-500" />
            <h2 className="text-2xl font-bold tracking-tight text-carbon">Inicio de Sesión</h2>
            <p className="mt-2 text-sm text-center text-carbon/70">
              Accede a tu plataforma integral de salud.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 animate-fade-in shadow-inner">
                {error}
              </div>
            )}
            
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-carbon/80 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3.5 text-carbon placeholder-gray-400 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="tu@correo.cl"
                required
              />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-carbon/80 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3.5 text-carbon placeholder-gray-400 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:shadow-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    Ingresar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
