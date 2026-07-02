/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import { callGemini } from './useGeminiClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  text: "Welcome to Ultovate. I've finished scanning the 6 uploaded documents for the Bellevue property. There are a few critical liability risks regarding the reserve study and pet restrictions. How can I help you today?",
};

export const useForensicChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const requestIdRef = useRef(0);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const text = userInput;
    setUserInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    const requestId = ++requestIdRef.current;
    try {
      const response = await callGemini(
        `User Question: ${text}\n\nProperty Context: 10398 NE 17th St., #302, Bellevue WA. Findings: 12-year-old reserve study (Major Risk), 40lb dog limit, STRs prohibited. WUCIOA Score: 9/26.`,
        'You are an expert real estate forensic auditor. Be direct, professional, and highlight financial or legal liability for the buyer.',
      );
      if (requestId !== requestIdRef.current) return;
      setChatMessages((prev) => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'My analysis engine is currently busy. Please try again in a moment.' },
      ]);
    } finally {
      if (requestId === requestIdRef.current) setIsTyping(false);
    }
  };

  return { chatMessages, userInput, setUserInput, isTyping, handleSendMessage };
};
