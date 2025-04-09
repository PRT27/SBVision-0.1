
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Loader2, User, Download, Share, AlertTriangle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { toast } from 'sonner';

interface FaceLandmark {
  mesh: Array<[number, number, number]>;
  boundingBox: {
    topLeft: [number, number];
    bottomRight: [number, number];
  };
}

const FaceDetection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imagePath, imageSource } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectedFaces, setDetectedFaces] = useState<FaceLandmark[]>([]);
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  
  // Initialize TensorFlow.js and load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        toast.info("Loading face detection model...");
        
        modelRef.current = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            refineLandmarks: true,
            maxFaces: 10,
          }
        );
        
        setIsModelLoading(false);
        toast.success("Face detection model loaded");
      } catch (error) {
        console.error("Error loading face detection model:", error);
        toast.error("Failed to load the face detection model");
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
      detectFaces();
    }
  }, [imagePath, isModelLoading]);
  
  const handleImageLoad = () => {
    if (!isModelLoading) {
      detectFaces();
    }
  };
  
  const detectFaces = async () => {
    if (!modelRef.current || !imageRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Get predictions from the model
      const predictions = await modelRef.current.estimateFaces(imageRef.current);
      
      // Convert predictions to our FaceLandmark type
      const faces: FaceLandmark[] = predictions.map((prediction: any) => ({
        mesh: prediction.keypoints.map((kp: any) => [kp.x, kp.y, kp.z || 0]),
        boundingBox: {
          topLeft: [prediction.box.xMin, prediction.box.yMin],
          bottomRight: [prediction.box.xMax, prediction.box.yMax],
        },
      }));
      
      setDetectedFaces(faces);
      
      // Draw faces on the canvas
      drawFaces(faces);
      setIsLoading(false);
      
      if (faces.length === 0) {
        toast.info("No faces detected in the image");
      } else {
        toast.success(`Detected ${faces.length} ${faces.length === 1 ? 'face' : 'faces'}`);
      }
    } catch (error) {
      console.error("Error during face detection:", error);
      toast.error("Failed to analyze faces in the image");
      setIsLoading(false);
    }
  };
  
  const drawFaces = (faces: FaceLandmark[]) => {
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
    
    // Draw each face
    faces.forEach((face, index) => {
      const { topLeft, bottomRight } = face.boundingBox;
      const width = bottomRight[0] - topLeft[0];
      const height = bottomRight[1] - topLeft[1];
      
      // Draw bounding box
      ctx.strokeStyle = '#0056b3';
      ctx.lineWidth = 3;
      ctx.strokeRect(topLeft[0], topLeft[1], width, height);
      
      // Draw label
      ctx.fillStyle = 'rgba(0, 86, 179, 0.7)';
      ctx.fillRect(topLeft[0], topLeft[1] - 30, width, 30);
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(`Face ${index + 1}`, topLeft[0] + 5, topLeft[1] - 10);
      
      // Draw facial landmarks (simplified)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      face.mesh.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
    
    // Update the analyzed image URL with the canvas data
    setAnalyzedImageUrl(canvas.toDataURL('image/png'));
  };
  
  const handleShareResult = async () => {
    try {
      if (navigator.share && analyzedImageUrl) {
        await navigator.share({
          title: 'Face Detection Result',
          text: 'Check out the faces I detected with Sight Beyond Vision app!',
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
      <AppHeader title="Face Detection" showBackButton={true} backPath="/camera" />
      
      <main className="flex-1 p-4">
        {(isModelLoading || isLoading) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Loader2 className="h-8 w-8 animate-spin text-app-blue mx-auto mb-4" />
              <p className="font-medium text-app-dark-blue">
                {isModelLoading ? "Loading face detection model..." : "Analyzing faces..."}
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
              alt="Image for face detection"
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
            <User className="mr-2" size={20} />
            Face Detection Results
          </h2>
          
          {detectedFaces.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="font-medium text-app-dark-blue mb-2">
                {`Detected ${detectedFaces.length} ${detectedFaces.length === 1 ? 'face' : 'faces'}`}
              </p>
              <ul className="space-y-2">
                {detectedFaces.map((_, index) => (
                  <li key={index} className="p-2 border-b last:border-0">
                    <span className="font-medium">Face {index + 1}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-500 mr-2 mt-0.5" size={16} />
                  <p className="text-xs text-gray-600">
                    For privacy and security reasons, detailed facial data is not displayed.
                    The image above shows detected faces with landmarks.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
              {isLoading || isModelLoading ? 
                "Analyzing faces..." : 
                "No faces detected in this image"}
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

export default FaceDetection;
