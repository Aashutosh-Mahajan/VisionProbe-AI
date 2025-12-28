import React, { useState, useCallback } from 'react';
import { Upload, Loader2, AlertCircle, ImagePlus } from 'lucide-react';
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
                    "relative group cursor-pointer transition-all duration-500 ease-out",
                    "border-2 border-dashed rounded-2xl p-16",
                    "flex flex-col items-center justify-center text-center",
                    "bg-black/20 backdrop-blur-md shadow-2xl",
                    isDragOver 
                        ? "border-white/40 bg-black/30 scale-[1.01]" 
                        : "border-white/10 hover:border-white/25 hover:bg-black/30",
                    isAnalyzing && "pointer-events-none opacity-50"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileInput}
                    disabled={isAnalyzing}
                />

                <div className="relative z-0 flex flex-col items-center space-y-6">
                    <div className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl backdrop-blur-xl border",
                        isDragOver 
                            ? "bg-white/20 border-white/30 text-white rotate-3 scale-110" 
                            : "bg-white/5 border-white/10 text-white/70 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-110"
                    )}>
                        {isAnalyzing ? (
                            <Loader2 className="w-10 h-10 animate-spin" />
                        ) : (
                            <ImagePlus className="w-10 h-10" strokeWidth={1.5} />
                        )}
                    </div>

                    <div className="space-y-3 max-w-md">
                        <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                            {selectedFileName ? "Image Selected" : "Upload Product Image"}
                        </h3>
                        <p className="text-white/60 text-base font-light leading-relaxed">
                            {selectedFileName 
                                ? selectedFileName
                                : "Drag and drop your image here, or click to browse. Supports high-res JPEG & PNG."}
                        </p>
                    </div>
                    
                    {!isAnalyzing && (
                        <div className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 group-hover:bg-white/15 group-hover:text-white group-hover:border-white/20 transition-all shadow-lg backdrop-blur-sm">
                            {selectedFileName ? "Change File" : "Select File"}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-6 flex items-center gap-3 text-rose-200 bg-rose-500/20 border border-rose-500/30 p-4 rounded-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 shadow-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
