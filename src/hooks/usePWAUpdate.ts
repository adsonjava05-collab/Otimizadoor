import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface PWAUpdateState {
  needRefresh: boolean;
  updateSW: () => void;
}

const UPDATE_CHECK_INTERVAL_MS = 60_000;

export function usePWAUpdate(): PWAUpdateState {
  const [needRefresh, setNeedRefresh] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const userRequestedUpdateRef = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let intervalId: number | undefined;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    const flagIfWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        setNeedRefresh(true);
      }
    };

    const watchRegistration = (reg: ServiceWorkerRegistration) => {
      registrationRef.current = reg;
      flagIfWaiting(reg);

      const onUpdateFound = () => {
        const worker = reg.installing;
        if (!worker) return;
        const onStateChange = () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedRefresh(true);
          }
        };
        worker.addEventListener('statechange', onStateChange);
        cleanups.push(() => worker.removeEventListener('statechange', onStateChange));
      };
      reg.addEventListener('updatefound', onUpdateFound);
      cleanups.push(() => reg.removeEventListener('updatefound', onUpdateFound));

      intervalId = window.setInterval(() => {
        reg.update().catch(() => {});
      }, UPDATE_CHECK_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        registrationRef.current?.update().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onControllerChange = () => {
      if (userRequestedUpdateRef.current) {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, reg) {
        if (!reg || disposed) return;
        watchRegistration(reg);
      },
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });

    return () => {
      disposed = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
      cleanups.forEach((fn) => fn());
      document.removeEventListener('visibilitychange', onVisibilityChange);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const updateSW = useCallback(async () => {
    const reg = registrationRef.current ?? (await navigator.serviceWorker.getRegistration());
    const waiting = reg?.waiting;
    if (!waiting) return;
    userRequestedUpdateRef.current = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }, []);

  return { needRefresh, updateSW };
}
