// ✅ ChatBotFloating.js mejorado con botón ⛶ (pantalla completa) y 📎 (adjuntar archivo)

import { useState } from 'react';
import ChatBot from './ChatBot';

const ChatBotFloating = () => {
  const [visible, setVisible] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      {!visible && (
        <div
          onClick={() => setVisible(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 1000,
          }}
        >
          💬
        </div>
      )}

      {visible && (
        <div
          style={{
            position: 'fixed',
            bottom: fullScreen ? '0' : '90px',
            right: fullScreen ? '0' : '20px',
            width: fullScreen ? '100vw' : '350px',
            height: fullScreen ? '100vh' : '500px',
            backgroundColor: '#111827',
            border: '2px solid #3b82f6',
            borderRadius: fullScreen ? '0' : '12px',
            padding: '1rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Asistente IA</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFullScreen(!fullScreen)}
                style={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #3b82f6',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ⛶
              </button>
              <button
                onClick={() => setVisible(false)}
                style={{
                  backgroundColor: '#dc2626',
                  border: 'none',
                  color: 'white',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <ChatBot />
        </div>
      )}
    </>
  );
};

export default ChatBotFloating;