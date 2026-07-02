/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import { FindingId } from '../domain';
import { callGemini } from './useGeminiClient';

export const useAiInsight = () => {
  const [aiInsight, setAiInsight] = useState<Partial<Record<FindingId, string>>>({});
  const [explainingIds, setExplainingIds] = useState<Set<FindingId>>(new Set());
  const requestIdsRef = useRef<Partial<Record<FindingId, number>>>({});

  const generateAiInsight = async (id: FindingId, title: string, context: string) => {
    const requestId = (requestIdsRef.current[id] ?? 0) + 1;
    requestIdsRef.current[id] = requestId;
    setExplainingIds((prev) => new Set(prev).add(id));

    const isStale = () => requestIdsRef.current[id] !== requestId;

    try {
      const response = await callGemini(
        `Explain the risk of "${title}": ${context}. How does this impact a buyer's resale value or daily life? What is the specific 'forensic' red flag here?`,
        'Provide a high-impact, professional analysis using 2-3 concise bullet points. Focus on risk mitigation.',
      );
      if (isStale()) return;
      setAiInsight((prev) => ({ ...prev, [id]: response }));
    } catch (err) {
      if (isStale()) return;
      setAiInsight((prev) => ({ ...prev, [id]: 'Unable to generate insight at this time.' }));
    } finally {
      if (!isStale()) {
        setExplainingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  return { aiInsight, explainingIds, generateAiInsight };
};
