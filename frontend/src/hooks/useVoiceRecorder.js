import { useRef, useState } from 'react';

export default function useVoiceRecorder() {
  const mediaRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = (e) => chunks.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRef.current = mr;
    mr.start();
    setIsRecording(true);
  };

  const stop = () => {
    if (mediaRef.current) {
      mediaRef.current.stop();
      setIsRecording(false);
    }
  };

  const reset = () => {
    setAudioBlob(null);
  };

  return { isRecording, audioBlob, start, stop, reset };
}
