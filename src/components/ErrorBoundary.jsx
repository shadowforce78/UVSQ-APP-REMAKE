import React from 'react';

const ErrorBoundary = ({ children, error, onRetry }) => {
    if (error) {
        return (
            <div className="error-boundary">
                <div className="error-content">
                    <div className="error-icon">⚠️</div>
                    <h3>Oups ! Une erreur est survenue</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        {onRetry && (
                            <button className="retry-button" onClick={onRetry}>
                                🔄 Réessayer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ErrorBoundary;