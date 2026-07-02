/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Tab content crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white p-16 rounded-xl border border-slate-200 text-center flex flex-col items-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
          <h3 className="text-slate-600 font-bold text-sm">This section couldn't be displayed.</h3>
          <p className="text-slate-400 text-sm mt-2">Try switching tabs and coming back.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
