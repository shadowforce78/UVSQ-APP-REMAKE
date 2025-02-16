import React from 'react'

function Homepage({ userData, onShowBulletin, onShowSchedule, onShowAbsences }) {
    const { relevé, auth } = userData;
    const { etudiant, formation, semestre, ues, ressources, saes } = relevé || {};

    return (
        <div className="homepage">
            <h1>Bienvenue sur votre espace étudiant - {formation?.titre}</h1>

            <div className="user-info">
                <h2>Informations personnelles</h2>
                <p>
                    <span>Numéro étudiant</span>
                    <span>{etudiant?.code_nip}</span>
                </p>
                <p>
                    <span>Nom complet</span>
                    <span>{etudiant?.nomprenom}</span>
                </p>
                <p>
                    <span>Formation</span>
                    <span>{formation?.titre_officiel}</span>
                </p>
                <p>
                    <span>Semestre</span>
                    <span>{semestre?.numero} ({semestre?.annee_universitaire})</span>
                </p>
            </div>

            <div className="action-buttons">
                <button 
                    className="primary-button" 
                    onClick={onShowBulletin}
                >
                    <span className="button-icon">📊</span>
                    Consulter mon bulletin
                </button>
                {userData.relevé.formation.acronyme && (
                    <button 
                        className="primary-button schedule-button" 
                        onClick={onShowSchedule}
                    >
                        <span className="button-icon">📅</span>
                        Emploi du temps
                    </button>
                )}
                <button 
                    className="primary-button absence-button" 
                    onClick={onShowAbsences}
                >
                    <span className="button-icon">📋</span>
                    Absences
                </button>
            </div>
        </div>
    )
}

export default Homepage
