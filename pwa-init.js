// PWA initialization and update handling
(function() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('[PWA] Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Listen for controller change (new SW activated)
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        // Handle waiting service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW is ready, show update prompt
              showUpdatePrompt();
            }
          });
        });

      } catch (error) {
        console.log('[PWA] Service Worker registration failed:', error);
      }
    });
  }

  // Show update prompt
  function showUpdatePrompt() {
    const prompt = document.createElement('div');
    prompt.id = 'pwa-update-prompt';
    prompt.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      background: #1f1a14;
      color: #f4ead8;
      border: 2px solid #ff8a1e;
      border-radius: 12px;
      padding: 16px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;

    prompt.innerHTML = `
      <p style="margin: 0 0 12px 0; font-size: 14px;">
        <strong style="color: #ff8a1e;">New update available!</strong><br>
        Click "Update" to get the latest version.
      </p>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="pwa-dismiss" style="
          padding: 6px 12px;
          border: 1px solid #3f3324;
          background: #1f1a14;
          color: #f4ead8;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        ">Later</button>
        <button id="pwa-update" style="
          padding: 6px 12px;
          border: none;
          background: #ff8a1e;
          color: #1a1208;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        ">Update</button>
      </div>
    `;

    document.body.appendChild(prompt);

    document.getElementById('pwa-dismiss').addEventListener('click', () => {
      prompt.remove();
    });

    document.getElementById('pwa-update').addEventListener('click', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }

  // Install prompt handler
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
  });

  function showInstallPrompt() {
    if (!deferredPrompt) return;

    const prompt = document.createElement('div');
    prompt.id = 'pwa-install-prompt';
    prompt.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 300px;
      background: #1f1a14;
      color: #f4ead8;
      border: 2px solid #ff8a1e;
      border-radius: 12px;
      padding: 16px;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;

    prompt.innerHTML = `
      <p style="margin: 0 0 12px 0; font-size: 14px;">
        <strong style="color: #ff8a1e;">Install App</strong><br>
        Get LiveReaction on your device for quick access!
      </p>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="pwa-install-dismiss" style="
          padding: 6px 12px;
          border: 1px solid #3f3324;
          background: #1f1a14;
          color: #f4ead8;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        ">Not now</button>
        <button id="pwa-install" style="
          padding: 6px 12px;
          border: none;
          background: #ff8a1e;
          color: #1a1208;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        ">Install</button>
      </div>
    `;

    document.body.appendChild(prompt);

    document.getElementById('pwa-install-dismiss').addEventListener('click', () => {
      prompt.remove();
      deferredPrompt = null;
    });

    document.getElementById('pwa-install').addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted install prompt');
        }
        deferredPrompt = null;
        prompt.remove();
      });
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
  });

  // Check if running in standalone mode (installed as app)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('[PWA] Running in standalone mode');
  }

  // Add to home screen analytics
  const displayMode = navigator.standalone === true ? 'standalone' : 'browser';
  if (window.location.search.includes('utm_source=pwa')) {
    console.log('[PWA] Launched from app shortcut');
  }

})();
