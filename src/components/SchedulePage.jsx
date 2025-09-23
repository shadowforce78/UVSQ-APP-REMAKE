import React, { useState, useEffect } from 'react'
import ICAL from 'ical.js'
import ErrorBoundary from './ErrorBoundary'

// Import du fichier JSON avec les liens
const linksData = {
    "INF1-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-NM2ABGDV5957/schedule.ics",
    "INF1-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-CU2JFTWC5958/schedule.ics",
    "INF1-B1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-DU2XQKER5960/schedule.ics",
    "INF1-B2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-VW2KSGLE5961/schedule.ics",
    "INF1-C1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-LD2VKATP5963/schedule.ics",
    "INF1-C2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-BG2EPJUY5964/schedule.ics",
    "INF2-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-QY2TXVVR5966/schedule.ics",
    "INF2-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-AJ2PMMSQ5967/schedule.ics",
    "INF2-B1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-CH2ALWCJ5968/schedule.ics",
    "INF2-B2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-NJ2HYPWU5969/schedule.ics",
    "INF2-FA": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-EP2CETAY5970/schedule.ics",
    "INF2-FI-A": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-FF2LEQYM5972/schedule.ics",
    "INF2-FI-B": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-SN2PGVBC5973/schedule.ics",
    "INF3-FA-A": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-KM2BSDSE5975/schedule.ics",
    "INF3-FA-B": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-FD2MLGKS5976/schedule.ics",
    "INF3-FI-A": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-LU2GUCAK5978/schedule.ics",
    "INF3-FI-B": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-JQ2EKUUB5979/schedule.ics",
    "MMI1-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-QJ2DMFYC5987/schedule.ics",
    "MMI1-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-PW2GUKMM5988/schedule.ics",
    "MMI1-B1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-HN2CHYNX5990/schedule.ics",
    "MMI1-B2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-QW2SJTJH5991/schedule.ics",
    "MMI2-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-QS2QEJVB5994/schedule.ics",
    "MMI2-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-EG2LDXAM5995/schedule.ics",
    "MMI2-B1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-AE2BGJHX5997/schedule.ics",
    "MMI2-B2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-TM2VJCBU5998/schedule.ics",
    "MMI3_GR1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-VC2XWEYV19912/schedule.ics",
    "MMI3_GR2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-CY2PNYVB19913/schedule.ics",
    "MMI3-FA-CN-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-CC2LTGMX6000/schedule.ics",
    "MMI3-FA-CN-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-HW2LKCBM6001/schedule.ics",
    "MMI3-FA-DW-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-TS2PGRAD6003/schedule.ics",
    "MMI3-FA-DW-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-KL2GMWYW6004/schedule.ics",
    "MMI3-FI-CN-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-EB2URAPF6006/schedule.ics",
    "MMI3-FI-CN-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-JP2NSAYC6007/schedule.ics"
}

