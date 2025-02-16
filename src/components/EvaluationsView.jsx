import React from 'react'

function EvaluationsView({ ressource }) {
    if (!ressource.evaluations || ressource.evaluations.length === 0) {
        return (
            <div className="no-evaluations">
                Aucune évaluation disponible
            </div>
        )
    }

    return (
        <div className="evaluations-list">
            {ressource.evaluations.map((evaluation, index) => (
                <div key={index} className="evaluation-card">
                    <div className="evaluation-header">
                        <h4>{evaluation.description || "Évaluation"}</h4>
                        <span className="evaluation-date">
                            {new Date(evaluation.date).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="evaluation-details">
                        <div className="note-section">
                            <div className="note-value">
                                <span>Note :</span> 
                                <strong>{evaluation.note.value}/20</strong>
                            </div>
                            <div className="note-stats">
                                <span>Min: {evaluation.note.min}</span>
                                <span>Moy: {evaluation.note.moy}</span>
                                <span>Max: {evaluation.note.max}</span>
                            </div>
                        </div>
                        <div className="coef-info">
                            Coefficient : {evaluation.coef}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default EvaluationsView
