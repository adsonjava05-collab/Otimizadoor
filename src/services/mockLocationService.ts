import { getAndroidBridge } from './nativeDownload';

declare global {
  interface Window {
    __rota123MockLocationState?: (activeId: string, error: string) => void;
  }
}

export type MockLocationError = 'not_mock_app' | 'no_coordinates' | 'unknown' | '';

export function isMockLocationSupported(): boolean {
  const bridge = getAndroidBridge();
  return bridge !== null && typeof bridge.startMockLocation === 'function';
}

export function getMockLocationActiveId(): string | null {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.getMockLocationActiveId !== 'function') return null;
  const id = bridge.getMockLocationActiveId();
  return id || null;
}

export function startMockLocation(locationId: string): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.startMockLocation !== 'function') return false;
  return bridge.startMockLocation(locationId);
}

export function stopMockLocation(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.stopMockLocation !== 'function') return false;
  return bridge.stopMockLocation();
}

export function openMockLocationSettings(): boolean {
  const bridge = getAndroidBridge();
  if (!bridge || typeof bridge.openMockLocationSettings !== 'function') return false;
  bridge.openMockLocationSettings();
  return true;
}

export function onMockLocationStateChange(
  callback: (activeId: string | null, error: MockLocationError) => void,
): () => void {
  window.__rota123MockLocationState = (activeId: string, error: string) => {
    callback(activeId || null, error as MockLocationError);
  };
  return () => {
    if (window.__rota123MockLocationState) {
      delete window.__rota123MockLocationState;
    }
  };
}
