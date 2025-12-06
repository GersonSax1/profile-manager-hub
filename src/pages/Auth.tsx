import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { useState } from 'react';
import logo from '@/assets/logo-procura.png';

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').max(255),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  confirmPassword: z.string().optional(),
  bloodType: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword !== undefined) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
}).refine((data) => {
  if (!data.name && data.confirmPassword !== undefined) {
    return false;
  }
  return true;
}, {
  message: 'El nombre completo es requerido',
  path: ['name']
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate('/account');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validationData = isLogin 
        ? { email, password }
        : { name, email, password, confirmPassword, bloodType };
      
      authSchema.parse(validationData);

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Credenciales incorrectas');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('¡Sesión iniciada!');
          navigate('/account');
        }
      } else {
        const { error } = await signUp(email, password, name, bloodType);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este correo ya está registrado');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('¡Cuenta creada! Ahora puedes iniciar sesión');
          setIsLogin(true);
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Error al iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Volver a la página principal"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <span className="text-2xl font-bold">ProCura</span>
          <div className="w-20" /> {/* Spacer para centrar el título */}
        </div>
      </header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="ProCura Logo" className="w-40 h-40 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground mb-8 text-center">
            {isLogin ? 'Iniciar Sesión' : 'Crea una cuenta'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="text-sm font-medium">
                    Tipo de Sangre
                  </Label>
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
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirma Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma Contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isGoogleLoading ? 'Conectando...' : 'Google'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent hover:underline font-medium"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Iniciar Sesión'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
