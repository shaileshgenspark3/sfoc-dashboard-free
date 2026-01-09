import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="industrial-panel p-8 border-l-4 border-l-[#FF6B35] max-w-lg w-full">
            <h2 className="text-2xl font-black text-white mb-4 uppercase italic">SYSTEM_CRITICAL_FAILURE</h2>
            <div className="bg-black/50 p-4 border border-[#2D2D2D] mb-6">
              <p className="text-red-500 font-mono text-xs overflow-auto">
                {this.state.error?.toString()}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="btn-safety w-full py-3 text-sm font-bold"
            >
              RESTART_SYSTEM_LINK
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
