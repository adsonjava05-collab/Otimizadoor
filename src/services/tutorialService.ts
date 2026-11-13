export type TutorialType = 'flex';

const COMPLETED_KEY_PREFIX = 'rota123_tutorial_completed_';

export async function completeTutorial(
  _userId: string,
  tutorialType: TutorialType
): Promise<boolean> {
  try {
    localStorage.setItem(COMPLETED_KEY_PREFIX + tutorialType, new Date().toISOString());
    return true;
  } catch (err) {
    console.error('Error completing tutorial:', err);
    return false;
  }
}

export async function hasCompletedTutorial(
  _userId: string,
  tutorialType: TutorialType
): Promise<boolean> {
  try {
    return localStorage.getItem(COMPLETED_KEY_PREFIX + tutorialType) !== null;
  } catch (err) {
    console.error('Error checking tutorial completion:', err);
    return false;
  }
}
