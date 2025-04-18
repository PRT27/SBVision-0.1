
import React, { useState, useEffect } from 'react';
import { Camera as CameraIcon, Image, Zap, UserSearch, User, PieChart, MessageSquareText, Brain, FileText, Volume2, AlertTriangle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CameraPage = () => {
  const navigate = useNavigate();
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [analysisMode, setAnalysisMode] = useState<'labeling' | 'detection' | 'recognition' | 'scene' | 'description' | 'deepfake'>('labeling');
  
  useEffect(() => {
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
      
      const destination = 
        analysisMode === 'detection' ? '/face-detection' :
        analysisMode === 'recognition' ? '/face-recognition' :
        analysisMode === 'scene' ? '/scene-understanding' :
        analysisMode === 'description' ? '/image-description' :
        analysisMode === 'deepfake' ? '/face-recognition' : // Reuse face recognition for deepfake
        '/image-labeling';
      
      navigate(destination, { 
        state: { 
          imagePath: image.webPath,
          imageSource: 'camera',
          analysisMode: analysisMode // Pass the analysis mode to the target page
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
      
      const destination = 
        analysisMode === 'detection' ? '/face-detection' :
        analysisMode === 'recognition' ? '/face-recognition' :
        analysisMode === 'scene' ? '/scene-understanding' :
        analysisMode === 'description' ? '/image-description' :
        analysisMode === 'deepfake' ? '/face-recognition' : // Reuse face recognition for deepfake
        '/image-labeling';
      
      navigate(destination, { 
        state: { 
          imagePath: image.webPath,
          imageSource: 'gallery',
          analysisMode: analysisMode // Pass the analysis mode to the target page
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
            
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <h3 className="font-medium mb-3 text-app-dark-blue">Select Analysis Mode</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Button 
                  variant={analysisMode === 'labeling' ? 'default' : 'outline'}
                  className={`flex flex-col h-auto py-3 ${analysisMode === 'labeling' ? 'bg-app-blue' : ''}`}
                  onClick={() => setAnalysisMode('labeling')}
                >
                  <PieChart size={20} className="mb-1" />
                  <span className="text-xs">Labeling</span>
                </Button>
                <Button 
                  variant={analysisMode === 'detection' ? 'default' : 'outline'}
                  className={`flex flex-col h-auto py-3 ${analysisMode === 'detection' ? 'bg-app-blue' : ''}`}
                  onClick={() => setAnalysisMode('detection')}
                >
                  <User size={20} className="mb-1" />
                  <span className="text-xs">Face Detection</span>
                </Button>
                <Button 
                  variant={analysisMode === 'recognition' ? 'default' : 'outline'}
                  className={`flex flex-col h-auto py-3 ${analysisMode === 'recognition' ? 'bg-app-blue' : ''}`}
                  onClick={() => setAnalysisMode('recognition')}
                >
                  <UserSearch size={20} className="mb-1" />
                  <span className="text-xs">Face Recognition</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={analysisMode === 'scene' ? 'default' : 'outline'}
                  className={`flex flex-col h-auto py-3 ${analysisMode === 'scene' ? 'bg-app-blue' : ''}`}
                  onClick={() => setAnalysisMode('scene')}
                >
                  <Brain size={20} className="mb-1" />
                  <span className="text-xs">Scene Analysis</span>
                </Button>
                <Button 
                  variant={analysisMode === 'description' ? 'default' : 'outline'}
                  className={`flex flex-col h-auto py-3 ${analysisMode === 'description' ? 'bg-app-blue' : ''}`}
                  onClick={() => setAnalysisMode('description')}
                >
                  <FileText size={20} className="mb-1" />
                  <span className="text-xs">Description</span>
                </Button>
                <Button 
                  variant={analysisMode === 'deepfake' ? 'default' : 'outline'}
                  className={`flex flex-col h-auto py-3 ${analysisMode === 'deepfake' ? 'bg-app-blue' : ''}`}
                  onClick={() => setAnalysisMode('deepfake')}
                >
                  <AlertTriangle size={20} className="mb-1" />
                  <span className="text-xs">Deepfake Check</span>
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <Volume2 size={20} className="text-app-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-app-dark-blue">Voice Commands</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Use voice commands like "speak", "stop", "save", or "share" in analysis screens.
                  </p>
                </div>
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
