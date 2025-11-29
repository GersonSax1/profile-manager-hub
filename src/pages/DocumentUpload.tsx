import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

const DocumentUpload = () => {
  const { profileId } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    if (!name.trim()) {
      toast.error('Por favor ingresa un nombre para el documento');
      return;
    }

    setIsLoading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${profileId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Save document metadata
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          profile_id: profileId,
          name: name.trim(),
          file_url: fileName,
          file_type: file.type,
          file_size: file.size
        });

      if (dbError) throw dbError;

      toast.success('Documento subido exitosamente');
      navigate(`/profile/${profileId}`);
    } catch (error: any) {
      toast.error('Error al subir documento');
      console.error(error);
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
          <h1 className="text-xl font-bold">Subir Documento</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg shadow-lg space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Documento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Examen de sangre 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {file ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <label htmlFor="file" className="cursor-pointer">
                    <span className="text-primary hover:underline font-medium">
                      Selecciona un archivo
                    </span>
                    <span className="text-muted-foreground"> o arrastra y suelta</span>
                  </label>
                  <p className="text-sm text-muted-foreground mt-2">
                    PDF, imágenes, documentos (máx. 20MB)
                  </p>
                </>
              )}
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !file}
            className="w-full"
          >
            {isLoading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default DocumentUpload;
