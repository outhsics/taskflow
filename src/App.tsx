import React, { Component, ReactNode } from 'react';
import { TaskList } from './components/TaskList';
import { CategorySidebar } from './components/CategorySidebar';
import { AddTaskForm } from './components/AddTaskForm';
import { AISuggestionBox } from './components/AISuggestionBox';
import { useOffline } from './hooks/useOffline';
import { useTheme } from './hooks/useTheme';
import './App.css';

// Error Boundary component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // Save form data to localStorage for recovery
    const componentStack = errorInfo.componentStack;
    try {
      localStorage.setItem('error_boundary_state', JSON.stringify({
        error: error.message,
        componentStack,
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed to save error state:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please refresh the page to try again.</p>
          {this.state.error && (
            <details style={{ marginTop: '20px' }}>
              <summary>Error details</summary>
              <pre>{this.state.error.toString()}</pre>
            </details>
          )}
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const isOffline = useOffline();
  const { theme } = useTheme();

  return (
    <div className={`app ${theme}`}>
      {isOffline && (
        <div className="offline-banner">
          You're offline. Some features may be limited.
        </div>
      )}

      <div className="app-container">
        <header className="app-header">
          <h1>TaskFlow</h1>
          <div className="header-actions">
            <button className="icon-button" title="Settings">
              ⚙️
            </button>
            <button className="icon-button" title="Export">
              📤
            </button>
          </div>
        </header>

        <div className="app-content">
          <CategorySidebar />

          <main className="main-content">
            <AISuggestionBox />
            <TaskList />
            <AddTaskForm />
          </main>
        </div>
      </div>
    </div>
  );
}

function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithBoundary;
