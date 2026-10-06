import './LoadingState.css';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default LoadingState;