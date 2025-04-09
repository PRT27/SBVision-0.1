
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ec50cfad8c904b8192778e21943fbb93',
  appName: 'Sight Beyond Vision',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "https://ec50cfad-8c90-4b81-9277-8e21943fbb93.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0056b3",
      showSpinner: true,
      spinnerColor: "#FFFFFF",
      androidScaleType: "CENTER_CROP"
    },
    Camera: {
      presentationStyle: 'fullscreen',
      androidScaleType: 'fitCenter',
    },
    // Permissions configuration for Android
    Permissions: {
      permissions: [
        "android.permission.CAMERA", 
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE", 
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
};

export default config;
