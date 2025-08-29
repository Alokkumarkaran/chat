import React, { useRef, useState } from 'react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import API from '../services/api';
import { getSocket } from '../services/socket';
import { v4 as uuidv4 } from 'uuid';

export default function MessageInput({ onSend, toUser, me }) {
  const [text, setText] = useState('');
  const fileRef = useRef(null);
  const { isRecording, audioBlob, start, stop, reset } = useVoiceRecorder();

  const sendText = async () => {
    if (!text.trim() && !audioBlob) return;
    const socket = getSocket();
    const payload = {
      chatId: null, // backend will create chat if missing
      to: toUser?._id,
      type: audioBlob ? 'voice' : 'text',
      text: text.trim(),
      attachments: []
    };

    // If audio exists, upload it to server first
    if (audioBlob) {
      const fd = new FormData();
      fd.append('files', audioBlob, `voice-${Date.now()}.webm`);
      const up = await API.post('/api/uploads/file', fd);
      payload.attachments = up.data.files;
    } else if (fileRef.current?.files?.length) {
      const fd = new FormData();
      for (let f of fileRef.current.files) fd.append('files', f);
      const up = await API.post('/api/uploads/file', fd);
      payload.attachments = up.data.files;
    }

    await onSend(payload);
    setText('');
    fileRef.current && (fileRef.current.value = null);
    reset();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <input type="file" ref={fileRef} className="hidden" multiple id="file" />
      <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKey}
        placeholder="Type a message" className="flex-1 p-3 border rounded-lg resize-none h-12" />
      <div className="flex items-center gap-2">
        <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => fileRef.current?.click()}>📎</button>
        {!isRecording ? <button className="px-3 py-2 bg-gray-200 rounded" onClick={start}>🎤</button>
          : <button className="px-3 py-2 bg-red-500 text-white rounded" onClick={stop}>Stop</button>}
        <button onClick={sendText} className="px-4 py-2 bg-primary text-white rounded">Send</button>
      </div>
    </div>
  );
}
