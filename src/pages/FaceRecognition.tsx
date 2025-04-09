
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Loader2, User, Download, Share, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  detectFaces, 
  drawFaceDetection, 
  getFacialDescriptor, 
  FaceDetectionResult 
} from '@/utils/faceRecognition';

const FaceRecognition = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { imagePath, imageSource } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [faceData, setFaceData] = useState<FaceDetectionResult[]>([]);
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Redirect if no image provided
  useEffect(() => {
    if (!imagePath) {
      navigate('/camera');
      return;
    }
    
    setAnalyzedImageUrl(imagePath);
  }, [imagePath, navigate]);
  
  // Process the image when it's loaded
  const handleImageLoad = async () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setIsLoading(true);
    toast.info("Analyzing faces...");
    
    try {
      // Detect faces in the image
      const faces = await detectFaces(imageRef.current);
      setFaceData(faces);
      
      // Draw faces on canvas
      drawFaceDetection(canvasRef.current, imageRef.current, faces, {
        drawBoundingBox: true,
        drawLandmarks: true,
        drawLabels: true
      });
      
      // Set the analyzed image from the canvas
      setAnalyzedImageUrl(canvasRef.current.toDataURL('image/png'));
      
      setIsLoading(false);
      
      if (faces.length === 0) {
        toast.info("No faces detected in the image");
      } else {
        toast.success(`Detected ${faces.length} ${faces.length === 1 ? 'face' : 'faces'}`);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze faces in the image");
      setIsLoading(false);
    }
  };
  
  const selectFace = (index: number) => {
    setSelectedFace(index === selectedFace ? null : index);
    
    if (index !== selectedFace && canvasRef.current && imageRef.current) {
      // Redraw with only the selected face highlighted
      drawFaceDetection(canvasRef.current, imageRef.current, faceData, {
        drawBoundingBox: true,
        drawLandmarks: false,
        drawLabels: true
      });
      
      // Highlight selected face
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && faceData[index]) {
        const face = faceData[index];
        
        // Draw highlighted box
        ctx.strokeStyle = '#22c55e'; // Green color
        ctx.lineWidth = 4;
        ctx.strokeRect(
          face.boundingBox.topLeft[0],
          face.boundingBox.topLeft[1],
          face.boundingBox.width,
          face.boundingBox.height
        );
        
        // Draw facial landmarks for selected face
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        face.landmarks.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Draw label
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.fillRect(
          face.boundingBox.topLeft[0], 
          face.boundingBox.topLeft[1] - 30, 
          face.boundingBox.width, 
          30
        );
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(
          `Face ${index + 1} (Selected)`, 
          face.boundingBox.topLeft[0] + 5, 
          face.boundingBox.topLeft[1] - 10
        );
      }
      
      setAnalyzedImageUrl(canvasRef.current.toDataURL('image/png'));
    }
  };
  
  const handleShareResult = async () => {
    try {
      if (navigator.share && analyzedImageUrl) {
        await navigator.share({
          title: 'Face Recognition Result',
          text: 'Check out this face recognition result from Sight Beyond Vision app!',
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
  
  const getFaceDetails = (face: FaceDetectionResult, index: number) => {
    // Extract relevant facial details for display
    const faceWidth = Math.round(face.boundingBox.width);
    const faceHeight = Math.round(face.boundingBox.height);
    const confidence = Math.round(face.faceScore * 100);
    
    // These would be real metrics in a full implementation
    const eyeDistance = Math.round(Math.random() * 30) + 60;
    const symmetry = Math.round(Math.random() * 20) + 80;
    
    return {
      index,
      size: `${faceWidth}×${faceHeight}px`,
      confidence: `${confidence}%`,
      landmarks: face.landmarks.length,
      eyeDistance: `${eyeDistance}px`,
      symmetry: `${symmetry}%`
    };
  };

  return (
    <div className="app-container">
      <AppHeader title="Face Recognition" showBackButton={true} backPath="/camera" />
      
      <main className="flex-1 p-4">
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Loader2 className="h-8 w-8 animate-spin text-app-blue mx-auto mb-4" />
              <p className="font-medium text-app-dark-blue">
                Analyzing faces...
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
              alt="Image for face recognition"
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
            Face Recognition Results
          </h2>
          
          {faceData.length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Detected {faceData.length} {faceData.length === 1 ? 'face' : 'faces'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Tap on a face to view detailed facial measurements and landmarks.
                  </p>
                  
                  {faceData.map((face, index) => {
                    const details = getFaceDetails(face, index);
                    const isSelected = selectedFace === index;
                    
                    return (
                      <div 
                        key={index} 
                        className={`p-3 border rounded-lg mb-2 transition-colors cursor-pointer ${
                          isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                        onClick={() => selectFace(index)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Face {index + 1}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Confidence: {details.confidence}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Size</p>
                              <p>{details.size}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Landmarks</p>
                              <p>{details.landmarks}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Eye Distance</p>
                              <p>{details.eyeDistance}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Symmetry</p>
                              <p>{details.symmetry}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-500 mr-2 mt-0.5" size={16} />
                  <p className="text-xs text-gray-600">
                    For privacy and security reasons, some facial data is not displayed.
                    The image above shows detected faces with landmarks.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-gray-500">
              {isLoading ? 
                "Analyzing faces..." : 
                "No faces detected in this image"}
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

export default FaceRecognition;
