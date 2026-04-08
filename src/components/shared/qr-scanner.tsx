"use client";

import { Scanner } from '@yudiel/react-qr-scanner';
import { Box } from 'lucide-react';
import { useState } from 'react';

type Props = {
    onScan: (text: string) => void;
    onError?: (error: Error) => void;
};

export const QrScanner = ({ onScan, onError }: Props) => {
    const [paused, setPaused] = useState(false);

    const handleScan = (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const rawValue = detectedCodes[0].rawValue;
            if (rawValue) {
                setPaused(true);
                onScan(rawValue);
            }
        }
    };

    return (
        <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-[2rem] bg-black border-4 border-stone-200">
            <Scanner
                onScan={handleScan}
                onError={(err) => {
                    console.error("QR Code Scan Error:", err);
                    if (onError && err instanceof Error) {
                        onError(err);
                    }
                }}
                paused={paused}
                components={{
                    zoom: false,
                    finder: true,
                }}
                styles={{
                    container: { width: '100%', height: '100%' },
                }}
            />
            
            {/* Visual Target Overlay overlaying the scanner viewfinder */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-8">
                <Box className="w-16 h-16 text-white/50 mb-4" />
                <p className="text-white font-bold text-center drop-shadow-md text-sm">
                    Aponta a câmara para um myDuolingo QR Code.
                </p>
            </div>
        </div>
    );
};
