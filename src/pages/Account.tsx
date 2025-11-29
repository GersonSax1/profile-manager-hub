import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Users } from 'lucide-react';
import logo from '@/assets/logo.png';

const Account = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ProCura Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold">ProCura</span>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 hover:opacity-80">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2 text-center">
            ¡Bienvenido!
          </h1>
          
          <div className="mt-8 space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Correo Electrónico</p>
              <p className="text-lg font-medium text-card-foreground">{user.email}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">ID de Usuario</p>
              <p className="text-sm font-mono text-card-foreground break-all">{user.id}</p>
            </div>
          </div>

          <div className="mt-8">
            <Button
              onClick={() => navigate('/profiles')}
              className="w-full bg-secondary hover:bg-secondary/90 h-14"
            >
              <Users className="w-5 h-5 mr-2" />
              Ver Mis Perfiles
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
