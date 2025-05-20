
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.64ec5de182d843c8a387de0ff66a087c',
  appName: 'meal-magic-shopper',
  webDir: 'dist',
  server: {
    url: 'https://64ec5de1-82d8-43c8-a387-de0ff66a087c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffffff",
      showSpinner: true,
      spinnerColor: "#4F46E5",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
