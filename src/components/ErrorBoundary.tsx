import React, { ReactNode, ReactElement } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-md w-full">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                مشکلی پیش آمد!
              </h1>
              <p className="text-gray-600 text-center mb-4">
                متاسفانه یک خطا رخ داده است. لطفاً صفحه را دوباره بارگذاری کنید.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 p-3 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-semibold">جزئیات خطا</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-48">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <Button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                برگشت به صفحه اصلی
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
