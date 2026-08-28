let audioContext = null;
let audioBuffer = null;
let sourceNode = null;
let gainNode = null;
let activeSoundId = 'none';
let isPlaying = false;

export function getActiveAmbientSound() {
  return activeSoundId;
}

export async function playAmbientSound(sound) {
  if (!sound?.file) {
    stopAmbientSound();
    return false;
  }

  if (activeSoundId === sound.id && isPlaying) {
    return true;
  }

  stopAmbientSound();
  activeSoundId = sound.id;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const response = await fetch(`/sounds/${sound.file}`);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Find actual audio start and end to avoid gaps/silence when looping
    const threshold = 0.005; // silence threshold
    let actualStart = 0;
    let actualEnd = audioBuffer.duration;

    for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
      const data = audioBuffer.getChannelData(c);
      
      // Find start
      let startIdx = 0;
      while (startIdx < data.length && Math.abs(data[startIdx]) < threshold) {
        startIdx++;
      }
      const channelStart = startIdx / audioBuffer.sampleRate;
      if (channelStart < actualStart || c === 0) actualStart = channelStart;

      // Find end
      let endIdx = data.length - 1;
      while (endIdx >= 0 && Math.abs(data[endIdx]) < threshold) {
        endIdx--;
      }
      const channelEnd = (endIdx + 1) / audioBuffer.sampleRate;
      if (channelEnd > actualEnd || c === 0) actualEnd = channelEnd;
    }

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    
    // Set loop boundaries to skip silence
    if (actualEnd > actualStart) {
      sourceNode.loopStart = actualStart;
      sourceNode.loopEnd = actualEnd;
    } else {
      actualStart = 0;
      actualEnd = audioBuffer.duration;
    }

    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.28;

    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start at the actual non-silent part
    sourceNode.start(0, actualStart);
    isPlaying = true;
    return true;
  } catch (error) {
    console.error("Audio playback failed:", error);
    stopAmbientSound();
    return false;
  }
}

export function stopAmbientSound() {
  if (sourceNode) {
    try {
      sourceNode.stop();
      sourceNode.disconnect();
    } catch (e) {
      // ignore if already stopped
    }
    sourceNode = null;
  }
  isPlaying = false;
  activeSoundId = 'none';
}
