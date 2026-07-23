import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

const STUDY_FOCUS_KEY = 'studygen-study-focus';

const safeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

export function getStoredStudyFocus(userId) {
  return localStorage.getItem(`${STUDY_FOCUS_KEY}:${userId}`) || '';
}

export async function saveProfile(user, { displayName, studyFocus, avatarFile }) {
  if (!user) throw new Error('You need to be signed in to update your profile.');

  let photoURL = user.photoURL || '';
  if (avatarFile) {
    const avatarRef = ref(storage, `profile-avatars/${user.uid}/${Date.now()}-${safeFileName(avatarFile.name)}`);
    await uploadBytes(avatarRef, avatarFile, { contentType: avatarFile.type });
    photoURL = await getDownloadURL(avatarRef);
  }

  await updateProfile(user, { displayName: displayName.trim(), photoURL });
  localStorage.setItem(`${STUDY_FOCUS_KEY}:${user.uid}`, studyFocus.trim());

  return { displayName: displayName.trim(), photoURL, studyFocus: studyFocus.trim() };
}
