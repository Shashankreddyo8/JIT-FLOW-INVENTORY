import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Scan, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  buttonLabel?: string;
}

export const BarcodeScanner = ({ onScan, buttonLabel = "Scan Barcode" }: BarcodeScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
      setIsOpen(false);
      toast.success("Barcode scanned successfully!");
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    // Simulate scanning with a random barcode after 2 seconds
    setTimeout(() => {
      const mockBarcode = `BC${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      onScan(mockBarcode);
      setIsScanning(false);
      setIsOpen(false);
      toast.success("Barcode scanned successfully!");
    }, 2000);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Scan className="h-4 w-4" />
        {buttonLabel}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode/QR Code</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Camera Scanner UI */}
            <div className="relative aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="relative z-10 text-center">
                    <div className="animate-pulse mb-2">
                      <Camera className="h-12 w-12 mx-auto text-white" />
                    </div>
                    <p className="text-white text-sm">Scanning...</p>
                    <div className="mt-4 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Position barcode within the frame
                  </p>
                  <Button onClick={simulateScan} className="gap-2">
                    <Scan className="h-4 w-4" />
                    Start Scanning
                  </Button>
                </div>
              )}
              
              {/* Scanning frame overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-3/4 border-4 border-primary rounded-lg animate-pulse" />
                </div>
              )}
            </div>

            {/* Manual Input Option */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Or enter manually:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter barcode number"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <style>{`
        @keyframes scan {
          0%, 100% { width: 0%; }
          50% { width: 100%; }
        }
      `}</style>
    </>
  );
};
