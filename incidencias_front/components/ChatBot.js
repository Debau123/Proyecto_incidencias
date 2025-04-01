// ✅ ChatBot.js sin desbordes ni en input ni en respuesta

import { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!userInput.trim() && !file) return;

    const newMessage = { role: 'user', content: userInput };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Eres un asistente técnico útil que ayuda con incidencias y dispositivos." },
            ...newMessages,
            file ? { role: 'user', content: `Archivo subido: ${file.name}` } : null
          ].filter(Boolean)
        }),
      });

      const data = await response.json();
      const botReply = data.choices?.[0]?.message;

      if (botReply) {
        setMessages(prev => [...prev, botReply]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "❌ Respuesta inválida del bot." }]);
      }
    } catch (err) {
      console.error("Error en el chatbot:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Error al conectar con el bot." }]);
    }

    setFile(null);
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem', minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '0.5rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <span
              style={{
                background: msg.role === 'user' ? '#2563eb' : '#374151',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'inline-block',
                color: 'white',
                maxWidth: '90%',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: 'white' }}>⏳ Pensando...</p>}
        <div ref={bottomRef} />
      </div>

      {file && (
        <div style={{ color: 'white', fontSize: '0.9rem', margin: '0.5rem 1rem' }}>
          📎 Archivo seleccionado: {file.name}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '1rem',
          borderTop: '1px solid #374151',
          alignItems: 'center',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <label htmlFor="file-upload" style={{
          backgroundColor: '#4b5563',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          flexShrink: 0
        }}>📎</label>

        <input
          id="file-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid #6b7280',
            backgroundColor: '#1f2937',
            color: 'white',
            minWidth: 0
          }}
          placeholder="Escribe tu duda..."
        />

        <button
          onClick={sendMessage}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            padding: '0.5rem 0.6rem',
            fontSize: '1.1rem',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title="Enviar"
        >
          ✉️
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
