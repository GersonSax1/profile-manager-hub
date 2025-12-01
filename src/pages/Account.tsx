import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Bell, Upload, ScanLine, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo-procura.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
  id: string;
  name: string;
  email: string | null;
}

const Account = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
    }
  }, [user, loading]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', user?.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      console.log('Profile fetch result:', { data, error });
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    }
  };

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
          
          {profile && (
            <h2 className="text-xl text-center text-muted-foreground mb-8">
              {profile.name}
            </h2>
          )}
          
          <div className="mt-8 space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Correo Electrónico</p>
              <p className="text-lg font-medium text-card-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full bg-accent hover:bg-accent/90 h-14">
                  Acciones Rápidas
                  <ChevronDown className="w-5 h-5 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[300px] bg-card border-border">
                <DropdownMenuItem 
                  onClick={() => {
                    if (profile) {
                      navigate(`/profile/${profile.id}/alarm/new`);
                    } else {
                      toast.error('Primero debes crear un perfil');
                      navigate('/profiles');
                    }
                  }}
                  className="cursor-pointer hover:bg-accent/10 py-3"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  <span>Crear Alarma</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    if (profile) {
                      navigate(`/profile/${profile.id}/upload`);
                    } else {
                      toast.error('Primero debes crear un perfil');
                      navigate('/profiles');
                    }
                  }}
                  className="cursor-pointer hover:bg-accent/10 py-3"
                >
                  <ScanLine className="w-5 h-5 mr-2" />
                  <span>Escanear Documento</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    if (profile) {
                      navigate(`/profile/${profile.id}/documents`);
                    } else {
                      toast.error('Primero debes crear un perfil');
                      navigate('/profiles');
                    }
                  }}
                  className="cursor-pointer hover:bg-accent/10 py-3"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  <span>Subir Documento</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => {
                console.log('Navigating to profiles...');
                navigate('/profiles');
              }}
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
