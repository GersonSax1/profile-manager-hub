import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Phone, CheckCircle2 } from 'lucide-react';

interface PhoneVerificationProps {
  currentPhone?: string | null;
  phoneConfirmed?: boolean;
  onVerified?: () => void;
}

const phoneRegex = /^\+[1-9]\d{7,14}$/;

const PhoneVerification = ({ currentPhone, phoneConfirmed, onVerified }: PhoneVerificationProps) => {
  const [phone, setPhone] = useState(currentPhone ?? '+569');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const sendCode = async () => {
    if (!phoneRegex.test(phone)) {
      toast.error('Ingresa el número con código de país, por ejemplo +56912345678');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ phone });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Te enviamos un código por mensaje de texto');
    setStep('code');
  };

  const verifyCode = async () => {
    if (code.trim().length < 4) {
      toast.error('Ingresa el código que recibiste');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code.trim(),
      type: 'phone_change',
    });
    setIsLoading(false);
    if (error) {
      toast.error('El código no es válido o ya expiró');
      return;
    }
    toast.success('¡Número verificado!');
    setCode('');
    setStep('phone');
    onVerified?.();
  };

  if (phoneConfirmed && currentPhone && step === 'phone') {
    return (
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Celular verificado</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-medium text-card-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            +{currentPhone.replace(/^\+/, '')}
          </p>
          <Button variant="outline" size="sm" onClick={() => setPhone(`+${currentPhone.replace(/^\+/, '')}`)}>
            Cambiar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Phone className="w-4 h-4" /> Verificación por mensaje de texto
      </p>

      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">Número de celular</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+56912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
            />
            <p className="text-xs text-muted-foreground">Incluye el código de país (Chile: +56)</p>
          </div>
          <Button onClick={sendCode} disabled={isLoading} className="w-full">
            {isLoading ? 'Enviando...' : 'Enviarme un código'}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Código recibido</Label>
            <Input
              id="code"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={verifyCode} disabled={isLoading} className="flex-1">
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
            <Button variant="outline" onClick={() => setStep('phone')} disabled={isLoading}>
              Volver
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhoneVerification;
