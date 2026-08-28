import { updateProfile } from 'firebase/auth';

const STUDY_FOCUS_KEY = 'studygen-study-focus';

const safeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

export function getStoredStudyFocus(userId) {
  return localStorage.getItem(`${STUDY_FOCUS_KEY}:${userId}`) || '';
}

export async function saveProfile(user, { displayName, studyFocus }) {
  if (!user) throw new Error('You need to be signed in to update your profile.');

  await updateProfile(user, { displayName: displayName.trim() });
  localStorage.setItem(`${STUDY_FOCUS_KEY}:${user.uid}`, studyFocus.trim());

  return { displayName: displayName.trim(), photoURL: user.photoURL, studyFocus: studyFocus.trim() };
}
