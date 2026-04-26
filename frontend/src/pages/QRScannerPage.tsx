import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flashlight, Keyboard, Camera, CheckCircle, Utensils } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTable } from '../contexts/TableContext';

export default function QRScannerPage() {
  const navigate = useNavigate();
  const { setCurrentTable } = useTable();
  const [isScanning, setIsScanning] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Neue States für User-Feedback
  const [tableFromUrl, setTableFromUrl] = useState<number | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Tischnummer aus URL extrahieren beim Start
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) {
      const tableNum = parseInt(tableParam);
      if (!isNaN(tableNum) && tableNum >= 1 && tableNum <= 12) {
        setTableFromUrl(tableNum);
        // Automatisch Tisch setzen und Erfolg anzeigen
        handleTableFound(tableNum, `url:table=${tableNum}`);
      }
    }
  }, []);

  // Countdown für automatische Weiterleitung
  useEffect(() => {
    if (showSuccessScreen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessScreen && countdown === 0) {
      // Weiterleitung zur Bestellseite
      navigate('/');
    }
  }, [showSuccessScreen, countdown, navigate]);

  // Initialize QR Scanner
  useEffect(() => {
    if (!isScanning || showManualInput || showSuccessScreen) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    html5QrCodeRef.current = new Html5Qrcode('qr-reader');
    
    html5QrCodeRef.current.start(
      { facingMode: 'environment' },
      config,
      handleScanSuccess,
      handleScanFailure
    ).catch((err) => {
      console.error('QR Scanner error:', err);
      setError('Kamera-Zugriff fehlgeschlagen. Bitte Berechtigungen prüfen.');
      setIsScanning(false);
    });

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning, showManualInput, showSuccessScreen]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    console.log('QR Code scanned:', decodedText);
    
    // Try to extract table number from QR code
    // Expected format: "table:1" or just "1" or URL containing table number
    let tableNum: number | null = null;
    
    // Try different formats
    const tableMatch = decodedText.match(/table[:\s]*(\d+)/i);
    if (tableMatch) {
      tableNum = parseInt(tableMatch[1]);
    } else {
      // Try to parse as plain number
      const plainNumber = parseInt(decodedText.trim());
      if (!isNaN(plainNumber) && plainNumber >= 1 && plainNumber <= 12) {
        tableNum = plainNumber;
      }
    }

    if (tableNum) {
      setScanSuccess(true);
      setScanResult(`Tisch ${tableNum} erkannt!`);
      handleTableFound(tableNum, decodedText);
    } else {
      setScanResult('Ungültiger QR-Code');
      setTimeout(() => setScanResult(null), 2000);
    }
  }, []);

  const handleScanFailure = useCallback((error: string) => {
    // This is called frequently when no QR code is in view
    // We don't need to show an error for this
    console.debug('QR Scan attempt:', error);
  }, []);

  const handleTableFound = async (number: number, scanData?: string) => {
    setIsScanning(false);
    setCurrentTable(number);
    
    try {
      // Record scan in database
      const response = await fetch('/api/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: number,
          scanData: scanData || `manual:${number}`
        })
      });
      
      if (response.ok) {
        console.log('✅ QR Scan recorded in database');
      }
    } catch (error) {
      console.error('Failed to record QR scan:', error);
    }
    
    // Erfolgsbildschirm anzeigen
    setShowSuccessScreen(true);
    setCountdown(3);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tableNumber);
    if (num >= 1 && num <= 12) {
      handleTableFound(num);
    }
  };

  const handleStartOrdering = () => {
    navigate('/');
  };

  const handleChangeTable = () => {
    setShowSuccessScreen(false);
    setScanSuccess(false);
    setScanResult(null);
    setTableFromUrl(null);
    setIsScanning(true);
  };

  const toggleFlash = async () => {
    try {
      if (html5QrCodeRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        const track = stream.getVideoTracks()[0];
        
        // Check if torch is supported (TypeScript-safe)
        const capabilities = track.getCapabilities() as any;
        if (capabilities?.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }]
          } as any);
          setFlashEnabled(!flashEnabled);
        }
      }
    } catch (error) {
      console.error('Flash toggle error:', error);
    }
  };

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    setIsScanning(showManualInput);
  };

  // Erfolgsbildschirm
  if (showSuccessScreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          {/* Grüne Erfolgsanimation */}
          <div className="mb-6">
            <CheckCircle 
              size={80} 
              className="text-seeblick mx-auto animate-bounce" 
            />
          </div>
          
          {/* Erfolgsmeldung */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {scanSuccess ? 'QR-Code gescannt!' : 'Tisch ausgewählt!'}
          </h2>
          
          {/* Tischnummer prominent anzeigen */}
          <div className="bg-seeblick/20 border-2 border-seeblick rounded-2xl p-6 mb-6">
            <p className="text-seeblick text-lg font-semibold mb-1">
              Sie bestellen jetzt für:
            </p>
            <p className="text-5xl font-bold text-white">
              Tisch {tableFromUrl || '?'}
            </p>
          </div>
          
          {/* Bestell-Button */}
          <button
            onClick={handleStartOrdering}
            className="w-full bg-seeblick text-white font-bold py-4 px-8 rounded-button shadow-button hover:bg-seeblick-dark transition-colors mb-4 flex items-center justify-center gap-3"
          >
            <Utensils size={24} />
            Jetzt bestellen
          </button>
          
          {/* Option zum Ändern */}
          <button
            onClick={handleChangeTable}
            className="text-white/60 hover:text-white underline transition-colors"
          >
            Anderer Tisch? Neu scannen
          </button>
          
          {/* Countdown */}
          <p className="text-white/40 mt-6 text-sm">
            Automatische Weiterleitung in {countdown} Sekunden...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/20 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-white font-semibold text-lg">QR-Code Scanner</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {!showManualInput ? (
          <>
            <div className="relative w-[280px] h-[280px]">
              {isScanning && !error ? (
                <div 
                  id="qr-reader" 
                  ref={scannerContainerRef}
                  className="w-full h-full rounded-2xl overflow-hidden"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl">
                  <div className="text-center">
                    <Camera size={48} className="text-white/60 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">{error || 'Kamera pausiert'}</p>
                  </div>
                </div>
              )}

              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-1 bg-seeblick" />
              <div className="absolute top-0 left-0 w-1 h-8 bg-seeblick" />
              <div className="absolute top-0 right-0 w-8 h-1 bg-seeblick" />
              <div className="absolute top-0 right-0 w-1 h-8 bg-seeblick" />
              <div className="absolute bottom-0 left-0 w-8 h-1 bg-seeblick" />
              <div className="absolute bottom-0 left-0 w-1 h-8 bg-seeblick" />
              <div className="absolute bottom-0 right-0 w-8 h-1 bg-seeblick" />
              <div className="absolute bottom-0 right-0 w-1 h-8 bg-seeblick" />
              
              {/* Scan line animation */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-0.5 bg-seeblick animate-scan-line shadow-[0_0_10px_rgba(139,211,84,0.8)]" />
              )}
            </div>

            <div className="text-center mt-8">
              {scanResult ? (
                <>
                  <p className="text-seeblick text-xl font-bold mb-2">{scanResult}</p>
                  <p className="text-white/60">Weiterleitung...</p>
                </>
              ) : (
                <>
                  <p className="text-white text-lg mb-2">QR-Code scannen</p>
                  <p className="text-white/60 text-sm">Halten Sie Ihr Gerät über den QR-Code auf dem Tisch</p>
                  
                  {/* Tischnummer aus URL anzeigen */}
                  {tableFromUrl && (
                    <div className="mt-4 bg-seeblick/20 border border-seeblick rounded-xl p-3">
                      <p className="text-seeblick font-semibold">
                        Tisch {tableFromUrl} aus URL erkannt
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="w-full max-w-sm">
            <p className="text-white text-lg text-center mb-6">Tischnummer eingeben</p>
            <input
              type="number"
              min="1"
              max="12"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="1-12"
              className="w-full p-4 bg-white/10 border-2 border-white/30 rounded-button text-white text-center text-2xl font-bold placeholder:text-white/30 focus:border-seeblick focus:outline-none mb-4"
              autoFocus
            />
            <button
              type="submit"
              disabled={!tableNumber}
              className="w-full bg-seeblick text-white font-semibold py-4 rounded-button shadow-button hover:bg-seeblick-dark disabled:opacity-50 transition-colors"
            >
              Bestätigen
            </button>
          </form>
        )}
      </div>

      <div className="p-6 flex justify-center gap-4">
        <button
          onClick={toggleFlash}
          className={`p-4 rounded-full ${flashEnabled ? 'bg-seeblick' : 'bg-white/20'} transition-colors`}
          title="Taschenlampe"
        >
          <Flashlight size={24} className="text-white" />
        </button>
        
        <button
          onClick={toggleManualInput}
          className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title="Manuelle Eingabe"
        >
          <Keyboard size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}
