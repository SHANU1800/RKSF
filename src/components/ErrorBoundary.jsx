import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
          <div className="glass-panel rounded-2xl border border-red-500/30 p-8 max-w-lg mx-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-400 text-sm">
                An unexpected error occurred. Please refresh the page to continue.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-black/30 rounded-lg border border-red-500/20">
                <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] text-black font-bold transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all border border-[#00f0ff]/30"
              >
                Clear & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
