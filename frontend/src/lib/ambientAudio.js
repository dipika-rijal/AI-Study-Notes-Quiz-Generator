let activeAudio = null;
let activeSoundId = 'none';

export function getActiveAmbientSound() {
  return activeSoundId;
}

export async function playAmbientSound(sound) {
  if (!sound?.file) {
    stopAmbientSound();
    return false;
  }

  if (activeSoundId === sound.id && activeAudio && !activeAudio.paused) {
    return true;
  }

  activeAudio?.pause();
  activeAudio = new Audio(`/sounds/${sound.file}`);
  activeAudio.loop = true;
  activeAudio.volume = 0.28;
  activeSoundId = sound.id;

  try {
    await activeAudio.play();
    return true;
  } catch {
    stopAmbientSound();
    return false;
  }
}

export function stopAmbientSound() {
  activeAudio?.pause();
  activeAudio = null;
  activeSoundId = 'none';
}
