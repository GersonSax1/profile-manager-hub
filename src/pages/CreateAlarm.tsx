import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const alarmSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().max(500).optional(),
  alarm_date: z.string().min(1, 'La fecha es requerida'),
  alarm_time: z.string().min(1, 'La hora es requerida'),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly'])
});

const CreateAlarm = () => {
  const { profileId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alarmDate, setAlarmDate] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      alarmSchema.parse({
        title,
        description,
        alarm_date: alarmDate,
        alarm_time: alarmTime,
        frequency
      });

      const { error } = await supabase
        .from('alarms')
        .insert({
          profile_id: profileId,
          title,
          description: description || null,
          alarm_date: alarmDate,
          alarm_time: alarmTime,
          frequency,
          is_active: true
        });

      if (error) throw error;

      toast.success('Alarma creada exitosamente');
      navigate(`/profile/${profileId}/alarms`);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error('Error al crear la alarma');
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
          <button onClick={() => navigate(`/profile/${profileId}`)} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Nueva Alarma</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg shadow-lg space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Tomar medicamento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={alarmDate}
                onChange={(e) => setAlarmDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <Input
                id="time"
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frecuencia</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Una vez</SelectItem>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Guardando...' : 'Crear Alarma'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default CreateAlarm;
