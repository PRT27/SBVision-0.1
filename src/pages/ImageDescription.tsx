import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download, Share, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { generateImageDescription, analyzeFacialExpressions } from '@/utils/imageDescription';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { detectFaces } from '@/utils/faceRecognition';

const ImageDescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imagePath, imageSource } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [imageDescription, setImageDescription] = useState<string>('');
  const [detectedObjects, setDetectedObjects] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [facialExpressions, setFacialExpressions] = useState<any[]>([]);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if (!imagePath) {
      navigate('/camera');
      return;
    }
  }, [imagePath, navigate]);
  
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

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error("Speech recognition failed");
      };
    }

    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  
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
      const predictions = await modelRef.current.detect(imageRef.current);
      setDetectedObjects(predictions);
      
      const faces = await detectFaces(imageRef.current);
      
      if (faces.length > 0) {
        const expressions = await analyzeFacialExpressions(imageRef.current, faces);
        setFacialExpressions(expressions);
      }
      
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
      stopSpeech();
      
      if (isSpeaking) {
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
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      toast.info("Speaking description...");
    } else {
      toast.error("Text-to-speech is not supported on this device");
    }
  };
  
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported on this device");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening for voice commands...");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Failed to start listening");
        setIsListening(false);
      }
    }
  };

  const handleVoiceCommand = (command: string) => {
    toast.success(`Command received: ${command}`);
    
    if (command.includes('speak') || command.includes('read') || command.includes('tell me')) {
      speakDescription();
    } else if (command.includes('stop') || command.includes('quiet') || command.includes('silence')) {
      stopSpeech();
    } else if (command.includes('save') || command.includes('download')) {
      handleSaveResult();
    } else if (command.includes('share')) {
      handleShareResult();
    } else if (command.includes('back') || command.includes('return') || command.includes('go back')) {
      navigate('/camera');
    } else {
      toast.info("Command not recognized. Try saying 'speak', 'stop', 'save', or 'share'.");
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
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                disabled={!imageDescription || isLoading}
                className="h-8 w-8"
                title={isListening ? "Stop listening" : "Start voice commands"}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 text-red-500" />
                ) : (
                  <Mic className="h-5 w-5 text-app-blue" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={isSpeaking ? stopSpeech : speakDescription}
                disabled={!imageDescription || isLoading}
                className="h-8 w-8"
                title={isSpeaking ? "Stop speaking" : "Speak description"}
              >
                {isSpeaking ? (
                  <VolumeX className="h-5 w-5 text-red-500" />
                ) : (
                  <Volume2 className="h-5 w-5 text-app-blue" />
                )}
              </Button>
            </div>
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
                
                {facialExpressions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-sm mb-2 text-gray-600">Facial Expressions</h3>
                    <div className="flex flex-wrap gap-2">
                      {facialExpressions.map((expr, index) => (
                        <span 
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                        >
                          Face {expr.faceIndex + 1}: {expr.expression} ({Math.round(expr.confidence * 100)}%)
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
