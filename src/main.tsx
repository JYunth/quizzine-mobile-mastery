import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Automatically update the service worker when a new version is available
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  }
})

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);

  // Hide the splash screen after the app is rendered
  const splashScreen = document.getElementById('splash-screen');
  if (splashScreen) {
    // Add a small delay to ensure the app renders before fading out
    setTimeout(() => {
      splashScreen.classList.add('hidden');
      // Optional: Remove the splash screen from DOM after transition
      setTimeout(() => {
        splashScreen.remove();
      }, 500); // Match the CSS transition duration
    }, 100); // Small delay before starting fade out
  }
} else {
  console.error("Failed to find the root element");
}
