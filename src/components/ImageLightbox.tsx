import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ isOpen, imageUrl, alt = 'Image', onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fade-in"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 rounded-full px-4 py-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <span className="text-white text-sm font-medium min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="ml-2 px-3 py-1 text-white text-sm hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
        >
          Sıfırla
        </button>
      </div>

      {/* Image Container */}
      <div 
        className="max-w-[90vw] max-h-[90vh] overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="transition-transform duration-300 ease-out cursor-zoom-in"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
          onClick={handleZoomIn}
        />
      </div>

      {/* Info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-4 py-2">
        <p className="text-white text-sm">{alt}</p>
      </div>
    </div>
  );
}
