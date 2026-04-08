"use client";

import { QrScanner } from "./qr-scanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onScan: (id: string) => void;
};

export const QrScannerModal = ({ isOpen, onClose, onScan }: Props) => {
    
    // Parse the scanned raw data.
    // It could be a simple 8-9 character ID, or a full profile link.
    const handleScanResult = (rawData: string) => {
        let extractedId = rawData;
        
        // If it's a profile URL (e.g., http://localhost:3000/profile/1234ABCD)
        if (rawData.includes("/profile/")) {
            const parts = rawData.split("/profile/");
            if (parts.length > 1) {
                extractedId = parts[1].split("?")[0].trim();
            }
        }
        
        onScan(extractedId);
        onClose(); // Auto close the modal on successful scan
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md w-11/12 p-6 rounded-[2.5rem] bg-white border-2 border-stone-200 border-b-8 shadow-sm">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-stone-800 text-center">
                        Encontrar Amigo 📸
                    </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-col items-center">
                    <QrScanner onScan={handleScanResult} />
                    
                    <button 
                        onClick={onClose}
                        className="mt-8 bg-stone-100 text-stone-600 font-black px-8 py-3 rounded-xl border-2 border-stone-200 border-b-4 active:translate-y-1 active:border-b-2 hover:bg-stone-200 uppercase w-full max-w-sm transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
