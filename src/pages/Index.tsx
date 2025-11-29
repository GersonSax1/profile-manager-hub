import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, UserPlus, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to profiles if already logged in
  if (user) {
    navigate('/profiles');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ProCura Logo" className="w-16 h-16 object-contain" />
            <span className="text-2xl font-bold">ProCura</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm hover:text-cyan transition-colors">
              Quienes somos
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <User className="w-4 h-4 mr-2" />
              Iniciar sesión
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Registrars
            </Button>
          </nav>
          <button className="md:hidden">
            <Mail className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="text-sm uppercase tracking-wider text-muted-foreground">
            PROCURA ES UNA APLICACIÓN DISEÑADA PARA ORGANIZAR, PROTEGER Y CENTRALIZAR LA INFORMACIÓN MÉDICA Y VETERINARIA DE TODO TU NÚCLEO FAMILIAR.
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Tu salud <span className="text-foreground">y la de tu familia en un solo lugar</span>
          </h1>

          <p className="text-lg text-muted-foreground italic">
            Desde un único espacio digital, podrás guardar documentos médicos, programar recordatorios de tratamientos o controles, y compartir información relevante con los miembros de tu familia de forma segura.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              Comenzar Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Conocer Más
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-lg overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=800&fit=crop"
              alt="Familia revisando documentos médicos"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ProCura Logo" className="w-12 h-12 object-contain" />
              <span className="font-bold text-lg">ProCura</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contacto
              </a>
              <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
