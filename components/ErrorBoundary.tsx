import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In a real app, you would send this to your error reporting service
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
      );
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset error boundary when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, send to crash reporting service like Crashlytics, Sentry, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      userAgent: 'React Native App',
    };

    console.log('Error Report:', errorReport);
    // Example: crashlytics().recordError(error);
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleGoHome = () => {
    this.resetErrorBoundary();
    // In a real app, you might navigate to home screen
    // navigation.navigate('Home');
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#FF3B30" />
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.errorContainer}>
              <BlurView intensity={80} tint="dark" style={styles.errorCard}>
                <View style={styles.iconContainer}>
                  <AlertTriangle size={60} color="#FF3B30" />
                </View>

                <Text style={styles.title}>Oops! Something went wrong</Text>
                <Text style={styles.subtitle}>
                  We're sorry, but something unexpected happened. Don't worry, your data is safe.
                </Text>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={styles.primaryButton} onPress={this.handleRetry}>
                    <RefreshCw size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Try Again</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={this.handleGoHome}>
                    <Home size={20} color="#007AFF" />
                    <Text style={styles.secondaryButtonText}>Go to Home</Text>
                  </TouchableOpacity>
                </View>

                {this.props.showErrorDetails && (
                  <View style={styles.detailsContainer}>
                    <TouchableOpacity style={styles.detailsToggle} onPress={this.toggleDetails}>
                      <Bug size={16} color="#666" />
                      <Text style={styles.detailsToggleText}>
                        {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                      </Text>
                      {this.state.showDetails ? (
                        <ChevronUp size={16} color="#666" />
                      ) : (
                        <ChevronDown size={16} color="#666" />
                      )}
                    </TouchableOpacity>

                    {this.state.showDetails && (
                      <View style={styles.errorDetails}>
                        <Text style={styles.errorId}>Error ID: {this.state.errorId}</Text>
                        
                        {this.state.error && (
                          <View style={styles.errorSection}>
                            <Text style={styles.errorSectionTitle}>Error Message:</Text>
                            <Text style={styles.errorText}>{this.state.error.message}</Text>
                          </View>
                        )}

                        {this.state.error?.stack && (
                          <View style={styles.errorSection}>
                            <Text style={styles.errorSectionTitle}>Stack Trace:</Text>
                            <ScrollView style={styles.stackContainer} horizontal>
                              <Text style={styles.stackText}>{this.state.error.stack}</Text>
                            </ScrollView>
                          </View>
                        )}

                        {this.state.errorInfo?.componentStack && (
                          <View style={styles.errorSection}>
                            <Text style={styles.errorSectionTitle}>Component Stack:</Text>
                            <ScrollView style={styles.stackContainer} horizontal>
                              <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.supportText}>
                  If this problem persists, please contact support with Error ID: {this.state.errorId}
                </Text>
              </BlurView>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  errorCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  actionsContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    marginTop: 10,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  detailsToggleText: {
    color: '#666',
    fontSize: 14,
  },
  errorDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  errorId: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 15,
  },
  errorSection: {
    marginBottom: 15,
  },
  errorSectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  stackContainer: {
    maxHeight: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    padding: 8,
  },
  stackText: {
    color: '#ccc',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  supportText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});