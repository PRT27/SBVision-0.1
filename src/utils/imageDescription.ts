
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
    
    // 3. Analyze facial expressions if faces detected
    let expressionResults: FacialExpressionResult[] = [];
    if (faceResults.length > 0) {
      expressionResults = await analyzeFacialExpressions(image, faceResults);
    }
    
    // 4. Check for deepfakes if faces detected
    let deepfakeResults: DeepfakeAnalysisResult | null = null;
    if (faceResults.length > 0) {
      deepfakeResults = await analyzeDeepfake(image, faceResults);
    }
    
    // 5. Combine all detection results to create a comprehensive description
    return composeDescription(detectedObjects, sceneResults, faceResults, expressionResults, deepfakeResults);
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
  faceResults: any[],
  expressionResults: FacialExpressionResult[] = [],
  deepfakeResults: DeepfakeAnalysisResult | null = null
): string => {
  // Start with scene context if available
  let description = "";
  
  if (sceneResults.length > 0 && sceneResults[0].confidence > 0.5) {
    const topScene = sceneResults[0].category.replace(/_/g, ' ');
    description += `This image shows a ${topScene}. `;
  }
  
  // Add information about detected people and their expressions
  if (faceResults.length > 0) {
    if (faceResults.length === 1) {
      description += "There is one person in the image";
      
      // Add expression if available
      if (expressionResults.length > 0) {
        const expression = expressionResults[0].expression;
        description += ` who appears to be ${expression}`;
      }
      
      description += ". ";
    } else {
      description += `There are ${faceResults.length} people in the image. `;
      
      // Add expressions if available for multiple people
      if (expressionResults.length > 0) {
        const expressionCounts: Record<string, number> = {};
        expressionResults.forEach(result => {
          const expr = result.expression;
          expressionCounts[expr] = (expressionCounts[expr] || 0) + 1;
        });
        
        const expressionDescriptions = Object.entries(expressionCounts)
          .map(([expr, count]) => {
            if (count === 1) {
              return `one person appears ${expr}`;
            } else {
              return `${count} people appear ${expr}`;
            }
          });
        
        if (expressionDescriptions.length === 1) {
          description += `${expressionDescriptions[0]}. `;
        } else if (expressionDescriptions.length === 2) {
          description += `${expressionDescriptions[0]} and ${expressionDescriptions[1]}. `;
        } else if (expressionDescriptions.length > 2) {
          const lastItem = expressionDescriptions.pop();
          description += `${expressionDescriptions.join(', ')}, and ${lastItem}. `;
        }
      }
    }
    
    // Add deepfake analysis if available
    if (deepfakeResults) {
      if (deepfakeResults.isDeepfake) {
        description += `Caution: This image appears to be artificially generated or manipulated (confidence: ${Math.round(deepfakeResults.confidence * 100)}%). `;
        
        if (deepfakeResults.manipulationDetails.length > 0) {
          description += `Detected manipulations include ${deepfakeResults.manipulationDetails.join(', ')}. `;
        }
      } else if (deepfakeResults.confidence > 0.8) {
        description += `This appears to be an authentic image with no signs of manipulation. `;
      }
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

/**
 * Analyze an image for signs of deepfake or manipulation
 */
export const analyzeDeepfake = async (
  image: HTMLImageElement | HTMLCanvasElement,
  faces: any[]
): Promise<DeepfakeAnalysisResult> => {
  // In a real implementation, this would use a deepfake detection model
  // For this prototype, we'll return simulated results
  
  // Simulated deepfake analysis
  const isDeepfake = Math.random() > 0.7; // 30% chance of being classified as deepfake for demo
  const confidence = 0.6 + Math.random() * 0.4; // Random confidence between 0.6 and 1.0
  
  let manipulationDetails: string[] = [];
  if (isDeepfake) {
    const possibleManipulations = [
      'facial feature substitution',
      'inconsistent lighting',
      'unnatural skin texture',
      'irregular eye reflections',
      'abnormal facial proportions',
      'edge artifacts',
      'background inconsistencies'
    ];
    
    // Select 1-3 random manipulation types
    const manipulationCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < manipulationCount; i++) {
      const index = Math.floor(Math.random() * possibleManipulations.length);
      manipulationDetails.push(possibleManipulations[index]);
      possibleManipulations.splice(index, 1); // Remove to avoid duplicates
    }
  }
  
  return {
    isDeepfake,
    confidence,
    manipulationDetails
  };
};

// Types
export interface FacialExpressionResult {
  faceIndex: number;
  expression: string;
  confidence: number;
}

export interface DeepfakeAnalysisResult {
  isDeepfake: boolean;
  confidence: number;
  manipulationDetails: string[];
}
