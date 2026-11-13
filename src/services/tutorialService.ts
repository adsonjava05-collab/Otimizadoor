import { getAllRecords, getRecord, putRecord } from './localDb';

export type TutorialType = 'flex' | 'interface' | 'frota';

interface TutorialCompletionRecord {
  id: TutorialType;
  completed: boolean;
  completed_at: string;
}

export async function completeTutorial(
  _userId: string,
  tutorialType: TutorialType
): Promise<boolean> {
  try {
    await putRecord<TutorialCompletionRecord>('tutorial_completions', {
      id: tutorialType,
      completed: true,
      completed_at: new Date().toISOString(),
    });
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
    const record = await getRecord<TutorialCompletionRecord>('tutorial_completions', tutorialType);
    return !!record?.completed;
  } catch (err) {
    console.error('Error checking tutorial completion:', err);
    return false;
  }
}

export async function getCompletedTutorials(_userId: string): Promise<TutorialType[]> {
  try {
    const records = await getAllRecords<TutorialCompletionRecord>('tutorial_completions');
    return records.filter((r) => r.completed).map((r) => r.id);
  } catch (err) {
    console.error('Error listing completed tutorials:', err);
    return [];
  }
}

export async function hasCompletedFlexTutorial(userId: string): Promise<boolean> {
  return hasCompletedTutorial(userId, 'flex');
}
