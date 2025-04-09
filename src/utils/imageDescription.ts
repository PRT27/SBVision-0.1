
import * as tf from '@tensorflow/tfjs';
import { detectFaces } from './faceRecognition';
import { SceneAnalysisResult, analyzeScene } from './sceneAnalysis';

// Interface for detected objects
interface DetectedObject {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

/**
 * Generate a comprehensive description of the image content
 */
export const generateImageDescription = async (
  image: HTMLImageElement | HTMLCanvasElement,
  detectedObjects: DetectedObject[] = []
): Promise<string> => {
  try {
    // 1. Get scene analysis
    const sceneResults = await analyzeScene(image);
    
    // 2. Detect faces
    const faceResults = await detectFaces(image);
    
    // 3. Combine all detection results to create a comprehensive description
    return composeDescription(detectedObjects, sceneResults, faceResults);
  } catch (error) {
    console.error("Error generating image description:", error);
    return "Unable to generate image description due to an error.";
  }
};

/**
 * Compose a natural language description from detection results
 */
const composeDescription = (
  objects: DetectedObject[],
  sceneResults: SceneAnalysisResult[],
  faceResults: any[]
): string => {
  // Start with scene context if available
  let description = "";
  
  if (sceneResults.length > 0 && sceneResults[0].confidence > 0.5) {
    const topScene = sceneResults[0].category.replace(/_/g, ' ');
    description += `This image shows a ${topScene}. `;
  }
  
  // Add information about detected people
  if (faceResults.length > 0) {
    if (faceResults.length === 1) {
      description += "There is one person in the image. ";
    } else {
      description += `There are ${faceResults.length} people in the image. `;
    }
  }
  
  // Add information about objects if available
  if (objects.length > 0) {
    // Group objects by class
    const objectCounts: Record<string, number> = {};
    objects.forEach(obj => {
      const objClass = obj.class;
      objectCounts[objClass] = (objectCounts[objClass] || 0) + 1;
    });
    
    // Generate object descriptions
    const objectDescriptions = Object.entries(objectCounts).map(([objClass, count]) => {
      if (count === 1) {
        return `a ${objClass}`;
      } else {
        return `${count} ${objClass}s`;
      }
    });
    
    // Format the list of objects
    if (objectDescriptions.length === 1) {
      description += `The image contains ${objectDescriptions[0]}. `;
    } else if (objectDescriptions.length === 2) {
      description += `The image contains ${objectDescriptions[0]} and ${objectDescriptions[1]}. `;
    } else if (objectDescriptions.length > 2) {
      const lastItem = objectDescriptions.pop();
      description += `The image contains ${objectDescriptions.join(', ')}, and ${lastItem}. `;
    }
  }
  
  // If description is still empty, provide a generic response
  if (!description) {
    description = "This image doesn't contain any clearly identifiable objects or scenes.";
  }
  
  return description;
};

/**
 * Analyze facial expressions in detected faces
 */
export const analyzeFacialExpressions = async (
  image: HTMLImageElement | HTMLCanvasElement,
  faces: any[]
): Promise<FacialExpressionResult[]> => {
  // Simulated facial expression analysis for prototype
  const expressions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted'];
  
  return faces.map((face, index) => {
    // Generate a random expression for the prototype
    // In a real implementation, this would use a facial expression model
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
    const randomConfidence = 0.6 + Math.random() * 0.4; // Random confidence between 0.6 and 1.0
    
    return {
      faceIndex: index,
      expression: randomExpression,
      confidence: randomConfidence
    };
  });
};

// Types
export interface FacialExpressionResult {
  faceIndex: number;
  expression: string;
  confidence: number;
}
