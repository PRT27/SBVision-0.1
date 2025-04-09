
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon, 
  BellRing, 
  ZoomIn, 
  Volume2,
  Languages,
  HardDriveDownload,
  Trash2,
  Battery,
  Lightbulb
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [voiceAssistant, setVoiceAssistant] = useState(true);
  const [language, setLanguage] = useState("en");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [offlineMode, setOfflineMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [batteryOptimization, setBatteryOptimization] = useState(true);
  
  const handleClearCache = () => {
    // In a real app, this would clear the app's cache
    toast.success("Cache cleared successfully");
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast.success(`Language changed to ${
      value === 'en' ? 'English' : 
      value === 'es' ? 'Spanish' : 
      value === 'fr' ? 'French' : 
      value === 'zh' ? 'Chinese' : 'Unknown'
    }`);
  };
  
  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };
  
  const handleVoiceSpeedChange = (value: number[]) => {
    setVoiceSpeed(value[0]);
  };
  
  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    toast.success(`${checked ? 'Dark' : 'Light'} mode enabled`);
    // In a real app, this would change the theme
  };
  
  return (
    <div className="app-container">
      <AppHeader title="Settings" showBackButton={true} backPath="/" />
      
      <main className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <SettingsIcon className="text-app-blue mr-2" size={24} />
            <h2 className="text-xl font-bold text-app-dark-blue">Application Settings</h2>
          </div>
          <p className="text-sm text-gray-600">
            Customize the app experience to your preferences
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="card-container">
            <h3 className="section-title">Accessibility</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="text-app-blue" size={18} />
                  <span>Voice Assistant</span>
                </div>
                <Switch 
                  checked={voiceAssistant}
                  onCheckedChange={(checked) => setVoiceAssistant(checked)}
                />
              </div>
              
              {voiceAssistant && (
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">
                    Voice Speed: {voiceSpeed.toFixed(1)}x
                  </label>
                  <Slider
                    defaultValue={[voiceSpeed]}
                    max={2}
                    min={0.5}
                    step={0.1}
                    onValueChange={handleVoiceSpeedChange}
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Zoom Level: {zoomLevel}%
                </label>
                <div className="flex items-center gap-2">
                  <ZoomIn size={16} className="text-gray-500" />
                  <Slider
                    defaultValue={[zoomLevel]}
                    max={150}
                    min={80}
                    step={5}
                    onValueChange={handleZoomChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-container">
            <h3 className="section-title">Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="text-app-blue" size={18} />
                  <span>Notifications</span>
                </div>
                <Switch 
                  checked={notifications}
                  onCheckedChange={(checked) => setNotifications(checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="text-app-blue" size={18} />
                  <span>Dark Mode</span>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDriveDownload className="text-app-blue" size={18} />
                  <span>Offline Mode</span>
                </div>
                <Switch 
                  checked={offlineMode}
                  onCheckedChange={(checked) => setOfflineMode(checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="text-app-blue" size={18} />
                  <span>Battery Optimization</span>
                </div>
                <Switch 
                  checked={batteryOptimization}
                  onCheckedChange={(checked) => setBatteryOptimization(checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="text-app-blue" size={18} />
                  <span>Language</span>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-container">
          <h3 className="section-title">Storage</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage app storage and cached data
          </p>
          <Button 
            variant="outline" 
            className="w-full mb-2 flex items-center justify-center gap-2"
            onClick={handleClearCache}
          >
            <Trash2 size={16} />
            <span>Clear Cache</span>
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            App Version: 1.0.0
          </p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
