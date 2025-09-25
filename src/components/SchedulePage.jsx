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
    const [selectedClass, setSelectedClass] = useState(() => {
        try {
            return localStorage.getItem('uvsq:lastClass') || ''
        } catch (_) {
            return ''
        }
    })
    const [scheduleData, setScheduleData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [currentWeek, setCurrentWeek] = useState(new Date())
    const [isTestData, setIsTestData] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [mobileActiveDayKey, setMobileActiveDayKey] = useState('')

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
    const parseICS = async (url, className = null) => {
    const sameOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    const isLocalhost = /(^|\.)localhost$/.test(hostname) || hostname === '127.0.0.1'
    const altApiOrigin = hostname ? `${protocol}//api.${hostname}` : ''

    // Endpoints backend (tous passent par notre serveur Node qui appelle api.saumondeluxe.com)
    const endpointSameOrigin = `${(sameOrigin || '').replace(/\/$/, '')}/api/ics-class/${encodeURIComponent(className || '')}`
    const endpointAlt = altApiOrigin ? `${altApiOrigin}/api/ics-class/${encodeURIComponent(className || '')}` : ''

        const proxies = isLocalhost
            ? [
                // En dev: passer par le proxy Vite -> localhost:3001
                { url: endpointSameOrigin, name: 'backend-ics-class-same-origin' },
                // Fallback éventuel
                ...(endpointAlt ? [{ url: endpointAlt, name: 'backend-ics-class-alt' }] : [])
              ]
            : [
                // En prod: utiliser api.<host>
                ...(endpointAlt ? [{ url: endpointAlt, name: 'backend-ics-class-alt' }] : []),
                // Fallback (probable 404 en prod mais sans risque)
                { url: endpointSameOrigin, name: 'backend-ics-class-same-origin' }
              ];

        let lastError;
        
        for (const proxy of proxies) {
            try {
                console.log(`Tentative avec ${proxy.name}:`, proxy.url);
                
                const response = await fetch(proxy.url, {
                    method: 'GET',
                    // Éviter les en-têtes non simples pour limiter les preflights CORS
                    headers: {
                        'Accept': 'text/calendar,text/plain,*/*; charset=utf-8'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                let icsText;
                // Force explicit UTF-8 decode (fallback latin1 if mojibake detected)
                const buffer = await response.arrayBuffer();
                const utf8Decoder = new TextDecoder('utf-8');
                icsText = utf8Decoder.decode(buffer).replace(/^\uFEFF/, '');
                if (/[^\u0000-\u00FF]/.test(icsText) === false && /Ã|�/.test(icsText)) {
                    // Likely mojibake from wrong charset; try latin1 fallback using original buffer
                    try {
                        icsText = new TextDecoder('latin1').decode(buffer);
                    } catch (_) { /* ignore */ }
                }
                
                // Nettoyage du texte si nécessaire
                if (icsText.includes('<!DOCTYPE') || icsText.includes('<html')) {
                    throw new Error('Réponse HTML au lieu d\'ICS');
                }
                
                console.log(`Succès avec ${proxy.name}`);
                
                const jcalData = ICAL.parse(icsText);
                const vcalendar = new ICAL.Component(jcalData);
                const vevents = vcalendar.getAllSubcomponents('vevent');

                // Fenêtre d'expansion des récurrences: de -60 jours à +180 jours
                const now = new Date();
                const fromWindow = new Date(now);
                fromWindow.setDate(fromWindow.getDate() - 60);
                const toWindow = new Date(now);
                toWindow.setDate(toWindow.getDate() + 180);
                const fromICAL = ICAL.Time.fromJSDate(fromWindow);
                const toICAL = ICAL.Time.fromJSDate(toWindow);

                const expanded = [];

                vevents.forEach(comp => {
                    const evt = new ICAL.Event(comp);
                    const summary = comp.getFirstPropertyValue('summary') || 'Cours';
                    const location = comp.getFirstPropertyValue('location') || '';
                    const description = comp.getFirstPropertyValue('description') || '';

                    if (evt.isRecurring()) {
                        const it = evt.iterator(fromICAL);
                        let next;
                        while ((next = it.next())) {
                            if (next.compare(toICAL) > 0) break; // au-delà de la fenêtre
                            const details = evt.getOccurrenceDetails(next);
                            expanded.push({
                                title: summary,
                                location,
                                description,
                                start: details.startDate.toJSDate(),
                                end: details.endDate.toJSDate()
                            });
                        }
                    } else {
                        const dtstart = comp.getFirstPropertyValue('dtstart');
                        const dtend = comp.getFirstPropertyValue('dtend');
                        if (dtstart && dtend) {
                            const s = dtstart.toJSDate();
                            const e = dtend.toJSDate();
                            // Garder uniquement les événements qui tombent dans la fenêtre pour limiter le volume
                            if (e >= fromWindow && s <= toWindow) {
                                expanded.push({
                                    title: summary,
                                    location,
                                    description,
                                    start: s,
                                    end: e
                                });
                            }
                        }
                    }
                });

                // Tri global par date de début
                expanded.sort((a, b) => a.start - b.start);
                return expanded;
                
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
            const events = await parseICS(linksData[className], className)
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

    // Sauvegarder la sélection et valider la clé au montage
    useEffect(() => {
        // Persist selection
        try {
            if (selectedClass) {
                localStorage.setItem('uvsq:lastClass', selectedClass)
            }
        } catch (_) { /* noop */ }
    }, [selectedClass])

    useEffect(() => {
        // Validate stored value on mount
        try {
            const stored = localStorage.getItem('uvsq:lastClass')
            if (stored && !linksData[stored]) {
                localStorage.removeItem('uvsq:lastClass')
                setSelectedClass('')
            }
        } catch (_) { /* noop */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Détection mobile (<= 768px)
    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth <= 768)
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    // Filtrer les événements pour la semaine courante
    const getWeekEvents = () => {
        const weekDays = getWeekDays(currentWeek)
        const startOfWeek = new Date(weekDays[0]) // Lundi
        startOfWeek.setHours(0, 0, 0, 0)
        // Limiter à vendredi 23:59:59
        const endOfWeek = new Date(weekDays[4])
        endOfWeek.setHours(23, 59, 59, 999)
        
        return scheduleData.filter(event => {
            const s = new Date(event.start).getTime()
            return s >= startOfWeek.getTime() && s <= endOfWeek.getTime()
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
            const d = new Date(day)
            d.setHours(0,0,0,0)
            const dayKey = d.toDateString()
            eventsByDay[dayKey] = weekEvents.filter(event => {
                const ed = new Date(event.start)
                ed.setHours(0,0,0,0)
                return ed.toDateString() === dayKey
            }).sort((a, b) => new Date(a.start) - new Date(b.start))
        })
        
        return { weekDays, eventsByDay }
    }

    const { weekDays, eventsByDay } = organizeEventsByDay()

    // Maintenir le jour actif sur mobile (par défaut: aujourd'hui si ouvré, sinon lundi)
    useEffect(() => {
        if (!isMobile) return
        const weekdaysOnly = weekDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6)
        const today = new Date(); today.setHours(0,0,0,0)
        const todayInWeek = weekdaysOnly.find(d => {
            const d0 = new Date(d); d0.setHours(0,0,0,0); return d0.toDateString() === today.toDateString()
        })
        const target = todayInWeek || weekdaysOnly[0]
        if (!target) return
        const t0 = new Date(target); t0.setHours(0,0,0,0)
        const key = t0.toDateString()
        if (!mobileActiveDayKey || !weekdaysOnly.some(d => { const d0 = new Date(d); d0.setHours(0,0,0,0); return d0.toDateString() === mobileActiveDayKey })) {
            setMobileActiveDayKey(key)
        }
    }, [isMobile, weekDays, mobileActiveDayKey])

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
                            {(() => {
                                const weekdaysOnly = weekDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6);
                                const endDay = weekdaysOnly[weekdaysOnly.length - 1] || weekDays[weekDays.length - 1];
                                return (
                                    <h2>
                                        Semaine du {formatDate(weekDays[0])} au {formatDate(endDay)}
                                    </h2>
                                );
                            })()}
                            <div className="class-info">
                                <p className="selected-class">Classe : {selectedClass}</p>
                                {isTestData && (
                                    <div className="test-data-badge">
                                        🧪 Données de démonstration
                                    </div>
                                )}
                            </div>
                        </div>

                        {isMobile && (
                            <div className="mobile-day-tabs">
                                {weekDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6).map((day) => {
                                    const d0 = new Date(day); d0.setHours(0,0,0,0)
                                    const key = d0.toDateString()
                                    const label = day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
                                    const active = key === mobileActiveDayKey
                                    return (
                                        <button
                                            key={key}
                                            className={`day-tab ${active ? 'active' : ''}`}
                                            onClick={() => setMobileActiveDayKey(key)}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        <div className="schedule-grid">
                            {(isMobile
                                ? weekDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6).filter(day => { const d0 = new Date(day); d0.setHours(0,0,0,0); return d0.toDateString() === mobileActiveDayKey })
                                : weekDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6)
                            ).map((day) => {
                                const d0 = new Date(day); d0.setHours(0,0,0,0)
                                const dayKey = d0.toDateString()
                                const dayEvents = eventsByDay[dayKey] || []
                                const today0 = new Date(); today0.setHours(0,0,0,0)
                                const isToday = d0.toDateString() === today0.toDateString()
                                
                                return (
                                    <div 
                                        key={dayKey} 
                                        className={`day-column ${isToday ? 'today' : ''}`}
                                    >
                                        <div className="day-header">
                                            <h3>{formatDate(day)}</h3>
                                        </div>
                                        <div className="day-events">
                                            {dayEvents.length > 0 ? (() => {
                                                const items = []
                                                for (let i = 0; i < dayEvents.length; i++) {
                                                    const ev = dayEvents[i]
                                                    if (i > 0) {
                                                        const prev = dayEvents[i-1]
                                                        const gapMin = Math.max(0, (new Date(ev.start) - new Date(prev.end)) / 60000)
                                                        if (gapMin >= 20) {
                                                            const gapLabel = `${formatTime(prev.end)} - ${formatTime(ev.start)}`
                                                            const height = Math.max(10, Math.min(72, Math.round(gapMin * 0.6))) // ~36px/heure
                                                            items.push(
                                                                <div key={`gap-${i}-${dayKey}`} className="gap-item" style={{ height }}>
                                                                    Pause ({gapLabel})
                                                                </div>
                                                            )
                                                        }
                                                    }
                                                    items.push(
                                                        <div key={`ev-${i}-${dayKey}`} className="event-item">
                                                            <div className="event-time">
                                                                {formatTime(ev.start)} - {formatTime(ev.end)}
                                                            </div>
                                                            <div className="event-title">{ev.title}</div>
                                                            {ev.location && (
                                                                <div className="event-location">📍 {ev.location}</div>
                                                            )}
                                                            {ev.description && (
                                                                <div className="event-description">{ev.description}</div>
                                                            )}
                                                        </div>
                                                    )
                                                }
                                                return items
                                            })() : (
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