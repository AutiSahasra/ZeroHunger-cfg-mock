// Google Maps JavaScript API Dynamic Script Loader & Key Validator

let googleMapsPromise = null;

// Determine if a key is a valid Google Cloud API key vs a demo placeholder
export function isRealGoogleKey(key) {
  if (!key) return false;
  const str = String(key).trim();
  if (
    str.includes('DemoKey') ||
    str.startsWith('YOUR_') ||
    str.length < 30 ||
    str.includes(' ')
  ) {
    return false;
  }
  return true;
}

// Fetch Google Maps API Key from backend or env
export async function getGoogleMapsApiKey() {
  let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || !isRealGoogleKey(apiKey)) {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/maps/config`);
      const data = await res.json();
      if (data?.data?.apiKey && isRealGoogleKey(data.data.apiKey)) {
        apiKey = data.data.apiKey;
      }
    } catch (e) {
      console.warn('[GoogleMapsLoader] Backend config fetch note:', e.message);
    }
  }

  return apiKey || '';
}

export function loadGoogleMapsScript(customApiKey = null) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise(async (resolve, reject) => {
    try {
      const apiKey = customApiKey || (await getGoogleMapsApiKey());

      // If key is a placeholder or not configured, avoid triggering Google's "Oops!" error page
      if (!isRealGoogleKey(apiKey)) {
        return reject(new Error('INVALID_OR_DEMO_KEY'));
      }

      // Register Google Maps global authentication failure handler
      window.gm_authFailure = () => {
        console.warn('[GoogleMapsLoader] gm_authFailure triggered: Google Maps API key unauthorized or unactivated.');
        window.dispatchEvent(new CustomEvent('google-maps-auth-failure'));
      };

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google.maps));
        existingScript.addEventListener('error', (err) => reject(err));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google && window.google.maps) {
          console.log('[GoogleMapsLoader] Google Maps JavaScript API loaded successfully.');
          resolve(window.google.maps);
        } else {
          reject(new Error('Google Maps script loaded but window.google.maps is undefined'));
        }
      };

      script.onerror = (err) => {
        console.warn('[GoogleMapsLoader] Script network error. Fallback GPS active.');
        reject(err);
      };

      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });

  return googleMapsPromise;
}
