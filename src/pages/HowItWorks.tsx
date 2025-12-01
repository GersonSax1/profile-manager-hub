import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Bell, Upload, Shield, Heart } from 'lucide-react';
import logo from '@/assets/logo-procura.png';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <div className="flex items-center gap-3">
            <img src={logo} alt="ProCura Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold">ProCura</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            ¿Cómo Funciona ProCura?
          </h1>
          <p className="text-lg text-muted-foreground">
            Gestiona la salud de toda tu familia en tres simples pasos
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                1. Crea Perfiles Familiares
              </h2>
              <p className="text-muted-foreground mb-4">
                Registra a todos los miembros de tu familia en un solo lugar. Agrega información importante como tipo de sangre, alergias y datos de contacto. Cada perfil puede ser de una persona o incluso de tu mascota.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ✓ Información médica centralizada<br />
                  ✓ Datos de emergencia siempre disponibles<br />
                  ✓ Incluye a toda tu familia y mascotas
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                2. Sube y Organiza Documentos
              </h2>
              <p className="text-muted-foreground mb-4">
                Guarda todos los documentos médicos de forma segura: recetas, resultados de laboratorio, radiografías, cartillas de vacunación y más. Todo organizado por perfil y siempre accesible cuando lo necesites.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ✓ Almacenamiento seguro en la nube<br />
                  ✓ Acceso rápido desde cualquier dispositivo<br />
                  ✓ Organización automática por perfil
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                3. Programa Recordatorios
              </h2>
              <p className="text-muted-foreground mb-4">
                Nunca olvides una cita médica, toma de medicamentos o control veterinario. Crea alarmas personalizadas para cada miembro de la familia y recibe notificaciones oportunas.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ✓ Recordatorios personalizados<br />
                  ✓ Frecuencias diarias, semanales o mensuales<br />
                  ✓ Notificaciones en el momento adecuado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-card-foreground mb-8">
            Beneficios de ProCura
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-card-foreground mb-2">Seguridad y Privacidad</h3>
                <p className="text-sm text-muted-foreground">
                  Tus datos están protegidos con encriptación de nivel bancario. Solo tú tienes acceso a la información médica de tu familia.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Heart className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-card-foreground mb-2">Paz Mental</h3>
                <p className="text-sm text-muted-foreground">
                  Ten toda la información importante al alcance de tu mano en caso de emergencias. Responde rápidamente cuando cada segundo cuenta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-muted-foreground mb-6">
            Crea tu cuenta gratuita y comienza a organizar la salud de tu familia hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="bg-primary hover:bg-primary/90"
            >
              Crear Cuenta Gratis
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth?mode=login')}
            >
              Ya Tengo Cuenta
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logo} alt="ProCura Logo" className="w-12 h-12 object-contain" />
            <span className="font-bold text-lg">ProCura</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Tu salud y la de tu familia en un solo lugar
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
