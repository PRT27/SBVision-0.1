
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// Face detection model references
let faceDetectionModel: faceLandmarksDetection.FaceLandmarksDetector | null = null;

/**
 * Initialize the face detection model
 */
export const initFaceDetection = async (): Promise<boolean> => {
  try {
    await tf.ready();
    faceDetectionModel = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 10,
      }
    );
    return true;
  } catch (error) {
    console.error('Error initializing face detection model:', error);
    return false;
  }
};

/**
 * Get face detection model (initialize if needed)
 */
export const getFaceDetectionModel = async (): Promise<faceLandmarksDetection.FaceLandmarksDetector | null> => {
  if (!faceDetectionModel) {
    await initFaceDetection();
  }
  return faceDetectionModel;
};

/**
 * Detect faces in an image
 */
export const detectFaces = async (
  image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<FaceDetectionResult[]> => {
  try {
    const model = await getFaceDetectionModel();
    if (!model) throw new Error('Face detection model not initialized');
    
    const predictions = await model.estimateFaces(image);
    
    return predictions.map((prediction: any) => ({
      landmarks: prediction.keypoints,
      boundingBox: {
        topLeft: [prediction.box.xMin, prediction.box.yMin],
        bottomRight: [prediction.box.xMax, prediction.box.yMax],
        width: prediction.box.width,
        height: prediction.box.height,
      },
      faceScore: prediction.score || 0,
    }));
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
};

/**
 * Calculate facial descriptor (identity features)
 */
export const getFacialDescriptor = (landmarks: any[]): number[] => {
  // Simple implementation that uses key facial points as a descriptor
  // In a real implementation, this would use a neural network to create embeddings
  const keyPoints = [
    // Eyes
    landmarks[33], landmarks[133], // Left & right eye centers
    landmarks[159], landmarks[386], // Left & right eye corners
    
    // Nose
    landmarks[2], landmarks[98], landmarks[327],
    
    // Mouth
    landmarks[57], landmarks[287], // Mouth corners
    landmarks[14], landmarks[13], // Top & bottom lip
    
    // Jawline points
    landmarks[172], landmarks[397],
    
    // Eyebrows
    landmarks[70], landmarks[300]
  ];
  
  // Normalize the points
  const descriptor = keyPoints.flatMap(point => 
    point ? [point.x / 500, point.y / 500, point.z || 0] : [0, 0, 0]
  );
  
  return descriptor;
};

/**
 * Compare two facial descriptors
 * @returns Similarity score (0-1 where 1 is identical)
 */
export const compareFaces = (descriptor1: number[], descriptor2: number[]): number => {
  if (descriptor1.length !== descriptor2.length) return 0;
  
  // Calculate Euclidean distance between descriptors
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  const distance = Math.sqrt(sum);
  
  // Convert distance to similarity score (0-1)
  // Lower distance = higher similarity
  const maxDistance = Math.sqrt(descriptor1.length * 4); // Theoretical max distance
  const similarity = 1 - (distance / maxDistance);
  
  return similarity;
};

/**
 * Draw face detection results on a canvas
 */
export const drawFaceDetection = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | HTMLCanvasElement,
  faces: FaceDetectionResult[],
  options: {
    drawBoundingBox?: boolean;
    drawLandmarks?: boolean;
    drawLabels?: boolean;
    boxColor?: string;
    landmarkColor?: string;
    labelColor?: string;
  } = {}
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Set canvas dimensions to match the image
  canvas.width = image.width;
  canvas.height = image.height;
  
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw the image
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  const {
    drawBoundingBox = true,
    drawLandmarks = true,
    drawLabels = true,
    boxColor = '#0056b3',
    landmarkColor = 'rgba(255, 255, 255, 0.7)',
    labelColor = 'white'
  } = options;
  
  // Draw each face
  faces.forEach((face, index) => {
    const { boundingBox, landmarks } = face;
    
    if (drawBoundingBox && boundingBox) {
      // Draw bounding box
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        boundingBox.topLeft[0],
        boundingBox.topLeft[1],
        boundingBox.width,
        boundingBox.height
      );
      
      if (drawLabels) {
        // Draw label background
        ctx.fillStyle = 'rgba(0, 86, 179, 0.7)';
        ctx.fillRect(boundingBox.topLeft[0], boundingBox.topLeft[1] - 30, boundingBox.width, 30);
        
        // Draw label text
        ctx.fillStyle = labelColor;
        ctx.font = '16px Arial';
        ctx.fillText(`Face ${index + 1}`, boundingBox.topLeft[0] + 5, boundingBox.topLeft[1] - 10);
      }
    }
    
    if (drawLandmarks && landmarks) {
      // Draw facial landmarks
      ctx.fillStyle = landmarkColor;
      landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  });
};

// Types
export interface FaceDetectionResult {
  landmarks: any[];
  boundingBox: {
    topLeft: [number, number];
    bottomRight: [number, number];
    width: number;
    height: number;
  };
  faceScore: number;
}

export interface FaceMatchResult {
  matchedFaceIndex: number;
  similarity: number;
  isMatch: boolean;
}

/**
 * Find a matching face in a gallery of known faces
 */
export const findMatchingFace = (
  faceDescriptor: number[],
  knownFaceDescriptors: number[][],
  threshold: number = 0.6
): FaceMatchResult => {
  let bestMatchIndex = -1;
  let bestMatchScore = 0;
  
  knownFaceDescriptors.forEach((descriptor, index) => {
    const similarity = compareFaces(faceDescriptor, descriptor);
    if (similarity > bestMatchScore) {
      bestMatchScore = similarity;
      bestMatchIndex = index;
    }
  });
  
  return {
    matchedFaceIndex: bestMatchIndex,
    similarity: bestMatchScore,
    isMatch: bestMatchScore >= threshold
  };
};
