
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for the gallery (in a real app, this would come from storage)
const mockImages = [
  { id: '1', path: 'https://picsum.photos/id/237/400/300', date: '2025-04-05', type: 'image_labeling' },
  { id: '2', path: 'https://picsum.photos/id/238/400/300', date: '2025-04-06', type: 'face_detection' },
  { id: '3', path: 'https://picsum.photos/id/239/400/300', date: '2025-04-07', type: 'image_labeling' },
  { id: '4', path: 'https://picsum.photos/id/240/400/300', date: '2025-04-08', type: 'face_detection' },
];

const Gallery = () => {
  const [images, setImages] = useState(mockImages);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const handleViewImage = (imagePath: string) => {
    setSelectedImage(imagePath);
  };
  
  const handleClosePreview = () => {
    setSelectedImage(null);
  };
  
  const handleDeleteImage = (id: string) => {
    // In a real app, this would delete from storage
    setImages(images.filter(img => img.id !== id));
    toast.success("Image deleted");
  };
  
  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="app-container">
      <AppHeader title="Image Gallery" showBackButton={true} backPath="/" />
      
      <main className="flex-1 p-4">
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={handleClosePreview}>
            <div className="relative max-w-full max-h-full">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <button 
                className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full"
                onClick={handleClosePreview}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <h2 className="text-xl font-bold text-app-blue flex items-center">
            <ImageIcon className="mr-2" size={20} />
            Your Images
          </h2>
          <p className="text-sm text-gray-600">View and manage your analyzed images</p>
        </div>
        
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {images.map(image => (
              <div key={image.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div 
                  className="aspect-square relative bg-gray-100 cursor-pointer"
                  onClick={() => handleViewImage(image.path)}
                >
                  <img 
                    src={image.path} 
                    alt={`Saved ${image.type}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-xs text-white font-medium">
                      {formattedDate(image.date)}
                    </span>
                  </div>
                </div>
                <div className="p-2 flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    {image.type === 'image_labeling' ? 'Object Detection' : 'Face Detection'}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleViewImage(image.path)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No images yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Images you capture and analyze will appear here
            </p>
            <Button 
              className="btn-primary mx-auto"
              onClick={() => window.location.href = '/camera'}
            >
              Capture an Image
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
