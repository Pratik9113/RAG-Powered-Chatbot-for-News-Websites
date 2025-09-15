import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>🚨 Something went wrong</h2>
            <p>An error occurred while rendering this component.</p>
            <details>
              <summary>Error details</summary>
              <pre>{this.state.error?.toString()}</pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
