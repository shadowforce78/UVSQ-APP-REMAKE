// Script utilitaire pour tester les liens ICS
import ICAL from 'ical.js';

const linksData = {
    "INF1-A1": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-NM2ABGDV5957/schedule.ics",
    "INF1-A2": "https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-CU2JFTWC5958/schedule.ics",
    // ... tous les autres liens
};

export const testICSLink = async (className) => {
    const url = linksData[className];
    if (!url) {
        console.error('Classe non trouvée:', className);
        return;
    }

    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const icsText = data.contents;
        
        console.log(`Test pour ${className} - OK`);
        
        // Parser le contenu
        const jcalData = ICAL.parse(icsText);
        const vcalendar = new ICAL.Component(jcalData);
        const events = vcalendar.getAllSubcomponents('vevent');
        
        console.log(`Nombre d'événements trouvés: ${events.length}`);
        
        if (events.length > 0) {
            const firstEvent = events[0];
            const summary = firstEvent.getFirstPropertyValue('summary');
            const dtstart = firstEvent.getFirstPropertyValue('dtstart');
            
            console.log(`Premier événement: ${summary} le ${dtstart.toJSDate().toLocaleDateString('fr-FR')}`);
        }
        
        return events.length;
        
    } catch (error) {
        console.error(`Erreur pour ${className}:`, error.message);
        return -1;
    }
};

// Fonction pour tester tous les liens
export const testAllLinks = async () => {
    console.log('Test de tous les liens ICS...\n');
    
    for (const className of Object.keys(linksData)) {
        await testICSLink(className);
        // Attendre un peu pour éviter de surcharger les serveurs
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\nTest terminé.');
};