import { getAndroidBridge } from './nativeDownload';

declare global {
  interface Window {
    __rota123OverlayState?: (active: boolean) => void;
  }
}

export function isFloatingNumberSupported(): boolean {
  return getAndroidBridge() !== null;
}

export function getFloatingNumberActive(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.isFloatingNumberActive !== 'function') return false;
  return bridge.isFloatingNumberActive();
}

export function requestStartFloatingNumber(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.requestStartFloatingNumber !== 'function') return false;
  return bridge.requestStartFloatingNumber();
}

export function requestStopFloatingNumber(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.requestStopFloatingNumber !== 'function') return false;
  return bridge.requestStopFloatingNumber();
}

export function onFloatingNumberStateChange(callback: (active: boolean) => void): () => void {
  window.__rota123OverlayState = callback;
  return () => {
    if (window.__rota123OverlayState === callback) {
      delete window.__rota123OverlayState;
    }
  };
}
