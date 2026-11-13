import { deleteRecord, getAllRecords, getRecord, putRecord } from './localDb';
import { getInstallationId } from './installationService';

export type DisplayLocation = 'after_login' | 'login';

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  displayLocation: DisplayLocation;
  showOncePerUser: boolean;
  requireConfirmation: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementConfirmation {
  id: string;
  userId: string;
  announcementId: string;
  confirmedAt: string;
}

const DISMISSED_ANNOUNCEMENTS_KEY = 'romaneio_dismissed_announcements';

function getDismissedAnnouncementIds(): Set<string> {
  try {
    const stored = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore errors
  }
  return new Set();
}

export function dismissAnnouncementLocally(announcementId: string): void {
  try {
    const dismissed = getDismissedAnnouncementIds();
    dismissed.add(announcementId);
    localStorage.setItem(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify([...dismissed]));
  } catch {
    // Ignore errors
  }
}

async function getStoredAnnouncements(): Promise<GlobalAnnouncement[]> {
  return getAllRecords<GlobalAnnouncement>('global_announcements');
}

export async function getAllAnnouncements(): Promise<GlobalAnnouncement[]> {
  try {
    const announcements = await getStoredAnnouncements();
    return announcements.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return [];
  }
}

export async function getActiveAnnouncements(
  location: DisplayLocation,
  _userId?: string
): Promise<GlobalAnnouncement[]> {
  try {
    const now = Date.now();
    const announcements = (await getStoredAnnouncements()).filter((a) => {
      if (!a.isActive || a.displayLocation !== location) return false;
      if (a.startDate && new Date(a.startDate).getTime() > now) return false;
      if (a.endDate && new Date(a.endDate).getTime() < now) return false;
      return true;
    });

    const visible: GlobalAnnouncement[] = [];
    for (const announcement of announcements) {
      const confirmed = announcement.showOncePerUser
        ? await getRecord<AnnouncementConfirmation>('announcement_confirmations', announcement.id)
        : undefined;
      if (!confirmed) visible.push(announcement);
    }
    return visible;
  } catch (err) {
    console.error('Error fetching active announcements:', err);
    return [];
  }
}

export async function createAnnouncement(
  announcement: Omit<GlobalAnnouncement, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GlobalAnnouncement | null> {
  const now = new Date().toISOString();
  const record: GlobalAnnouncement = {
    ...announcement,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  try {
    await putRecord('global_announcements', record);
    return record;
  } catch (err) {
    console.error('Error creating announcement:', err);
    return null;
  }
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<Omit<GlobalAnnouncement, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> {
  try {
    const current = await getRecord<GlobalAnnouncement>('global_announcements', id);
    if (!current) return false;
    await putRecord('global_announcements', {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error updating announcement:', err);
    return false;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    await deleteRecord('global_announcements', id);
    return true;
  } catch (err) {
    console.error('Error deleting announcement:', err);
    return false;
  }
}

export async function confirmAnnouncement(_userId: string, announcementId: string): Promise<boolean> {
  try {
    const confirmation: AnnouncementConfirmation = {
      id: announcementId,
      userId: getInstallationId(),
      announcementId,
      confirmedAt: new Date().toISOString(),
    };
    await putRecord('announcement_confirmations', confirmation);
    return true;
  } catch (err) {
    console.error('Error confirming announcement:', err);
    return false;
  }
}

export async function hasUserConfirmedAnnouncement(
  _userId: string,
  announcementId: string
): Promise<boolean> {
  try {
    const record = await getRecord<AnnouncementConfirmation>('announcement_confirmations', announcementId);
    return !!record;
  } catch (err) {
    console.error('Error checking announcement confirmation:', err);
    return false;
  }
}

export async function getAnnouncementConfirmations(
  announcementId: string
): Promise<AnnouncementConfirmation[]> {
  try {
    const all = await getAllRecords<AnnouncementConfirmation>('announcement_confirmations');
    return all.filter((c) => c.announcementId === announcementId);
  } catch (err) {
    console.error('Error fetching confirmations:', err);
    return [];
  }
}
