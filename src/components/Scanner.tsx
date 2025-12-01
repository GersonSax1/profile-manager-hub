import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, QrCode, FileText, X, SwitchCamera } from 'lucide-react';
import { toast } from 'sonner';

type ScanMode = 'photo' | 'document' | 'qr';

interface ScannerProps {
  onCapture: (file: File) => void;
  onQrResult?: (result: string) => void;
  onClose: () => void;
}

const Scanner = ({ onCapture, onQrResult, onClose }: ScannerProps) => {
  const [mode, setMode] = useState<ScanMode>('photo');
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('No se pudo acceder a la cámara');
    }
  };

  const startQrScanner = async () => {
    try {
      if (qrScannerRef.current) {
        await qrScannerRef.current.stop();
      }

      const qrScanner = new Html5Qrcode('qr-reader');
      qrScannerRef.current = qrScanner;

      await qrScanner.start(
        { facingMode },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          toast.success('Código QR detectado');
          onQrResult?.(decodedText);
          stopScanning();
        },
        () => {} // Ignore errors during scanning
      );
      setIsScanning(true);
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast.error('No se pudo iniciar el escáner QR');
    }
  };

  const stopScanning = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch (e) {}
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${mode}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopScanning();
        toast.success(mode === 'document' ? 'Documento escaneado' : 'Foto capturada');
      }
    }, 'image/jpeg', 0.9);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Start camera when facingMode changes (for photo/document modes)
  useEffect(() => {
    if (isScanning && mode !== 'qr') {
      startCamera();
    }
  }, [facingMode, isScanning, mode]);

  // Start QR scanner after the element is rendered
  useEffect(() => {
    if (isScanning && mode === 'qr') {
      // Small delay to ensure DOM element exists
      const timer = setTimeout(() => {
        startQrScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScanning, mode]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleModeChange = async (newMode: ScanMode) => {
    await stopScanning();
    setMode(newMode);
  };

  const handleStartScan = () => {
    if (mode === 'qr') {
      setIsScanning(true); // Let useEffect handle starting the scanner after render
    } else {
      startCamera();
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 px-4 flex items-center justify-between">
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">
          {mode === 'photo' && 'Capturar Foto'}
          {mode === 'document' && 'Escanear Documento'}
          {mode === 'qr' && 'Escanear QR'}
        </h2>
        {isScanning && mode !== 'qr' && (
          <button onClick={switchCamera} className="p-2">
            <SwitchCamera className="w-6 h-6" />
          </button>
        )}
        {!isScanning || mode === 'qr' ? <div className="w-10" /> : null}
      </header>

      <div className="flex-1 relative bg-black">
        {!isScanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-6">
            <div className="flex gap-4">
              <Button
                variant={mode === 'photo' ? 'default' : 'outline'}
                onClick={() => handleModeChange('photo')}
                className="flex flex-col gap-2 h-auto py-4 px-6"
              >
                <Camera className="w-8 h-8" />
                <span>Foto</span>
              </Button>
              <Button
                variant={mode === 'document' ? 'default' : 'outline'}
                onClick={() => handleModeChange('document')}
                className="flex flex-col gap-2 h-auto py-4 px-6"
              >
                <FileText className="w-8 h-8" />
                <span>Documento</span>
              </Button>
              <Button
                variant={mode === 'qr' ? 'default' : 'outline'}
                onClick={() => handleModeChange('qr')}
                className="flex flex-col gap-2 h-auto py-4 px-6"
              >
                <QrCode className="w-8 h-8" />
                <span>QR</span>
              </Button>
            </div>
            <Button size="lg" onClick={handleStartScan} className="px-8">
              Iniciar Escaneo
            </Button>
          </div>
        ) : mode === 'qr' ? (
          <div id="qr-reader" className="w-full h-full" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {mode === 'document' && (
              <div className="absolute inset-8 border-2 border-white/50 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {isScanning && mode !== 'qr' && (
        <div className="bg-background p-6 flex justify-center">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center bg-primary/10 active:bg-primary/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-primary" />
          </button>
        </div>
      )}

      {isScanning && mode === 'qr' && (
        <div className="bg-background p-6 flex justify-center">
          <Button variant="outline" onClick={stopScanning}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default Scanner;
