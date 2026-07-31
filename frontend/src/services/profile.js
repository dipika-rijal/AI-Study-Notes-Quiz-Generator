import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

const STUDY_FOCUS_KEY = 'studygen-study-focus';

const safeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

export function getStoredStudyFocus(userId) {
  return localStorage.getItem(`${STUDY_FOCUS_KEY}:${userId}`) || '';
}

function compressImage(file, maxWidth = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        if (scale < 1) {
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress heavily to keep the Firebase Auth token small
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function saveProfile(user, { displayName, studyFocus, avatarFile }) {
  if (!user) throw new Error('You need to be signed in to update your profile.');

  let photoURL = user.photoURL || '';
  if (avatarFile) {
    try {
      // Compress to a small Base64 string and save directly to Firebase Auth 
      // to avoid Firebase Storage CORS and hanging issues on localhost.
      photoURL = await compressImage(avatarFile);
    } catch (err) {
      console.warn("Failed to compress image, using default", err);
    }
  }

  await updateProfile(user, { displayName: displayName.trim(), photoURL });
  localStorage.setItem(`${STUDY_FOCUS_KEY}:${user.uid}`, studyFocus.trim());

  return { displayName: displayName.trim(), photoURL, studyFocus: studyFocus.trim() };
}
