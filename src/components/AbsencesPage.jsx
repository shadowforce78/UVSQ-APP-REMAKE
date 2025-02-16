import React from 'react'

function AbsencesPage({ userData, onBack }) {
    const { absences, relevé } = userData;
    const sortedDates = Object.keys(absences).sort();

    // Calcul des absences réelles (non justifiées)
    const calculateAbsences = () => {
        let total = 0;
        Object.values(absences).forEach(day => {
            day.forEach(session => {
                if (session.statut === "absent" && !session.justifie) {
                    const duration = session.fin - session.debut;
                    total += duration;
                }
            });
        });
        return (total / 2).toFixed(1);
    };

    // Filtre pour n'afficher que les jours avec des absences non justifiées
    const hasUnexcusedAbsence = (date) => {
        return absences[date].some(session =>
            session.statut === "absent" && !session.justifie
        );
    };

    // Filtre des dates avec des absences non justifiées
    const relevantDates = sortedDates.filter(hasUnexcusedAbsence);

    return (
        <div className="absences-page">
            <button className="back-button" onClick={onBack}>
                ← Retour
            </button>

            <h1>Suivi des Absences Non Justifiées</h1>

            <div className="absences-summary">
                <div className="summary-item warning">
                    <span>Total absences non justifiées</span>
                    <strong>{calculateAbsences()} demi-journées</strong>
                </div>
                <div className="summary-item info">
                    <span>Rappel</span>
                    <p>{userData.config.message_rapport_absences}</p>
                </div>
            </div>

            {relevantDates.length === 0 ? (
                <div className="no-absences">
                    Aucune absence non justifiée à signaler
                </div>
            ) : (
                <div className="absences-container">
                    {relevantDates.map(date => (
                        <div key={date} className="day-card">
                            <h2>{new Date(date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</h2>
                            <div className="sessions-list">
                                {absences[date]
                                    .filter(session => session.statut === "absent" && !session.justifie)
                                    .map((session, index) => (
                                        <div key={index} className="session-item absent">
                                            <div className="session-time">
                                                {session.debut}h - {session.fin}h
                                                <span className="duration">
                                                    ({session.fin - session.debut}h)
                                                </span>
                                            </div>
                                            <div className="session-info">

                                                <span className="teacher-name">
                                                    {session.enseignant}
                                                </span>
                                            </div>
                                            <div className="session-status warning">
                                                ❌ Absence non justifiée
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AbsencesPage
