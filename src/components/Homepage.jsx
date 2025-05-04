import React, { useEffect } from 'react'

function Homepage({ userData, onShowBulletin, onShowSchedule, onShowAbsences, onLogout }) {
    const { relevé, auth } = userData;
    const { etudiant, formation, semestre, ues, ressources, saes } = relevé || {};

    // Animation d'entrée pour les éléments de la page
    useEffect(() => {
        const animatedElements = document.querySelectorAll('.animate-in');
        animatedElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('appear');
            }, 100 * index);
        });
    }, []);

    return (
        <div className="homepage-container">
            <header className="homepage-header animate-in">
                <div className="header-content">
                    <h1>
                        <span className="welcome-text">Bonjour,</span>
                        <span className="student-name">{etudiant?.nomprenom}</span>
                    </h1>
                    <p className="formation-name">{formation?.titre}</p>
                </div>
                <button 
                    className="logout-button" 
                    onClick={onLogout}
                    aria-label="Se déconnecter"
                >
                    <span className="button-icon">🚪</span>
                    Déconnexion
                </button>
            </header>

            <div className="homepage-body">
                <section className="user-card animate-in">
                    <div className="user-card-header">
                        <div className="user-avatar">
                            {etudiant?.nomprenom?.charAt(0) || '?'}
                        </div>
                        <div className="user-meta">
                            <h2>{etudiant?.nomprenom}</h2>
                            <span className="user-id">N° {etudiant?.code_nip}</span>
                        </div>
                    </div>
                    
                    <div className="user-details">
                        <div className="detail-item">
                            <span className="detail-label">Formation</span>
                            <span className="detail-value">{formation?.titre_officiel}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Semestre actuel</span>
                            <span className="detail-value semestre-badge">{semestre?.numero}</span>
                            <span className="detail-info">{semestre?.annee_universitaire}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Groupe</span>
                            <span className="detail-value">{formation?.acronyme || 'Non défini'}</span>
                        </div>
                    </div>
                </section>

                <section className="quick-actions animate-in">
                    <h2>Mes services</h2>
                    <div className="actions-grid">
                        <div className="action-card" onClick={onShowBulletin}>
                            <div className="action-icon bulletin-icon">📊</div>
                            <div className="action-content">
                                <h3>Bulletin</h3>
                                <p>Consultez vos notes et résultats</p>
                            </div>
                        </div>
                        
                        {userData.relevé.formation.acronyme && (
                            <div className="action-card" onClick={onShowSchedule}>
                                <div className="action-icon schedule-icon">📅</div>
                                <div className="action-content">
                                    <h3>Emploi du temps</h3>
                                    <p>Accédez à votre planning de cours</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="action-card" onClick={onShowAbsences}>
                            <div className="action-icon absence-icon">📋</div>
                            <div className="action-content">
                                <h3>Absences</h3>
                                <p>Suivez vos absences et justificatifs</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="semester-info animate-in">
                    <h2>Semestre {semestre?.numero} - {semestre?.annee_universitaire}</h2>
                    <div className="progress-container">
                        <div className="progress-stats">
                            <div className="stat-item">
                                <span className="stat-value">{ues?.length || 0}</span>
                                <span className="stat-label">UE</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{ressources?.length || 0}</span>
                                <span className="stat-label">Ressources</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{saes?.length || 0}</span>
                                <span className="stat-label">SAÉ</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            <footer className="homepage-footer animate-in">
                <p>&copy; {new Date().getFullYear()} - Université de Versailles Saint-Quentin-en-Yvelines</p>
            </footer>
        </div>
    )
}

export default Homepage
