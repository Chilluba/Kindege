import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shadowflight.game',
  appName: 'Shadow Flight',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
