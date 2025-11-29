import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, FileText, Upload, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  blood_type: string | null;
}

const ProfileDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (id !== 'new') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, id, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error('Error al cargar el perfil');
      console.error(error);
      navigate('/profiles');
    } finally {
      setLoading(false);
    }
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

  if (id === 'new') {
    navigate('/profile-form/new');
    return null;
  }

  if (!profile) {
    return null;
  }

  const menuItems = [
    {
      icon: Bell,
      title: 'Crear Alarma',
      description: 'Programa recordatorios médicos',
      onClick: () => navigate(`/profile/${id}/alarm/new`),
      color: 'text-accent'
    },
    {
      icon: FileText,
      title: 'Ver Documentos',
      description: 'Consulta documentos médicos',
      onClick: () => navigate(`/profile/${id}/documents`),
      color: 'text-secondary'
    },
    {
      icon: Upload,
      title: 'Subir Documento',
      description: 'Carga archivos e imágenes',
      onClick: () => navigate(`/profile/${id}/upload`),
      color: 'text-primary'
    },
    {
      icon: Clock,
      title: 'Ver Alarmas',
      description: 'Gestiona tus recordatorios',
      onClick: () => navigate(`/profile/${id}/alarms`),
      color: 'text-cyan'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/profiles')} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Perfil</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        {/* Profile Info */}
        <div className="bg-card p-6 rounded-lg shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.phone || 'Sin teléfono'}</p>
              <p className="text-accent">{profile.email || 'Sin correo'}</p>
              {profile.blood_type && (
                <p className="text-sm font-semibold mt-1">
                  <span className="text-muted-foreground">Tipo de sangre: </span>
                  <span className="text-primary">{profile.blood_type}</span>
                </p>
              )}
            </div>
          </div>
          
          <Button
            onClick={() => navigate(`/profile-form/${id}`)}
            className="w-full bg-secondary hover:bg-secondary/90 mt-4"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        </div>

        {/* Menu Options */}
        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left group"
            >
              <item.icon className={`w-12 h-12 mb-3 ${item.color} group-hover:scale-110 transition-transform`} />
              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProfileDetail;
