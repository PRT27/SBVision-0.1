
import React from 'react';
import AppHeader from '@/components/AppHeader';
import { 
  Info, 
  Shield, 
  Lightbulb, 
  Camera, 
  Users,
  Github,
  Mail,
  HeartHandshake
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="app-container">
      <AppHeader title="About" showBackButton={true} backPath="/" />
      
      <main className="flex-1 p-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-app-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-app-dark-blue">Sight Beyond Vision</h1>
          <p className="text-sm text-gray-600">Version 1.0.0</p>
        </div>
        
        <div className="card-container mb-6">
          <h2 className="section-title flex items-center">
            <Info className="mr-2" size={18} />
            Application Overview
          </h2>
          <p className="text-sm text-gray-600">
            Sight Beyond Vision is an advanced image analysis application that uses 
            machine learning technology to detect objects and faces in images. It assists
            visually impaired individuals and supports various sectors including
            security, banking, and identity verification.
          </p>
        </div>
        
        <div className="card-container mb-6">
          <h2 className="section-title flex items-center">
            <Lightbulb className="mr-2" size={18} />
            Key Features
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 mt-2">
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>Image labeling with object detection and classification</span>
            </li>
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>Facial detection with landmark recognition</span>
            </li>
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>Secure local storage with encryption</span>
            </li>
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>Accessibility features for visually impaired users</span>
            </li>
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>Optimized for MOBICEL P11 and other Android devices</span>
            </li>
          </ul>
        </div>
        
        <div className="card-container mb-6">
          <h2 className="section-title flex items-center">
            <Shield className="mr-2" size={18} />
            Privacy & Security
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            We take your privacy seriously. All image processing occurs locally on your
            device. No data is sent to external servers unless you explicitly share it.
          </p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy-policy">
              <AccordionTrigger className="text-sm font-medium">
                Privacy Policy
              </AccordionTrigger>
              <AccordionContent className="text-xs text-gray-600">
                <p className="mb-2">
                  Our application processes all images locally on your device. We do not collect, store,
                  or transmit your images to any external servers. Any data stored on your device
                  is encrypted and can be deleted at any time from the Security settings.
                </p>
                <p>
                  The app requires camera and storage permissions to function properly. These
                  permissions are used only for capturing and saving images on your device.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="data-usage">
              <AccordionTrigger className="text-sm font-medium">
                Data Usage
              </AccordionTrigger>
              <AccordionContent className="text-xs text-gray-600">
                <p>
                  The application uses TensorFlow Lite models that operate entirely on your
                  device. These models may consume significant processing power and battery
                  during image analysis. You can manage battery usage in the Settings page.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="card-container mb-6">
          <h2 className="section-title flex items-center">
            <Users className="mr-2" size={18} />
            Technology
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            This application is built using advanced technologies:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>TensorFlow for machine learning and object detection</span>
            </li>
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>React and Capacitor for cross-platform mobile development</span>
            </li>
            <li className="flex items-start">
              <span className="text-app-blue mr-2">•</span>
              <span>Advanced facial landmark detection algorithms</span>
            </li>
          </ul>
        </div>
        
        <div className="card-container">
          <h2 className="section-title flex items-center">
            <HeartHandshake className="mr-2" size={18} />
            Contact & Support
          </h2>
          <div className="space-y-3 mt-3">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Mail size={16} />
              <span>Contact Support</span>
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Github size={16} />
              <span>GitHub Repository</span>
            </Button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2025 Sight Beyond Vision</p>
          <p>All Rights Reserved</p>
        </div>
      </main>
    </div>
  );
};

export default About;
