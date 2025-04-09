
import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Image, Zap } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CameraPage = () => {
  const navigate = useNavigate();
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  
  useEffect(() => {
    // Check for camera permissions
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const permission = await Camera.checkPermissions();
      setHasPermissions(permission.camera === 'granted');
      
      if (permission.camera !== 'granted') {
        toast.error("Camera permission is required", {
          description: "Please enable camera access in your device settings.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error checking permissions", error);
      toast.error("Failed to check camera permissions");
    }
  };

  const requestPermissions = async () => {
    try {
      const permission = await Camera.requestPermissions();
      setHasPermissions(permission.camera === 'granted');
      
      if (permission.camera === 'granted') {
        toast.success("Camera permission granted");
      } else {
        toast.error("Camera permission denied");
      }
    } catch (error) {
      console.error("Error requesting permissions", error);
      toast.error("Failed to request camera permissions");
    }
  };

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        promptLabelHeader: 'Take a picture',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'From Gallery',
        promptLabelPicture: 'Take Picture',
        width: 1024,
        height: 1024,
        correctOrientation: true,
      });
      
      // Navigate to the image processing page with the captured image
      navigate('/image-labeling', { 
        state: { 
          imagePath: image.webPath,
          imageSource: 'camera' 
        } 
      });
      
    } catch (error) {
      console.error("Error taking picture", error);
      toast.error("Failed to capture image");
    }
  };

  const selectFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: 1024,
        height: 1024,
        correctOrientation: true,
      });
      
      // Navigate to the image processing page with the selected image
      navigate('/image-labeling', { 
        state: { 
          imagePath: image.webPath,
          imageSource: 'gallery' 
        } 
      });
      
    } catch (error) {
      console.error("Error selecting from gallery", error);
      toast.error("Failed to select image");
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
    toast.info(`Flash ${flashMode === 'off' ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="app-container">
      <AppHeader title="Camera" showBackButton={true} backPath="/" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!hasPermissions ? (
          <div className="text-center">
            <div className="bg-gray-100 p-8 rounded-xl mb-6">
              <CameraIcon size={64} className="mx-auto text-app-blue mb-4" />
              <h2 className="text-xl font-bold text-app-dark-blue mb-2">Camera Permission Required</h2>
              <p className="text-gray-600 mb-6">
                We need camera permission to enable image capturing and analysis features.
              </p>
              <Button onClick={requestPermissions} className="btn-primary w-full">
                Grant Permission
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="aspect-square w-full bg-gray-100 rounded-xl mb-6 flex items-center justify-center">
              <div className="text-gray-400">
                <CameraIcon size={64} className="mx-auto mb-4" />
                <p>Tap the button below to take a picture</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={takePicture} className="btn-primary">
                <CameraIcon size={20} />
                <span>Take Picture</span>
              </Button>
              
              <Button onClick={selectFromGallery} className="btn-secondary">
                <Image size={20} />
                <span>Select from Gallery</span>
              </Button>
              
              <Button 
                onClick={toggleFlash} 
                variant="outline" 
                className={`mt-2 ${flashMode === 'on' ? 'bg-yellow-50' : ''}`}
              >
                <Zap size={20} className={flashMode === 'on' ? 'text-yellow-500' : ''} />
                <span>Flash: {flashMode === 'on' ? 'On' : 'Off'}</span>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CameraPage;
