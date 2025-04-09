
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Loader2, Tag, Download, Share } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { toast } from 'sonner';

interface DetectedObject {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

const ImageLabeling = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imagePath, imageSource } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  
  // Initialize TensorFlow.js and load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        toast.info("Loading object detection model...");
        modelRef.current = await cocoSsd.load();
        setIsModelLoading(false);
        toast.success("Model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
        toast.error("Failed to load the object detection model");
        setIsModelLoading(false);
      }
    };
    
    loadModel();
  }, []);
  
  // Process the image when it's loaded and the model is ready
  useEffect(() => {
    if (!imagePath) {
      navigate('/camera');
      return;
    }
    
    setAnalyzedImageUrl(imagePath);
    
    if (!isModelLoading && imageRef.current && imageRef.current.complete) {
      detectObjects();
    }
  }, [imagePath, isModelLoading]);
  
  const handleImageLoad = () => {
    if (!isModelLoading) {
      detectObjects();
    }
  };
  
  const detectObjects = async () => {
    if (!modelRef.current || !imageRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Get predictions from the model
      const predictions = await modelRef.current.detect(imageRef.current);
      setDetectedObjects(predictions);
      
      // Draw bounding boxes on the canvas
      drawBoundingBoxes(predictions);
      setIsLoading(false);
      
      if (predictions.length === 0) {
        toast.info("No objects detected in the image");
      } else {
        toast.success(`Detected ${predictions.length} objects`);
      }
    } catch (error) {
      console.error("Error during object detection:", error);
      toast.error("Failed to analyze the image");
      setIsLoading(false);
    }
  };
  
  const drawBoundingBoxes = (predictions: DetectedObject[]) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw bounding boxes
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      
      // Draw rectangle
      ctx.strokeStyle = '#0056b3';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      
      // Draw background for text
      ctx.fillStyle = 'rgba(0, 86, 179, 0.7)';
      ctx.fillRect(x, y - 30, width, 30);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${prediction.class} ${Math.round(prediction.score * 100)}%`,
        x + 5,
        y - 10
      );
    });
    
    // Update the analyzed image URL with the canvas data
    setAnalyzedImageUrl(canvas.toDataURL('image/png'));
  };
  
  const handleShareResult = async () => {
    try {
      if (navigator.share && analyzedImageUrl) {
        await navigator.share({
          title: 'Image Analysis Result',
          text: 'Check out what I detected with Sight Beyond Vision app!',
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
      <AppHeader title="Image Labeling" showBackButton={true} backPath="/camera" />
      
      <main className="flex-1 p-4">
        {(isModelLoading || isLoading) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Loader2 className="h-8 w-8 animate-spin text-app-blue mx-auto mb-4" />
              <p className="font-medium text-app-dark-blue">
                {isModelLoading ? "Loading AI model..." : "Analyzing image..."}
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
              alt="Uploaded for analysis"
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
          <h2 className="text-xl font-bold text-app-blue mb-2 flex items-center">
            <Tag className="mr-2" size={20} />
            Detection Results
          </h2>
          
          {detectedObjects.length > 0 ? (
            <ul className="bg-white rounded-xl shadow-sm p-4 space-y-2">
              {detectedObjects.map((object, index) => (
                <li 
                  key={index}
                  className="flex justify-between items-center p-2 border-b last:border-0"
                >
                  <span className="font-medium capitalize">{object.class}</span>
                  <span className="text-app-blue font-semibold">
                    {Math.round(object.score * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
              {isLoading || isModelLoading ? 
                "Analyzing image..." : 
                "No objects detected in this image"}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleSaveResult}
            className="btn-primary"
            disabled={isLoading || isModelLoading}
          >
            <Download size={20} />
            <span>Save Result</span>
          </Button>
          
          <Button 
            onClick={handleShareResult}
            className="btn-secondary"
            disabled={isLoading || isModelLoading}
          >
            <Share size={20} />
            <span>Share</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ImageLabeling;
