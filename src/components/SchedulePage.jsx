import React, { useState, useEffect } from 'react'

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
    // Utiliser localStorage pour initialiser la classe
    const [selectedClass, setSelectedClass] = useState(() => {
        return localStorage.getItem('selectedClass') || 'INF1-B1'
    })
    const [startDate, setStartDate] = useState(defaultStart)
    const [endDate, setEndDate] = useState(defaultEnd)

    // Sauvegarder la classe sélectionnée dans localStorage
    useEffect(() => {
        localStorage.setItem('selectedClass', selectedClass)
    }, [selectedClass])

    // Charger l'EDT au montage du composant
    useEffect(() => {
        onRefresh(selectedClass, startDate, endDate)
    }, []) // Se déclenche uniquement au montage

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

    // Fonction utilitaire pour convertir les dates
    const formatDateForDisplay = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // Fonction pour obtenir le jour de la semaine d'une date
    const getDayOfWeek = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return days[date.getDay()];
    };

    // Grouper les événements par jour
    const groupByDay = (events) => {
        if (!events || !Array.isArray(events)) return {};
        return events.reduce((acc, event) => {
            // Extraction de la date de l'attribut Date au lieu de Heure
            const date = event.Date;
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
        if (!category) return '';
        
        category = category.toLowerCase();
        
        if (category.includes('cm') || category.includes('cours magistral')) return 'cm';
        if (category.includes('td') || category.includes('dirigé')) return 'td';
        if (category.includes('tp') || category.includes('pratique')) return 'tp';
        if (category.includes('ds') || category.includes('contrôle') || category.includes('cc')) return 'ds';
        if (category.includes('autonomie')) return 'autonomie';
        
        return '';
    };

    // État pour la vue mobile
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Détecter le changement de taille d'écran
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Navigation entre les jours en mode mobile
    const navigateDay = (direction) => {
        const days = Object.keys(groupByDay(schedule)).sort();
        let newIndex = currentDayIndex + direction;
        
        if (newIndex < 0) newIndex = days.length - 1;
        if (newIndex >= days.length) newIndex = 0;
        
        setCurrentDayIndex(newIndex);
    };

    // Formater la date pour l'affichage
    const formatDisplayDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    // Vérifier si une date est aujourd'hui
    const isToday = (dateStr) => {
        const today = new Date();
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        return date.toDateString() === today.toDateString();
    };

    // Créneaux horaires fixes
    const timeSlots = [
        "08:00-09:30",
        "09:45-11:15",
        "11:30-13:00",
        "13:15-14:45",
        "15:00-16:30",
        "16:45-18:15",
        "18:30-20:00"
    ];

    const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

    const renderGrid = () => {
        if (!schedule || !Array.isArray(schedule)) return null;

        const groupedEvents = groupByDay(schedule);
        console.log('Événements groupés:', groupedEvents); // Pour le débogage

        // Récupérer les dates de la semaine à partir des événements
        const dates = Object.keys(groupedEvents).sort();
        
        return (
            <div className="schedule-grid-container">
                <div className="schedule-grid">
                    <div className="grid-header">Horaire</div>
                    {dates.map(date => (
                        <div key={date} className={`grid-header ${isToday(date) ? 'today' : ''}`}>
                            {getDayOfWeek(date)}<br />
                            {formatDateForDisplay(date)}
                        </div>
                    ))}

                    {timeSlots.map(timeSlot => (
                        <React.Fragment key={timeSlot}>
                            <div className="time-slot">{timeSlot}</div>
                            {dates.map(date => {
                                const dayEvents = groupedEvents[date] || [];
                                const event = dayEvents.find(e => e.HeureDebut === timeSlot.split('-')[0]);

                                return (
                                    <div key={`${date}-${timeSlot}`} className="grid-cell">
                                        {event && (
                                            <div className={`course-card ${getEventTypeClass(event.Type)}`}>
                                                <div className="course-title">{event.Matiere}</div>
                                                <div className="course-type">{event.Type}</div>
                                                {event.Prof && (
                                                    <div className="course-details">{event.Prof}</div>
                                                )}
                                                {event.Salle && (
                                                    <div className="course-location">{event.Salle}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="schedule-page">
            <header className="schedule-header">
                <div className="schedule-header-content">
                    <div className="schedule-header-top">
                        <div className="schedule-title">
                            <button className="back-button" onClick={onBack}>
                                ←
                            </button>
                            <h1>Emploi du temps</h1>
                        </div>
                    </div>

                    <form className="schedule-controls" onSubmit={handleSubmit}>
                        <div className="control-group">
                            <label>Formation</label>
                            <select 
                                value={selectedClass} 
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {classes.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label>Date de début</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="control-group">
                            <label>Date de fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                            />
                        </div>

                        <div className="schedule-navigation">
                            <button type="button" className="nav-button" onClick={handlePrevWeek}>
                                ← Semaine précédente
                            </button>
                            <button type="submit" className="refresh-button">
                                Actualiser
                            </button>
                            <button type="button" className="nav-button" onClick={handleNextWeek}>
                                Semaine suivante →
                            </button>
                        </div>
                    </form>
                </div>
            </header>

            {error && (
                <div className="error-message">
                    {error}
                    <p className="error-hint">
                        Essayez de sélectionner une autre classe ou période
                    </p>
                </div>
            )}

            <div className="schedule-container">
                {loading ? (
                    <div className="loading-message">
                        Chargement de l'emploi du temps...
                    </div>
                ) : schedule && Array.isArray(schedule) && schedule.length > 0 ? (
                    renderGrid()
                ) : !error && (
                    <div className="no-schedule">
                        Aucun cours programmé pour cette période
                    </div>
                )}
            </div>
        </div>
    );
}

export default SchedulePage;
