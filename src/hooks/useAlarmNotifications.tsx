import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Alarm {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  alarm_date: string;
  alarm_time: string;
  frequency: string;
  is_active: boolean;
  last_triggered_at: string | null;
}

// Simple audio context for alarm sound
let audioContext: AudioContext | null = null;

const playAlarmSound = () => {
  try {
    // Create audio context if it doesn't exist
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume audio context if suspended (required for mobile)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Create oscillator for alarm sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    // Create beeping pattern
    const now = audioContext.currentTime;
    for (let i = 0; i < 5; i++) {
      gainNode.gain.setValueAtTime(0.3, now + i * 0.3);
      gainNode.gain.setValueAtTime(0, now + i * 0.3 + 0.15);
    }

    oscillator.start(now);
    oscillator.stop(now + 1.5);

    // Try to vibrate if available
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  } catch (error) {
    console.error('Error playing alarm sound:', error);
  }
};

const sendEmailNotification = async (alarm: Alarm) => {
  try {
    const { error } = await supabase.functions.invoke('send-alarm-notification', {
      body: {
        alarmId: alarm.id,
        profileId: alarm.profile_id,
        title: alarm.title,
        description: alarm.description,
      },
    });

    if (error) {
      console.error('Error sending email notification:', error);
    } else {
      console.log('Email notification sent for alarm:', alarm.title);
    }
  } catch (error) {
    console.error('Error invoking notification function:', error);
  }
};

export const useAlarmNotifications = (userId: string | undefined) => {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  const checkAlarms = useCallback(async () => {
    if (!userId) return;

    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      // Get user's profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId);

      if (profilesError || !profiles?.length) return;

      const profileIds = profiles.map(p => p.id);

      // Get active alarms for today at or before current time
      const { data: alarms, error: alarmsError } = await supabase
        .from('alarms')
        .select('*')
        .in('profile_id', profileIds)
        .eq('is_active', true)
        .lte('alarm_date', currentDate)
        .lte('alarm_time', currentTime);

      if (alarmsError || !alarms?.length) return;

      for (const alarm of alarms) {
        const alarmKey = `${alarm.id}-${currentDate}`;
        
        // Skip if already triggered today
        if (triggeredAlarmsRef.current.has(alarmKey)) continue;

        // Check if alarm should trigger based on frequency
        const alarmDate = new Date(alarm.alarm_date);
        const shouldTrigger = shouldAlarmTrigger(alarm, alarmDate, now);

        if (shouldTrigger) {
          // Mark as triggered for today
          triggeredAlarmsRef.current.add(alarmKey);

          // Play sound
          playAlarmSound();

          // Show toast notification
          toast.info(`🔔 ${alarm.title}`, {
            description: alarm.description || 'Alarma programada',
            duration: 10000,
          });

          // Send email notification
          sendEmailNotification(alarm);
        }
      }
    } catch (error) {
      console.error('Error checking alarms:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Check alarms every 30 seconds
    checkAlarms();
    checkIntervalRef.current = setInterval(checkAlarms, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [userId, checkAlarms]);

  // Clear triggered alarms at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        triggeredAlarmsRef.current.clear();
      }
    };

    const midnightInterval = setInterval(checkMidnight, 60000);
    return () => clearInterval(midnightInterval);
  }, []);
};

function shouldAlarmTrigger(alarm: Alarm, alarmDate: Date, now: Date): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const alarmDay = new Date(alarmDate.getFullYear(), alarmDate.getMonth(), alarmDate.getDate());

  switch (alarm.frequency) {
    case 'once':
      return alarmDay.getTime() === today.getTime();
    
    case 'daily':
      return alarmDay.getTime() <= today.getTime();
    
    case 'weekly':
      if (alarmDay.getTime() > today.getTime()) return false;
      const daysDiff = Math.floor((today.getTime() - alarmDay.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff % 7 === 0;
    
    case 'monthly':
      if (alarmDay.getTime() > today.getTime()) return false;
      return alarmDate.getDate() === now.getDate();
    
    default:
      return false;
  }
}
