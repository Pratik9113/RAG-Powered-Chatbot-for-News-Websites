function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClasses = {
    small: 'spinner--small',
    medium: 'spinner--medium',
    large: 'spinner--large'
  }

  return (
    <div className={`loading-spinner ${sizeClasses[size]}`}>
      <div className="spinner"></div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  )
}

export default LoadingSpinner
