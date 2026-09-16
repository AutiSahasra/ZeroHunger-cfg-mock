import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';

export const ChatModal = ({ isOpen, onClose, request }) => {
  const { currentUser } = useAuth();
  const { currentChatMessages, sendMessage } = useRequests();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);

  if (!isOpen || !request) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText.trim());
    setInputText('');

    // Simulate instant volunteer or donor reply for interactive demonstration
    setTimeout(() => {
      const otherRole = currentUser?.role === 'DONOR' ? 'VOLUNTEER' : 'DONOR';
      const autoText =
        otherRole === 'VOLUNTEER'
          ? 'Got it! I am just 5 minutes away with thermal insulated carriers.'
          : 'Thank you for the update, our gate security has been informed!';
      
      const mockOtherUser = {
        id: otherRole === 'VOLUNTEER' ? 'vol-1' : 'donor-1',
        name: otherRole === 'VOLUNTEER' ? (request.assignedVolunteerName || 'Karthik Raja') : request.donorName,
        role: otherRole
      };
      // Send simulated response
      // We can use storageService directly
      import('../../services/storageService').then(srv => {
        srv.sendChatMessage(request.id, mockOtherUser, autoText);
      });
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px', height: '600px', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--sky-50)', color: 'var(--sky-600)', padding: '6px', borderRadius: '8px' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Mission Coordination Chat
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                Request {request.id} • {request.donorName} &amp; {request.assignedVolunteerName || 'Volunteer'}
              </p>
            </div>
          </div>
          <button className="icon-badge-btn" onClick={onClose} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        {/* Chat Feed */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: 'var(--slate-50)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
            <span style={{ fontSize: '0.68rem', background: 'var(--slate-200)', color: 'var(--slate-600)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
              Encrypted Real-Time Channel (TRD Section 9)
            </span>
          </div>

          {currentChatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--slate-400)', marginTop: '40px', fontSize: '0.84rem' }}>
              No messages yet. Send a message to coordinate food pickup or delivery!
            </div>
          ) : (
            currentChatMessages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id || msg.senderRole === currentUser?.role;
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', marginBottom: '2px', fontWeight: 600 }}>
                    {msg.senderName}
                  </div>
                  <div
                    style={{
                      background: isMine ? 'var(--primary-600)' : 'white',
                      color: isMine ? 'white' : 'var(--slate-900)',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderBottomRightRadius: isMine ? '4px' : '16px',
                      borderBottomLeftRadius: isMine ? '16px' : '4px',
                      boxShadow: 'var(--shadow-sm)',
                      fontSize: '0.84rem',
                      lineHeight: 1.4,
                      border: isMine ? 'none' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', background: 'white' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Type message to coordinate..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ borderRadius: 'var(--radius-full)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0 16px' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
