import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myduolingo',
  appName: 'Faro',
  webDir: 'out',
  server: {
    // Ensures the WebView uses the same origin as the live site
    androidScheme: 'https',
    hostname: 'myduolingo.vercel.app',
    url: 'https://myduolingo.vercel.app',
    allowNavigation: [
      'myduolingo.vercel.app',
      '*.clerk.accounts.dev',
      '*.clerk.com',
      '*.onesignal.com'
    ]
  },
  plugins: {
    // Bridges cookies between Chrome Custom Tabs and the WebView.
    // Without this, the OAuth token stays in Chrome and never reaches the app.
    CapacitorCookies: {
      enabled: true
    },
    // Disable native HTTP to avoid interfering with Clerk's fetch calls
    CapacitorHttp: {
      enabled: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      backgroundColor: "#ffffff"
    },
    Keyboard: {
      resize: "body" as any,
      style: "light" as any
    }
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.jks',
      keystoreAlias: 'my-key-alias',
    }
  }
};

export default config;