function SchedulePage({ onBack }) {
    const [selectedClass, setSelectedClass] = useState('')
    const [scheduleData, setScheduleData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [currentWeek, setCurrentWeek] = useState(new Date())
    const [isTestData, setIsTestData] = useState(false)

    // Fonction pour obtenir les jours de la semaine
    const getWeekDays = (date) => {
        const start = new Date(date)
        const day = start.getDay()
        const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Ajuste pour commencer le lundi
        start.setDate(diff)
        
        const days = []
        for (let i = 0; i < 7; i++) {
            const day = new Date(start)
            day.setDate(start.getDate() + i)
            days.push(day)
        }
        return days
    }

    // Fonction pour formater la date
    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    // Fonction pour formater l'heure
    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Fonction pour parser le fichier ICS
    const parseICS = async (url) => {
        const proxies = [
            // Essai direct d'abord
            { url: url, name: 'direct' },
            // Proxies alternatifs
            { url: `https://corsproxy.io/?${encodeURIComponent(url)}`, name: 'corsproxy.io' },
            { url: `https://cors-anywhere.herokuapp.com/${url}`, name: 'cors-anywhere' },
            { url: `https://thingproxy.freeboard.io/fetch/${url}`, name: 'thingproxy' }
        ];

        let lastError;
        
        for (const proxy of proxies) {
            try {
                console.log(`Tentative avec ${proxy.name}:`, proxy.url);
                
                const response = await fetch(proxy.url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/calendar,text/plain,*/*',
                        ...(proxy.name === 'direct' ? {} : { 'X-Requested-With': 'XMLHttpRequest' })
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                let icsText = await response.text();
                
                // Nettoyage du texte si nécessaire
                if (icsText.includes('<!DOCTYPE') || icsText.includes('<html')) {
                    throw new Error('Réponse HTML au lieu d\'ICS');
                }
                
                console.log(`Succès avec ${proxy.name}`);
                
                const jcalData = ICAL.parse(icsText);
                const vcalendar = new ICAL.Component(jcalData);
                const events = vcalendar.getAllSubcomponents('vevent');
                
                return events.map(event => {
                    const summary = event.getFirstPropertyValue('summary') || 'Cours'
                    const location = event.getFirstPropertyValue('location') || ''
                    const description = event.getFirstPropertyValue('description') || ''
                    const dtstart = event.getFirstPropertyValue('dtstart')
                    const dtend = event.getFirstPropertyValue('dtend')
                    
                    return {
                        title: summary,
                        location: location,
                        description: description,
                        start: dtstart.toJSDate(),
                        end: dtend.toJSDate()
                    }
                });
                
            } catch (error) {
                console.warn(`Échec avec ${proxy.name}:`, error.message);
                lastError = error;
                
                // Attendre un peu avant le proxy suivant
                if (proxy !== proxies[proxies.length - 1]) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        throw new Error(`Impossible de charger l'emploi du temps après ${proxies.length} tentatives. Dernière erreur: ${lastError?.message}`);
    }

    // Fonction pour générer des données de test en cas d'échec
    const generateTestData = (className) => {
        const today = new Date()
        const events = []
        
        // Générer quelques événements de test pour les 7 prochains jours
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            
            // Éviter le week-end
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                // Cours du matin
                const morning = new Date(date)
                morning.setHours(8, 30, 0, 0)
                const morningEnd = new Date(morning)
                morningEnd.setHours(10, 0, 0, 0)
                
                events.push({
                    title: `Cours ${className} - Matin`,
                    location: `Salle ${100 + i}`,
                    description: `Cours de test pour ${className}`,
                    start: morning,
                    end: morningEnd
                })
                
                // Cours de l'après-midi
                const afternoon = new Date(date)
                afternoon.setHours(14, 0, 0, 0)
                const afternoonEnd = new Date(afternoon)
                afternoonEnd.setHours(15, 30, 0, 0)
                
                events.push({
                    title: `TP ${className} - Après-midi`,
                    location: `Labo ${200 + i}`,
                    description: `TP de test pour ${className}`,
                    start: afternoon,
                    end: afternoonEnd
                })
            }
        }
        
        return events
    }

    // Charger l'emploi du temps pour une classe
    const loadSchedule = async (className) => {
        if (!className || !linksData[className]) return
        
        setLoading(true)
        setError('')
        setIsTestData(false)
        
        try {
            const events = await parseICS(linksData[className])
            setScheduleData(events)
            setIsTestData(false)
        } catch (err) {
            console.error('Toutes les tentatives ont échoué, utilisation de données de test:', err)
            
            // En cas d'échec complet, proposer des données de test
            setError(`⚠️ Connexion impossible aux serveurs de l'IUT. Affichage de données de démonstration.`)
            
            // Données de test après un délai pour simuler le chargement
            setTimeout(() => {
                const testEvents = generateTestData(className)
                setScheduleData(testEvents)
                setIsTestData(true)
                setError('') // Enlever l'erreur une fois les données de test chargées
            }, 1000)
        } finally {
            setLoading(false)
        }
    }

    // Charger l'emploi du temps quand une classe est sélectionnée
    useEffect(() => {
        if (selectedClass) {
            loadSchedule(selectedClass)
        }
    }, [selectedClass])

    // Filtrer les événements pour la semaine courante
    const getWeekEvents = () => {
        const weekDays = getWeekDays(currentWeek)
        const startOfWeek = weekDays[0]
        const endOfWeek = new Date(weekDays[6])
        endOfWeek.setHours(23, 59, 59, 999)
        
        return scheduleData.filter(event => {
            const eventDate = new Date(event.start)
            return eventDate >= startOfWeek && eventDate <= endOfWeek
        })
    }

    // Navigation de semaine
    const goToPreviousWeek = () => {
        const prevWeek = new Date(currentWeek)
        prevWeek.setDate(currentWeek.getDate() - 7)
        setCurrentWeek(prevWeek)
    }

    const goToNextWeek = () => {
        const nextWeek = new Date(currentWeek)
        nextWeek.setDate(currentWeek.getDate() + 7)
        setCurrentWeek(nextWeek)
    }

    const goToCurrentWeek = () => {
        setCurrentWeek(new Date())
    }

    // Organiser les événements par jour
    const organizeEventsByDay = () => {
        const weekDays = getWeekDays(currentWeek)
        const weekEvents = getWeekEvents()
        
        const eventsByDay = {}
        weekDays.forEach(day => {
            const dayKey = day.toDateString()
            eventsByDay[dayKey] = weekEvents.filter(event => {
                return new Date(event.start).toDateString() === dayKey
            }).sort((a, b) => new Date(a.start) - new Date(b.start))
        })
        
        return { weekDays, eventsByDay }
    }

    const { weekDays, eventsByDay } = organizeEventsByDay()

    return (
        <div className="schedule-page">
            <header className="page-header">
                <button className="back-button" onClick={onBack}>
                    ← Retour
                </button>
                <h1>Emploi du temps</h1>
            </header>

            <div className="schedule-controls">
                <div className="controls-grid">
                    <div className="class-selector">
                        <label htmlFor="class-select">Choisir une classe :</label>
                        <select
                            id="class-select"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Sélectionner une classe --</option>
                            {Object.keys(linksData).map(className => (
                                <option key={className} value={className}>
                                    {className}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedClass && (
                        <div className="week-navigation">
                            <button onClick={goToPreviousWeek}>← Semaine précédente</button>
                            <button onClick={goToCurrentWeek}>Cette semaine</button>
                            <button onClick={goToNextWeek}>Semaine suivante →</button>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="loading-message">
                    <div className="spinner"></div>
                    <p>Chargement de l'emploi du temps...</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        Tentative de connexion aux serveurs...
                    </p>
                </div>
            )}

            <ErrorBoundary 
                error={error} 
                onRetry={() => {
                    setError('');
                    if (selectedClass) {
                        loadSchedule(selectedClass);
                    }
                }}
            >
                {selectedClass && !loading && !error && (
                    <div className="schedule-content">
                        <div className="week-header">
                            <h2>
                                Semaine du {formatDate(weekDays[0])} au {formatDate(weekDays[6])}
                            </h2>
                            <div className="class-info">
                                <p className="selected-class">Classe : {selectedClass}</p>
                                {isTestData && (
                                    <div className="test-data-badge">
                                        🧪 Données de démonstration
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="schedule-grid">
                            {weekDays.map((day, index) => {
                                const dayKey = day.toDateString()
                                const dayEvents = eventsByDay[dayKey] || []
                                const isToday = day.toDateString() === new Date().toDateString()
                                
                                return (
                                    <div 
                                        key={dayKey} 
                                        className={`day-column ${isToday ? 'today' : ''} ${index >= 5 ? 'weekend' : ''}`}
                                    >
                                        <div className="day-header">
                                            <h3>{formatDate(day)}</h3>
                                        </div>
                                        <div className="day-events">
                                            {dayEvents.length > 0 ? (
                                                dayEvents.map((event, eventIndex) => (
                                                    <div key={eventIndex} className="event-item">
                                                        <div className="event-time">
                                                            {formatTime(event.start)} - {formatTime(event.end)}
                                                        </div>
                                                        <div className="event-title">{event.title}</div>
                                                        {event.location && (
                                                            <div className="event-location">📍 {event.location}</div>
                                                        )}
                                                        {event.description && (
                                                            <div className="event-description">{event.description}</div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-events">Aucun cours</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </ErrorBoundary>
        </div>
    )
}

export default SchedulePage