import React, { useState } from 'react';
import { mockTranslations } from '../data/mockData';

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const TranslatorWidget: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const handleTranslate = () => {
    // Simulate pinging backend that hits Gemini
    if (!inputText.trim()) return;

    // A very basic "mock" matching logic that checks if the input is close to our mock dict
    let formalized = "Please formulate your thought more clearly so I may address it formally."; // default fallback
    
    // exact match for the demo
    const lowerInput = inputText.toLowerCase().trim();
    if (mockTranslations[lowerInput]) {
      formalized = mockTranslations[lowerInput];
    } else {
      // Fake delay and generated response
      formalized = `Thank you for reaching out. Upon reviewing "${inputText}", we can certainly discuss this further.`;
    }

    setOutputText("Translating...");
    setTimeout(() => {
      setOutputText(formalized);
    }, 600); // 600ms fake network delay
  };

  return (
    <div className="translator-widget animate-in delay-3">
      <div className="translator-title">
        <MessageIcon /> Business Translator
      </div>
      <textarea 
        className="translator-input"
        placeholder="Type informal text here... (e.g. 'haiiii')"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button className="translator-btn" onClick={handleTranslate}>
        Translate
      </button>
      
      {outputText && (
        <div className="translator-output">
          {outputText}
        </div>
      )}
    </div>
  );
};

export default TranslatorWidget;
