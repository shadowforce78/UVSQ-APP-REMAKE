import React, { useState } from 'react'
import EvaluationsView from './EvaluationsView'

function BulletinPage({ userData, onBack }) {
    const [selectedResource, setSelectedResource] = useState(null)
    const { relevé } = userData;
    const { formation, semestre, ues, ressources, saes } = relevé || {};

    const handleResourceClick = (resourceId) => {
        setSelectedResource(selectedResource === resourceId ? null : resourceId)
    }

    return (
        <div className="bulletin-page">
            <button className="back-button" onClick={onBack}>
                ← Retour
            </button>

            <h1>Bulletin de notes - {formation?.titre}</h1>
            {/* <h2>{semestre?.situation}</h2> */}
            <div className="bulletin">
                {Object.entries(ues || {}).map(([ueId, ue]) => (
                    <div key={ueId} className="ue-card" style={{ borderColor: ue.color }}>
                        <h3 style={{ color: ue.color }}>{ue.titre}</h3>
                        <p className="ue-moyenne">
                            Moyenne : <strong>{ue.moyenne.value}</strong>
                            {ue.moyenne.rang && <span className="rang">Rang : {ue.moyenne.rang}/{ue.moyenne.total}</span>}
                        </p>

                        <div className="modules">
                            <h4>Ressources</h4>
                            {Object.entries(ue.ressources || {}).map(([resId, res]) => (
                                <div key={resId}>
                                    <div
                                        className={`module-item ${selectedResource === resId ? 'selected' : ''}`}
                                        onClick={() => handleResourceClick(resId)}
                                    >
                                        <span>{ressources[resId]?.titre}</span>
                                        <span>Coef. {res.coef}</span>
                                        <strong>{res.moyenne}</strong>
                                    </div>
                                    {selectedResource === resId && (
                                        <EvaluationsView ressource={ressources[resId]} />
                                    )}
                                </div>
                            ))}

                            <h4>SAEs</h4>
                            {Object.entries(ue.saes || {}).map(([saeId, sae]) => (
                                <div key={saeId} className="module-item">
                                    <span>{saes[saeId]?.titre}</span>
                                    <span>Coef. {sae.coef}</span>
                                    <strong>{sae.moyenne}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BulletinPage
