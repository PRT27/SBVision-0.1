
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Camera from "./pages/Camera";
import Gallery from "./pages/Gallery";
import ImageLabeling from "./pages/ImageLabeling";
import FaceDetection from "./pages/FaceDetection";
import FaceRecognition from "./pages/FaceRecognition";  // Add import
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/image-labeling" element={<ImageLabeling />} />
          <Route path="/face-detection" element={<FaceDetection />} />
          <Route path="/face-recognition" element={<FaceRecognition />} />  {/* Add new route */}
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
