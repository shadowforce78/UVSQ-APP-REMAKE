import React, { useState } from 'react'

function SchedulePage({ schedule, onBack, onRefresh, loading, error }) {
    // État initial avec les dates par défaut
    const getDefaultDates = () => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        return {
            start: monday.toISOString().split('T')[0],
            end: friday.toISOString().split('T')[0]
        };
    };

    const { start: defaultStart, end: defaultEnd } = getDefaultDates();
    const [selectedClass, setSelectedClass] = useState('INF1-B1')
    const [startDate, setStartDate] = useState(defaultStart)
    const [endDate, setEndDate] = useState(defaultEnd)

    const handleNextWeek = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        onRefresh(selectedClass, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    };

    const handlePrevWeek = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() - 7);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        onRefresh(selectedClass, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    };

    const classes = [
            // Info
            "INF1-A1",
            "INF1-A2",
            "INF1-B1",
            "INF1-B2",
            "INF1-C1",
            "INF1-C2",
            "INF2-FA",
            "INF2-FI-A",
            "INF2-FI-B",
            "INF3-FA-A",
            "INF3-FA-B",
            "INF3-FI",
            // MMI
            "MMI1-A1",
            "MMI1-A2",
            "MMI1-B1",
            "MMI1-B2",
            "MMI2-A1",
            "MMI2-A2",
            "MMI2-B1",
            "MMI2-B2",
            // RT
            "RT1-FA",
            "RT1-FI-A1",
            "RT1-FI-A2",
            "RT1-FI-B1",
            "RT1-FI-B2",
            // GEII
            "GEII1-TDA1",
            "GEII1-TDA2",
            "GEII1-TDB1",
            "GEII1-TDB2",
            "GEII1-TDC",
            "GEII1-TP1",
            "GEII1-TP2",
            "GEII1-TP3",
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        onRefresh(selectedClass, startDate, endDate)
    }

    // Grouper les événements par jour
    const groupByDay = (events) => {
        if (!events || !Array.isArray(events)) return {};
        return events.reduce((acc, event) => {
            const date = event.Heure.split(' ')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {});
    };

    // Formater l'heure
    const formatTime = (dateTime) => {
        return dateTime.split(' ')[1];
    };

    // Obtenir le type de cours pour le style
    const getEventTypeClass = (category) => {
        if (category.includes('CM')) return 'cm';
        if (category.includes('TD')) return 'td';
        if (category.includes('autonomie')) return 'autonomie';
        if (category.includes('DS')) return 'ds';
        return '';
    };

    return (
        <div className="schedule-page">
            <button className="back-button" onClick={onBack}>← Retour</button>
            <h1>Emploi du temps</h1>

            <form className="schedule-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>
                        Formation :
                        <select 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            {classes.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>
                            Du :
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Au :
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                            />
                        </label>
                    </div>
                </div>

                <div className="week-navigation">
                    <button type="button" className="nav-button prev" onClick={handlePrevWeek}>
                        ← Semaine précédente
                    </button>
                    <button type="submit" className="primary-button">
                        Actualiser
                    </button>
                    <button type="button" className="nav-button next" onClick={handleNextWeek}>
                        Semaine suivante →
                    </button>
                </div>
            </form>

            {error && (
                <div className="error-message">
                    {error}
                    <p className="error-hint">
                        Essayez de sélectionner une autre classe ou période
                    </p>
                </div>
            )}

            {loading ? (
                <div className="loading-message">
                    Chargement de l'emploi du temps...
                </div>
            ) : schedule && Array.isArray(schedule) && schedule.length > 0 ? (
                Object.entries(groupByDay(schedule)).map(([date, events]) => (
                    <div key={date} className="schedule-day">
                        <h2>{new Date(date.split('/').reverse().join('-')).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}</h2>

                        <div className="schedule-events">
                            {events
                                .sort((a, b) => a.Heure.localeCompare(b.Heure))
                                .map((event, index) => (
                                    <div 
                                        key={index} 
                                        className={`schedule-event ${getEventTypeClass(event["Catégorie d'événement"])}`}
                                    >
                                        <div className="event-time">
                                            {formatTime(event.Heure)}
                                        </div>
                                        <div className="event-details">
                                            <div className="event-header">
                                                <span className="event-subject">{event.Matière}</span>
                                                <span className="event-type">{event["Catégorie d'événement"]}</span>
                                            </div>
                                            <div className="event-info">
                                                {event.Personnel && (
                                                    <span className="event-teacher">
                                                        👤 {event.Personnel}
                                                    </span>
                                                )}
                                                <span className="event-location">
                                                    🏢 {event.Salle}
                                                </span>
                                                <span className="event-group">
                                                    👥 {event.Groupe}
                                                </span>
                                            </div>
                                            {event.Remarques && (
                                                <div className="event-notes">
                                                    📝 {event.Remarques}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : !error && (
                <div className="no-schedule">
                    Aucun cours programmé pour cette période
                </div>
            )}
        </div>
    )
}

export default SchedulePage
