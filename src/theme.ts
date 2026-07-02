/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext } from 'react';

export interface Theme {
  brand: string;
  darkHeader: string;
  heroBg: string;
  pageBg: string;
  textMain: string;
  textMuted: string;
  success: string;
  danger: string;
  warning: string;
  border: string;
}

export const theme: Theme = {
  brand: '#9333EA',
  darkHeader: '#1F1224',
  heroBg: '#2D1B33',
  pageBg: '#F8F9FB',
  textMain: '#1E293B',
  textMuted: '#64748B',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  border: '#E2E8F0',
};

export const ThemeContext = createContext<Theme>(theme);

export const useTheme = (): Theme => useContext(ThemeContext);
