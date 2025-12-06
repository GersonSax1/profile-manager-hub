import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

interface DocumentWithThumbnail extends Document {
  thumbnailUrl?: string;
}

const DocumentsList = () => {
  const { profileId } = useParams();
  const [documents, setDocuments] = useState<DocumentWithThumbnail[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isImageType = (fileType: string | null) => {
    if (!fileType) return false;
    return fileType.startsWith('image/');
  };

  const isPdfType = (fileType: string | null) => {
    if (!fileType) return false;
    return fileType === 'application/pdf';
  };

  const generatePdfThumbnail = async (pdfUrl: string): Promise<string | undefined> => {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const scale = 0.5;
      const viewport = page.getViewport({ scale });
      
      const canvas = window.document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return undefined;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      return undefined;
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Generate thumbnail URLs for images and PDFs
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const docsWithThumbnails = await Promise.all(
        (data || []).map(async (doc: Document) => {
          const { data: signedData } = await supabase.storage
            .from('documents')
            .createSignedUrl(doc.file_url, 3600);
          
          const fullUrl = signedData?.signedUrl 
            ? (signedData.signedUrl.startsWith('http') 
                ? signedData.signedUrl 
                : `${supabaseUrl}/storage/v1${signedData.signedUrl}`)
            : undefined;

          if (isImageType(doc.file_type) && fullUrl) {
            return { ...doc, thumbnailUrl: fullUrl };
          }
          
          if (isPdfType(doc.file_type) && fullUrl) {
            const pdfThumbnail = await generatePdfThumbnail(fullUrl);
            return { ...doc, thumbnailUrl: pdfThumbnail };
          }
          
          return doc;
        })
      );
      
      setDocuments(docsWithThumbnails);
    } catch (error: any) {
      toast.error('Error al cargar documentos');
      console.error(error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const deleteDocument = async (id: string, fileUrl: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([fileUrl]);

      if (storageError) throw storageError;

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

  const viewDocument = async (doc: Document) => {
    try {
      // For PDFs, get a signed URL and open directly using window.location for better mobile support
      if (isPdf(doc.file_type)) {
        toast.info('Abriendo PDF...');
        
        const { data: signedData, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(doc.file_url, 3600); // 1 hour expiry

        if (signedError) throw signedError;
        
        // Direct navigation works better on mobile browsers
        window.location.href = signedData.signedUrl;
        return;
      }

      // For images, download and show in dialog
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_url);

      if (error) throw error;

      // Cleanup previous URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const mimeType = doc.file_type || 'application/octet-stream';
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setPreviewType(doc.file_type);
      setPreviewName(doc.name);
      setPreviewOpen(true);
    } catch (error: any) {
      toast.error('Error al visualizar documento');
      console.error(error);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewType(null);
    setPreviewName('');
  };

  const isImage = (fileType: string | null) => {
    if (!fileType) return false;
    return fileType.startsWith('image/');
  };

  const isPdf = (fileType: string | null) => {
    if (!fileType) return false;
    return fileType === 'application/pdf';
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
                  {doc.thumbnailUrl ? (
                    <img 
                      src={doc.thumbnailUrl} 
                      alt={doc.name}
                      className="w-12 h-12 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-primary flex-shrink-0" />
                  )}
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
                    {(isImage(doc.file_type) || isPdf(doc.file_type)) && (
                      <button
                        onClick={() => viewDocument(doc)}
                        className="text-accent hover:text-accent/80"
                        title="Ver documento"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => downloadDocument(doc.file_url, doc.name)}
                      className="text-primary hover:text-primary/80"
                      title="Descargar"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span className="truncate">{previewName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {previewUrl && isImage(previewType) && (
              <img
                src={previewUrl}
                alt={previewName}
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            )}
            {previewUrl && isPdf(previewType) && (
              <div className="w-full h-[70vh] flex flex-col">
                <object
                  data={previewUrl}
                  type="application/pdf"
                  className="w-full flex-1"
                >
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                    <p>No se puede mostrar el PDF en el navegador.</p>
                    <Button onClick={() => window.open(previewUrl, '_blank')}>
                      Abrir en nueva pestaña
                    </Button>
                  </div>
                </object>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsList;
