import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary gefangen:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Hier könnte man Fehler an Logging-Service senden
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom Fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Standard Fallback
      return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="mb-6">
              <AlertTriangle size={64} className="text-red-500 mx-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Oops! Etwas ist schiefgelaufen
            </h2>
            
            <p className="text-white/60 mb-6">
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-red-400/60 text-xs mt-2 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            
            <button
              onClick={this.handleReset}
              className="bg-seeblick text-white font-semibold py-3 px-8 rounded-button shadow-button hover:bg-seeblick-dark transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={20} />
              Neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
