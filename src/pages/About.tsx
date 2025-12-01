import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Users, Shield, Clock } from 'lucide-react';
import logo from '@/assets/logo-procura.png';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <img src={logo} alt="ProCura Logo" className="w-48 h-48 object-contain mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            ¿Quiénes Somos?
          </h1>
          <p className="text-xl text-muted-foreground">
            Tu aliado en el cuidado de la salud familiar
          </p>
        </div>

        <div className="space-y-8">
          {/* Mission Section */}
          <section className="bg-card rounded-lg p-8 shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-3">
                  Nuestra Misión
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  ProCura es una aplicación diseñada para organizar, proteger y centralizar 
                  la información médica y veterinaria de todo tu núcleo familiar en un solo lugar. 
                  Creemos que la salud de tu familia merece estar organizada, accesible y segura.
                </p>
              </div>
            </div>
          </section>

          {/* Target Audience Section */}
          <section className="bg-card rounded-lg p-8 shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-secondary/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground mb-3">
                  ¿A Quién Va Dirigida?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ProCura está pensada para familias que buscan una solución integral 
                  para gestionar la salud de todos sus miembros:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Padres y cuidadores</strong> que administran la información médica de sus hijos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Familias multigeneracionales</strong> que cuidan de adultos mayores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dueños de mascotas</strong> que quieren centralizar información veterinaria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Personas con condiciones crónicas</strong> que necesitan seguimiento constante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Cualquier persona</strong> que valore tener su historial médico organizado y accesible</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-card rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">
              ¿Qué Ofrecemos?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="bg-accent/10 p-3 rounded-full h-fit">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Almacenamiento Seguro</h3>
                  <p className="text-sm text-muted-foreground">
                    Guarda documentos médicos, recetas, resultados de exámenes y más, 
                    todo protegido y accesible solo para ti.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-accent/10 p-3 rounded-full h-fit">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Recordatorios Inteligentes</h3>
                  <p className="text-sm text-muted-foreground">
                    Programa alarmas para tratamientos, controles médicos, vacunas 
                    y nunca olvides una cita importante.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-accent/10 p-3 rounded-full h-fit">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Perfiles Familiares</h3>
                  <p className="text-sm text-muted-foreground">
                    Crea perfiles para cada miembro de la familia, incluyendo mascotas, 
                    con su propia información médica.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-accent/10 p-3 rounded-full h-fit">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-2">Información de Emergencia</h3>
                  <p className="text-sm text-muted-foreground">
                    Accede rápidamente a datos vitales como tipo de sangre, alergias 
                    y contactos de emergencia cuando más lo necesitas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Empieza a Organizar la Salud de Tu Familia Hoy
            </h2>
            <p className="text-muted-foreground mb-6">
              Únete a ProCura y mantén toda la información médica de tu familia 
              segura, organizada y siempre disponible.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="bg-primary hover:bg-primary/90"
            >
              Comenzar Ahora
            </Button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2025 ProCura. Cuidando la salud de tu familia.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
