import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-700 aspect-[9/16] max-h-[500px] w-full bg-black shadow-2xl">
        <img 
          src={selectedImage} 
          alt="Preview" 
          className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
        />
        <div className="absolute top-2 right-2">
          <button 
            onClick={onClear}
            className="p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent">
          <p className="text-white text-sm font-medium text-center">Ready to animate</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative overflow-hidden
        w-full aspect-[3/4] max-h-[400px]
        border-2 border-dashed rounded-3xl
        flex flex-col items-center justify-center
        cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-tiktok-cyan bg-tiktok-cyan/10 scale-[1.02]' 
          : 'border-slate-600 hover:border-slate-400 hover:bg-slate-800/50 bg-slate-800/20'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      
      <div className="z-10 flex flex-col items-center p-6 text-center">
        <div className={`
          w-20 h-20 mb-4 rounded-full flex items-center justify-center
          ${isDragging ? 'bg-tiktok-cyan/20 text-tiktok-cyan' : 'bg-slate-700 text-slate-300'}
        `}>
          {isDragging ? <Upload size={40} /> : <ImageIcon size={40} />}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">
          Upload Digital Human
        </h3>
        <p className="text-slate-400 text-sm mb-6 max-w-[200px]">
          Drag & drop a full-body photo of your influencer
        </p>
        
        <span className="px-4 py-2 rounded-full bg-slate-700 text-xs font-medium text-slate-300 border border-slate-600">
          Supports JPG, PNG
        </span>
      </div>

      {/* Background decoration */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};