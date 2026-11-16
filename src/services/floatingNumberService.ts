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

export function hasFloatingNumberPermission(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge) return false;
  if (typeof bridge.hasOverlayPermission === 'function') return bridge.hasOverlayPermission();
  return getFloatingNumberActive();
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

export function openFloatingNumberAppSettings(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.openAppDetailsSettings !== 'function') return false;
  bridge.openAppDetailsSettings();
  return true;
}

export function getFloatingNumberAutoFill(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.getFloatingNumberAutoFill !== 'function') return false;
  return bridge.getFloatingNumberAutoFill();
}

export function setFloatingNumberAutoFill(enabled: boolean): void {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.setFloatingNumberAutoFill !== 'function') return;
  bridge.setFloatingNumberAutoFill(enabled);
}

export function isFillAccessibilityConnected(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.isFillAccessibilityConnected !== 'function') return false;
  return bridge.isFillAccessibilityConnected();
}

export function openAccessibilitySettings(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.openAccessibilitySettings !== 'function') return false;
  bridge.openAccessibilitySettings();
  return true;
}

export function onFloatingNumberStateChange(callback: (active: boolean) => void): () => void {
  window.__rota123OverlayState = callback;
  return () => {
    if (window.__rota123OverlayState === callback) {
      delete window.__rota123OverlayState;
    }
  };
}
