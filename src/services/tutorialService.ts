export type TutorialType = 'flex' | 'frota';
export type TutorialStatus = 'pendente' | 'pulado' | 'concluido';

const STATUS_KEY_PREFIX = 'tutorial_';
const LEGACY_COMPLETED_PREFIX = 'rota123_tutorial_completed_';

function statusKey(type: TutorialType): string {
  return `${STATUS_KEY_PREFIX}${type}_status`;
}

function migrateLegacy(type: TutorialType): void {
  try {
    const existing = localStorage.getItem(statusKey(type));
    if (existing) return;
    const legacy = localStorage.getItem(LEGACY_COMPLETED_PREFIX + type);
    if (legacy) {
      localStorage.setItem(statusKey(type), 'concluido');
    }
  } catch {
    // ignore storage errors
  }
}

export function getTutorialStatus(type: TutorialType): TutorialStatus {
  try {
    migrateLegacy(type);
    const val = localStorage.getItem(statusKey(type));
    if (val === 'pulado' || val === 'concluido') return val;
    return 'pendente';
  } catch {
    return 'pendente';
  }
}

export function setTutorialStatus(type: TutorialType, status: TutorialStatus): void {
  try {
    localStorage.setItem(statusKey(type), status);
  } catch (err) {
    console.error('Error saving tutorial status:', err);
  }
}

export function shouldAutoOpenTutorial(type: TutorialType): boolean {
  return getTutorialStatus(type) === 'pendente';
}

export async function completeTutorial(
  _userId: string,
  tutorialType: TutorialType,
): Promise<boolean> {
  setTutorialStatus(tutorialType, 'concluido');
  return true;
}

export async function skipTutorial(
  _userId: string,
  tutorialType: TutorialType,
): Promise<boolean> {
  setTutorialStatus(tutorialType, 'pulado');
  return true;
}

export async function hasCompletedTutorial(
  _userId: string,
  tutorialType: TutorialType,
): Promise<boolean> {
  return getTutorialStatus(tutorialType) === 'concluido';
}
