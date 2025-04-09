
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Eye, EyeOff, Fingerprint, Info } from 'lucide-react';
import { toast } from 'sonner';

const Security = () => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [dataDeletionEnabled, setDataDeletionEnabled] = useState(true);
  
  const handleToggleEncryption = (checked: boolean) => {
    setEncryptionEnabled(checked);
    toast[checked ? 'success' : 'info'](
      checked ? "Data encryption enabled" : "Data encryption disabled"
    );
  };
  
  const handleToggleBiometrics = (checked: boolean) => {
    setBiometricsEnabled(checked);
    
    if (checked) {
      // In a real app, this would prompt for biometric authentication
      toast.success("Biometric authentication enabled");
    } else {
      toast.info("Biometric authentication disabled");
    }
  };
  
  const handleToggleAppLock = (checked: boolean) => {
    setAppLockEnabled(checked);
    toast[checked ? 'success' : 'info'](
      checked ? "App lock enabled" : "App lock disabled"
    );
  };
  
  const handleToggleDataDeletion = (checked: boolean) => {
    setDataDeletionEnabled(checked);
    toast[checked ? 'success' : 'info'](
      checked ? "Auto data deletion enabled" : "Auto data deletion disabled"
    );
  };
  
  const handleClearAllData = () => {
    // In a real app, this would clear all stored data
    toast.success("All data cleared successfully");
  };
  
  return (
    <div className="app-container">
      <AppHeader title="Security" showBackButton={true} backPath="/" />
      
      <main className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Shield className="text-app-blue mr-2" size={24} />
            <h2 className="text-xl font-bold text-app-dark-blue">Security Settings</h2>
          </div>
          <p className="text-sm text-gray-600">
            Configure security options to protect your data
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="card-container">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Lock className="text-app-blue" size={20} />
                <div>
                  <h3 className="font-medium text-app-dark-blue">Data Encryption</h3>
                  <p className="text-xs text-gray-500">
                    Encrypt all stored images and analysis data
                  </p>
                </div>
              </div>
              <Switch 
                checked={encryptionEnabled}
                onCheckedChange={handleToggleEncryption}
              />
            </div>
          </div>
          
          <div className="card-container">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Fingerprint className="text-app-blue" size={20} />
                <div>
                  <h3 className="font-medium text-app-dark-blue">Biometric Authentication</h3>
                  <p className="text-xs text-gray-500">
                    Use fingerprint or face ID to unlock the app
                  </p>
                </div>
              </div>
              <Switch 
                checked={biometricsEnabled}
                onCheckedChange={handleToggleBiometrics}
              />
            </div>
          </div>
          
          <div className="card-container">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                {appLockEnabled ? (
                  <Eye className="text-app-blue" size={20} />
                ) : (
                  <EyeOff className="text-app-blue" size={20} />
                )}
                <div>
                  <h3 className="font-medium text-app-dark-blue">App Lock</h3>
                  <p className="text-xs text-gray-500">
                    Require authentication every time the app is opened
                  </p>
                </div>
              </div>
              <Switch 
                checked={appLockEnabled}
                onCheckedChange={handleToggleAppLock}
              />
            </div>
          </div>
          
          <div className="card-container">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Info className="text-app-blue" size={20} />
                <div>
                  <h3 className="font-medium text-app-dark-blue">Auto Data Deletion</h3>
                  <p className="text-xs text-gray-500">
                    Automatically delete data after 30 days
                  </p>
                </div>
              </div>
              <Switch 
                checked={dataDeletionEnabled}
                onCheckedChange={handleToggleDataDeletion}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="section-title">Data Management</h3>
          <div className="card-container">
            <p className="text-sm text-gray-600 mb-4">
              Clear all stored images and analysis data from the device.
              This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleClearAllData}
            >
              Clear All Data
            </Button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2">
            <Shield className="text-yellow-500 shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Privacy Notice</h3>
              <p className="text-xs text-yellow-700">
                All image processing and analysis is performed locally on your device.
                No data is sent to our servers unless you explicitly share it.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Security;
