import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido').max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  bloodType: z.string().optional(),
  allergies: z.string().max(500).optional(),
  medications: z.string().max(500).optional(),
  profileType: z.enum(['human', 'pet']),
  rut: z.string().regex(rutRegex, 'RUT inválido (formato: 12345678-9)').optional().or(z.literal(''))
}).refine((data) => {
  if (data.profileType === 'human' && !data.rut) {
    return false;
  }
  return true;
}, {
  message: 'El RUT es requerido para personas',
  path: ['rut']
});

const ProfileForm = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [profileType, setProfileType] = useState<'human' | 'pet'>('human');
  const [rut, setRut] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (id && id !== 'new') {
      setIsEditing(true);
      fetchProfile();
    }
  }, [id, user, loading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error('Perfil no encontrado');
        navigate('/profiles');
        return;
      }
      
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setBloodType(data.blood_type || '');
      setAllergies(data.allergies || '');
      setMedications(data.medications || '');
      setProfileType((data.profile_type as 'human' | 'pet') || 'human');
      setRut(data.rut || '');
    } catch (error: any) {
      toast.error('Error al cargar el perfil');
      console.error(error);
      navigate('/profiles');
    }
  };

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      profileSchema.parse({ name, email, phone, bloodType, allergies, medications, profileType, rut });

      const profileData = {
        name,
        email: email || null,
        phone: phone || null,
        blood_type: bloodType || null,
        allergies: allergies || null,
        medications: medications || null,
        profile_type: profileType,
        rut: profileType === 'human' ? (rut || null) : null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Perfil actualizado exitosamente');
        navigate('/profiles');
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...profileData
          })
          .select()
          .single();

        if (error) throw error;
        toast.success('Perfil creado exitosamente');
        navigate('/profiles');
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error(isEditing ? 'Error al actualizar el perfil' : 'Error al crear el perfil');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(isEditing ? `/profile/${id}` : '/profiles')} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{isEditing ? 'Editar Perfil' : 'Nuevo Perfil'}</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg shadow-lg space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileType">Tipo de Perfil *</Label>
            <Select value={profileType} onValueChange={(value: 'human' | 'pet') => setProfileType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="human">Persona</SelectItem>
                <SelectItem value="pet">Mascota</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{profileType === 'human' ? 'Nombre Completo' : 'Nombre de la Mascota'} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={profileType === 'human' ? 'Juan Pérez' : 'Max'}
              required
            />
          </div>

          {profileType === 'human' && (
            <div className="space-y-2">
              <Label htmlFor="rut">RUT *</Label>
              <Input
                id="rut"
                value={rut}
                onChange={(e) => setRut(e.target.value.toUpperCase())}
                placeholder="12345678-9"
                required
              />
              <p className="text-xs text-muted-foreground">
                Formato: 12345678-9 o 12345678-K
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodType">Tipo de Sangre</Label>
            <Select value={bloodType} onValueChange={setBloodType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona tu tipo de sangre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+ (A Positivo)</SelectItem>
                <SelectItem value="A-">A- (A Negativo)</SelectItem>
                <SelectItem value="B+">B+ (B Positivo)</SelectItem>
                <SelectItem value="B-">B- (B Negativo)</SelectItem>
                <SelectItem value="AB+">AB+ (AB Positivo) - Receptor universal</SelectItem>
                <SelectItem value="AB-">AB- (AB Negativo)</SelectItem>
                <SelectItem value="O+">O+ (O Positivo) - El más común</SelectItem>
                <SelectItem value="O-">O- (O Negativo) - Donante universal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Input
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Penicilina, maní, polen..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Indica cualquier alergia conocida (medicamentos, alimentos, otros)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Medicamentos</Label>
            <Input
              id="medications"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="Aspirina, Ibuprofeno, Metformina..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Lista los medicamentos que consume regularmente
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Perfil'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ProfileForm;
