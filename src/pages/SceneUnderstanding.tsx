
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, Download, Share, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { analyzeScene, SceneAnalysisResult, generateSceneDescription } from '@/utils/sceneAnalysis';

const SceneUnderstanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imagePath, imageSource } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [sceneResults, setSceneResults] = useState<SceneAnalysisResult[]>([]);
  const [sceneDescription, setSceneDescription] = useState<string>('');
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Redirect if no image provided
  useEffect(() => {
    if (!imagePath) {
      navigate('/camera');
      return;
    }
    
    setAnalyzedImageUrl(imagePath);
  }, [imagePath, navigate]);
  
  // Initialize speech recognition
  useEffect(() => {
    // Initialize speech recognition if available
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

    // Clean up on unmount
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  
  // Process the image when it's loaded
  const handleImageLoad = async () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    toast.info("Analyzing scene...");
    
    try {
      // Analyze scene in the image
      const results = await analyzeScene(imageRef.current);
      setSceneResults(results);
      
      // Generate scene description
      const description = generateSceneDescription(results);
      setSceneDescription(description);
      
      // Draw the original image on the canvas (we could add visual indicators here in the future)
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && imageRef.current) {
        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
        setAnalyzedImageUrl(canvas.toDataURL('image/png'));
      }
      
      setIsLoading(false);
      toast.success("Scene analysis complete");
    } catch (error) {
      console.error("Error analyzing scene:", error);
      toast.error("Failed to analyze the scene");
      setIsLoading(false);
    }
  };
  
  const speakDescription = () => {
    if (!sceneDescription) return;
    
    if ('speechSynthesis' in window) {
      // Stop any current speech
      stopSpeech();
      
      if (isSpeaking) {
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(sceneDescription);
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
      if (navigator.share && analyzedImageUrl) {
        await navigator.share({
          title: 'Scene Analysis Result',
          text: sceneDescription,
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
      // In a real app, this would use Capacitor's Filesystem API to save the image
      toast.success("Image saved to gallery", {
        description: "This is a placeholder for actual file saving"
      });
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image");
    }
  };

  return (
    <div className="app-container">
      <AppHeader title="Scene Understanding" showBackButton={true} backPath="/camera" />
      
      <main className="flex-1 p-4">
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Loader2 className="h-8 w-8 animate-spin text-app-blue mx-auto mb-4" />
              <p className="font-medium text-app-dark-blue">
                Analyzing scene...
              </p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
            <img
              ref={imageRef}
              src={imagePath}
              alt="Image for scene analysis"
              className="w-full h-auto object-contain"
              onLoad={handleImageLoad}
              style={{ display: 'block' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-app-blue flex items-center">
              <Brain className="mr-2" size={20} />
              Scene Analysis Results
            </h2>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                disabled={!sceneDescription || isLoading}
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
                disabled={!sceneDescription || isLoading}
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
          
          {sceneResults.length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Scene Description</CardTitle>
                  <CardDescription>{sceneDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium text-sm mb-2">Scene Categories</h3>
                  <ul className="space-y-2">
                    {sceneResults.map((result, index) => (
                      <li 
                        key={index}
                        className="flex justify-between items-center p-2 border-b last:border-0"
                      >
                        <span className="font-medium capitalize">{result.category.replace(/_/g, ' ')}</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-app-blue h-2.5 rounded-full" 
                              style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-app-blue font-semibold">
                            {Math.round(result.confidence * 100)}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
              {isLoading ? 
                "Analyzing scene..." : 
                "No scene information detected in this image"}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleSaveResult}
            className="btn-primary"
            disabled={isLoading}
          >
            <Download size={20} />
            <span>Save Result</span>
          </Button>
          
          <Button 
            onClick={handleShareResult}
            className="btn-secondary"
            disabled={isLoading}
          >
            <Share size={20} />
            <span>Share</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SceneUnderstanding;
