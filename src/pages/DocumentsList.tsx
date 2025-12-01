import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

const DocumentsList = () => {
  const { profileId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchDocuments();
  }, [user, loading, profileId, navigate]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast.error('Error al cargar documentos');
      console.error(error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const deleteDocument = async (id: string, fileUrl: string) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([fileUrl]);

      if (storageError) throw storageError;

      // Delete document metadata
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      
      toast.success('Documento eliminado');
      fetchDocuments();
    } catch (error: any) {
      toast.error('Error al eliminar documento');
      console.error(error);
    }
  };

  const downloadDocument = async (fileUrl: string, name: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Error al descargar documento');
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (documentsLoading) {
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
          <h1 className="text-xl font-bold">Documentos</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-8">
        <Button
          onClick={() => navigate(`/profile/${profileId}/upload`)}
          className="w-full mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Subir Documento
        </Button>

        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay documentos subidos</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="bg-card p-4 rounded-lg shadow">
                <div className="flex items-start gap-3">
                  <FileText className="w-10 h-10 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadDocument(doc.file_url, doc.name)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id, doc.file_url)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentsList;
