import React, { useState, useCallback } from 'react';
import { ImagePlus, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const UploadZone = ({ onFileSelected, isAnalyzing, error }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setSelectedFileName(files[0].name);
            onFileSelected(files[0]);
        }
    }, [onFileSelected]);

    const handleFileInput = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFileName(files[0].name);
            onFileSelected(files[0]);
        }
    }, [onFileSelected]);

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer transition-all duration-300 ease-in-out",
                    "border-2 border-dashed rounded-[22px] px-8 py-14",
                    "flex flex-col items-center justify-center text-center",
                    "bg-paper hover:bg-paper-2 border-border-md hover:border-green-2",
                    isDragOver && "border-green-2 bg-green-bg scale-[1.01] shadow-[0_12px_40px_rgba(10,122,85,0.08)]",
                    isAnalyzing && "pointer-events-none opacity-50 grayscale"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileInput}
                    disabled={isAnalyzing}
                />

                <div className="relative z-0 flex flex-col items-center gap-4">
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                        isDragOver ? "bg-green text-white scale-110" : "bg-white text-ink-3 border border-border-md shadow-sm group-hover:text-green-2 group-hover:border-green-2 group-hover:shadow-[0_4px_16px_rgba(10,122,85,0.15)]"
                    )}>
                        {isAnalyzing ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <ImagePlus className="w-8 h-8" strokeWidth={1.5} />
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5 max-w-sm">
                        <div className="font-serif text-[19px] font-medium text-ink">
                            {selectedFileName ? selectedFileName : "Drag & drop your product image here"}
                        </div>
                        <p className="text-[13px] text-ink-3 font-light leading-relaxed">
                            {selectedFileName 
                                ? "Click or drag a new file to replace"
                                : <span>or <span className="text-green-2 font-medium">browse from your computer</span></span>}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-2">
                         <span className="text-[10px] font-medium tracking-[0.04em] uppercase text-ink-4 bg-white border border-border px-2.5 py-1 rounded-[6px]">JPEG</span>
                         <span className="text-[10px] font-medium tracking-[0.04em] uppercase text-ink-4 bg-white border border-border px-2.5 py-1 rounded-[6px]">PNG</span>
                         <span className="text-[10px] font-medium tracking-[0.04em] uppercase text-ink-4 bg-white border border-border px-2.5 py-1 rounded-[6px]">WEBP</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-5 flex items-start gap-3 text-rose bg-rose-bg border border-rose/30 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] font-medium leading-relaxed">{error}</p>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
