'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import styles from './AIAssistant.module.css';

interface AIAssistantProps {
  pageId?: string;
}

export default function AIAssistant({ pageId }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, status } = useChat({
    api: '/api/assistant',
    transport: new DefaultChatTransport({
      api: '/api/assistant',
    }),
    body: {
      conversationId: pageId || 'general',
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(true)}
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
            fill="currentColor"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className={styles.assistantPanel}>
      {/* Header */}
      <div className={styles.header}>
        <h3>Docs Assistant</h3>
        <button
          onClick={() => setIsOpen(false)}
          className={styles.closeButton}
          aria-label="Close assistant"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <h4>Welcome to the Docs Assistant</h4>
            <p>Ask me anything about Hestia Labs architecture, protocol, security, or operations.</p>
            <div className={styles.suggestedQuestions}>
              <button
                onClick={() =>
                  handleInputChange({
                    target: { value: 'What is the authority chain?' },
                  } as any)
                }
                className={styles.suggestion}
              >
                What is the authority chain?
              </button>
              <button
                onClick={() =>
                  handleInputChange({
                    target: { value: 'How does the Safety Service work?' },
                  } as any)
                }
                className={styles.suggestion}
              >
                How does the Safety Service work?
              </button>
              <button
                onClick={() =>
                  handleInputChange({
                    target: { value: 'Explain capability-based execution' },
                  } as any)
                }
                className={styles.suggestion}
              >
                Explain capability-based execution
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${styles[message.role]}`}
          >
            <div className={styles.content}>
              {typeof message.content === 'string' ? (
                <p>{message.content}</p>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={styles.message + ' ' + styles.assistant}>
            <div className={styles.content}>
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about the documentation..."
          className={styles.input}
          disabled={isLoading}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={styles.sendButton}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}
