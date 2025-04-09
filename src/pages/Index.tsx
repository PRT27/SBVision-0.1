
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, PieChart, Users, Info, Shield } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  const showPermissionsToast = () => {
    toast.info("Camera and storage permissions are required for full functionality.");
  };

  React.useEffect(() => {
    // Show welcome toast when app first loads
    toast.success("Welcome to Sight Beyond Vision", {
      description: "Tap a feature to get started",
      duration: 5000,
    });
    
    // Inform about needed permissions
    setTimeout(showPermissionsToast, 2000);
  }, []);

  const features = [
    {
      title: "Image Labeling",
      description: "Identify objects in images",
      icon: <PieChart className="h-8 w-8 text-app-blue" />,
      path: "/image-labeling",
      color: "bg-blue-50"
    },
    {
      title: "Face Detection",
      description: "Detect and analyze faces",
      icon: <Users className="h-8 w-8 text-app-blue" />,
      path: "/face-detection",
      color: "bg-purple-50"
    },
    {
      title: "Camera",
      description: "Capture images for analysis",
      icon: <Camera className="h-8 w-8 text-app-blue" />,
      path: "/camera",
      color: "bg-green-50"
    },
    {
      title: "Gallery",
      description: "View and manage saved images",
      icon: <Image className="h-8 w-8 text-app-blue" />,
      path: "/gallery",
      color: "bg-yellow-50"
    },
    {
      title: "Security",
      description: "Manage app security settings",
      icon: <Shield className="h-8 w-8 text-app-blue" />,
      path: "/security",
      color: "bg-red-50"
    },
    {
      title: "About",
      description: "Learn about the application",
      icon: <Info className="h-8 w-8 text-app-blue" />,
      path: "/about",
      color: "bg-gray-50"
    }
  ];

  return (
    <div className="app-container">
      <AppHeader title="Sight Beyond Vision" />
      
      <main className="flex-1 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-app-blue mb-2">Welcome</h1>
          <p className="text-gray-600">Advanced image analysis and facial recognition</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <button
              key={feature.title}
              onClick={() => handleFeatureClick(feature.path)}
              className={`${feature.color} p-4 rounded-xl shadow-sm flex flex-col items-center text-center transition-transform hover:scale-105`}
            >
              <div className="mb-3">{feature.icon}</div>
              <h2 className="font-semibold text-app-dark-blue mb-1">{feature.title}</h2>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-app-dark-blue mb-2">Getting Started</h2>
          <p className="text-sm text-gray-600 mb-3">
            Tap on any feature to begin. For best results, ensure you have good lighting when taking photos.
          </p>
          <button 
            onClick={() => navigate('/about')}
            className="text-app-blue text-sm font-medium"
          >
            Learn more
          </button>
        </div>
      </main>
    </div>
  );
};

export default Index;
