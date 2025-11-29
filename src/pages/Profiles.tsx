import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Plus, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronRight } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const Profiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfiles();
  }, [user, navigate]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast.error('Error al cargar perfiles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Selecciona tu perfil</h1>
          <button onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        <div className="space-y-3">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => navigate(`/profile/${profile.id}`)}
              className="w-full bg-card p-4 rounded-lg shadow hover:shadow-lg transition-shadow flex items-center gap-4"
            >
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.phone || '(123) 456-7890'}</p>
                <p className="text-sm text-accent">{profile.email || 'correo@ejemplo.com'}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </button>
          ))}

          <Button
            onClick={() => navigate('/profile/new')}
            className="w-full bg-secondary hover:bg-secondary/90 h-16"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Nuevo Perfil
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profiles;
