import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Alarm {
  id: string;
  title: string;
  description: string | null;
  alarm_date: string;
  alarm_time: string;
  frequency: string;
  is_active: boolean;
}

const AlarmsList = () => {
  const { profileId } = useParams();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmsLoading, setAlarmsLoading] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchAlarms();
  }, [user, loading, profileId, navigate]);

  const fetchAlarms = async () => {
    try {
      const { data, error } = await supabase
        .from('alarms')
        .select('*')
        .eq('profile_id', profileId)
        .order('alarm_date', { ascending: true })
        .order('alarm_time', { ascending: true });

      if (error) throw error;
      setAlarms(data || []);
    } catch (error: any) {
      toast.error('Error al cargar alarmas');
      console.error(error);
    } finally {
      setAlarmsLoading(false);
    }
  };

  const deleteAlarm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alarms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Alarma eliminada');
      fetchAlarms();
    } catch (error: any) {
      toast.error('Error al eliminar alarma');
      console.error(error);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      once: 'Una vez',
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual'
    };
    return labels[frequency] || frequency;
  };

  if (alarmsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(`/profile/${profileId}`)} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Alarmas</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        <Button
          onClick={() => navigate(`/profile/${profileId}/alarm/new`)}
          className="w-full mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Alarma
        </Button>

        <div className="space-y-4">
          {alarms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay alarmas programadas</p>
            </div>
          ) : (
            alarms.map((alarm) => (
              <div key={alarm.id} className="bg-card p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{alarm.title}</h3>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {alarm.description && (
                  <p className="text-sm text-muted-foreground mb-3">{alarm.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {format(new Date(alarm.alarm_date), 'dd MMM yyyy', { locale: es })}
                  </span>
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                    {alarm.alarm_time}
                  </span>
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full">
                    {getFrequencyLabel(alarm.frequency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AlarmsList;
