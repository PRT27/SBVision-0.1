
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download, Share, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { generateImageDescription } from '@/utils/imageDescription';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const ImageDescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imagePath, imageSource } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [imageDescription, setImageDescription] = useState<string>('');
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  
  // Redirect if no image provided
  useEffect(() => {
    if (!imagePath) {
      navigate('/camera');
      return;
    }
  }, [imagePath, navigate]);
  
  // Initialize models
  useEffect(() => {
    const loadModel = async () => {
      try {
        toast.info("Loading analysis models...");
        modelRef.current = await cocoSsd.load();
        setIsModelLoading(false);
        toast.success("Models loaded successfully");
      } catch (error) {
        console.error("Error loading models:", error);
        toast.error("Failed to load analysis models");
        setIsModelLoading(false);
      }
    };
    
    loadModel();
  }, []);
  
  // Process the image when it's loaded and the model is ready
  useEffect(() => {
    if (!isModelLoading && imageRef.current && imageRef.current.complete) {
      analyzeImage();
    }
  }, [isModelLoading]);
  
  const handleImageLoad = () => {
    if (!isModelLoading) {
      analyzeImage();
    }
  };
  
  const analyzeImage = async () => {
    if (!modelRef.current || !imageRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Detect objects in the image
      const predictions = await modelRef.current.detect(imageRef.current);
      setDetectedObjects(predictions);
      
      // Generate comprehensive description
      const description = await generateImageDescription(imageRef.current, predictions);
      setImageDescription(description);
      
      setIsLoading(false);
      toast.success("Image analysis complete");
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze the image");
      setIsLoading(false);
    }
  };
  
  const speakDescription = () => {
    if (!imageDescription) return;
    
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(imageDescription);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error("Speech synthesis failed");
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported on this device");
    }
  };
  
  const handleShareResult = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Image Description',
          text: imageDescription,
          url: location.pathname,
        });
        toast.success("Shared successfully");
      } else {
        toast.error("Sharing is not supported on this device");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share results");
    }
  };
  
  const handleSaveResult = async () => {
    try {
      // In a real app, this would use Capacitor's Filesystem API to save the text
      toast.success("Description saved", {
        description: "This is a placeholder for actual file saving"
      });
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save description");
    }
  };

  return (
    <div className="app-container">
      <AppHeader title="Image Description" showBackButton={true} backPath="/camera" />
      
      <main className="flex-1 p-4">
        {(isModelLoading || isLoading) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Loader2 className="h-8 w-8 animate-spin text-app-blue mx-auto mb-4" />
              <p className="font-medium text-app-dark-blue">
                {isModelLoading ? "Loading AI models..." : "Analyzing image..."}
              </p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="rounded-xl overflow-hidden bg-gray-100 shadow-sm">
            <img
              ref={imageRef}
              src={imagePath}
              alt="Image for analysis"
              className="w-full h-auto object-contain"
              onLoad={handleImageLoad}
              style={{ display: 'block' }}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-app-blue flex items-center">
              <FileText className="mr-2" size={20} />
              Image Description
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={speakDescription}
              disabled={!imageDescription || isLoading}
              className="h-8 w-8"
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5 text-red-500" />
              ) : (
                <Volume2 className="h-5 w-5 text-app-blue" />
              )}
            </Button>
          </div>
          
          {imageDescription ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  {imageDescription}
                </p>
                
                {detectedObjects.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-sm mb-2 text-gray-600">Detected Objects</h3>
                    <div className="flex flex-wrap gap-2">
                      {detectedObjects.map((obj, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {obj.class} ({Math.round(obj.score * 100)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
              {isLoading || isModelLoading ? 
                "Analyzing image..." : 
                "No description could be generated for this image"}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleSaveResult}
            className="btn-primary"
            disabled={isLoading || !imageDescription}
          >
            <Download size={20} />
            <span>Save Result</span>
          </Button>
          
          <Button 
            onClick={handleShareResult}
            className="btn-secondary"
            disabled={isLoading || !imageDescription}
          >
            <Share size={20} />
            <span>Share</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ImageDescription;
