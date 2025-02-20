import { useState, useEffect } from 'react'
import './App.css'
import Homepage from './components/Homepage'
import BulletinPage from './components/BulletinPage'
import SchedulePage from './components/SchedulePage'
import AbsencesPage from './components/AbsencesPage'

function App() {
	const [studentId, setStudentId] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [userData, setUserData] = useState(null)
	const [showBulletin, setShowBulletin] = useState(false)
	const [currentPage, setCurrentPage] = useState('home')
	const [scheduleData, setScheduleData] = useState(null)
	const [scheduleLoading, setScheduleLoading] = useState(false);
	const [scheduleError, setScheduleError] = useState(null);

	const fetchSchedule = async (userData) => {
		try {
			setScheduleLoading(true);
			setScheduleError(null);
			
			// Formater les dates au format YYYY-MM-DD
			const formatDate = (date) => {
				return date.toISOString().split('T')[0];
			};

			const today = new Date();
			const start = formatDate(today);
			const end = formatDate(new Date(today.setDate(today.getDate() + 14)));

			// Extraire et formater le nom de la classe (enlever les espaces)
			const classe = userData.relevé.formation.acronyme.replace(/\s+/g, '');

			// Construire les credentials dans le format requis
			const credentials = `${classe}+${start}+${end}`;

			const response = await fetch(
				`http://localhost:3001/api/schedule/${credentials}`
			);

			if (!response.ok) {
				throw new Error('Erreur de chargement EDT');
			}

			const data = await response.json();
			if (!Array.isArray(data)) {
				throw new Error('Format de données invalide');
			}

			setScheduleData(data);
		} catch (err) {
			console.error('Erreur chargement EDT:', err);
			setScheduleError(err.message);
		} finally {
			setScheduleLoading(false);
		}
	};

	const formatDateForAPI = (date) => {
		const d = new Date(date);
		const day = String(d.getDate()).padStart(2, '0');
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const year = d.getFullYear();
		return `${day}-${month}-${year}`; // Changement de / vers -
	};

	const handleScheduleRefresh = async (classe, start, end) => {
		try {
			setScheduleLoading(true);
			setScheduleError(null);

			// Formatage de la classe et des dates
			const formattedClass = classe.toUpperCase().replace(/\s+/g, '');
			const formattedStart = formatDateForAPI(start);
			const formattedEnd = formatDateForAPI(end);
			
			// Construction des credentials avec le format requis
			const credentials = `${formattedClass}+${formattedStart}+${formattedEnd}`;
			console.log('Requête EDT:', { credentials });

			const response = await fetch(
				`http://localhost:3001/api/schedule/${credentials}`
			);

			const text = await response.text();
			console.log('Réponse brute:', text);

			if (!response.ok) {
				throw new Error(`Erreur serveur: ${response.status}`);
			}

			let data;
			try {
				data = JSON.parse(text);
			} catch (e) {
				console.error('Erreur parsing JSON:', e);
				throw new Error('Format de réponse invalide');
			}

			if (!Array.isArray(data)) {
				throw new Error('Format de données invalide');
			}

			setScheduleData(data);
		} catch (err) {
			console.error('Erreur chargement EDT:', err);
			setScheduleError(err.message);
		} finally {
			setScheduleLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const hashedPass = btoa(password) // Encodage correct en base64
			const response = await fetch(
				`http://localhost:3001/api/bulletin/${studentId}+${hashedPass}`
			)

			if (!response.ok) {
				throw new Error('Connexion échouée')
			}

			const data = await response.json()
			setUserData(data)
			console.log('Données reçues:', data)
			// Ici vous pouvez gérer les données reçues

		} catch (err) {
			setError('Erreur de connexion: ' + err.message)
		} finally {
			setLoading(false)
		}
	}

	if (userData) {
		switch(currentPage) {
			case 'bulletin':
				return <BulletinPage 
					userData={userData} 
					onBack={() => setCurrentPage('home')} 
				/>;
			case 'schedule':
				return <SchedulePage 
					schedule={scheduleData}
					loading={scheduleLoading}
					error={scheduleError}
					onBack={() => setCurrentPage('home')}
					onRefresh={handleScheduleRefresh}
				/>;
			case 'absences':
				return <AbsencesPage 
					userData={userData} 
					onBack={() => setCurrentPage('home')} 
				/>;
			default:
				return <Homepage 
					userData={userData} 
					onShowBulletin={() => setCurrentPage('bulletin')}
					onShowSchedule={() => setCurrentPage('schedule')}
					onShowAbsences={() => setCurrentPage('absences')}
				/>;
		}
	}

	return (
		<div>
			<h1>Connexion UVSQ</h1>
			<form className="login-form" onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Numéro étudiant"
					value={studentId}
					onChange={(e) => setStudentId(e.target.value)}
					disabled={loading}
					required
				/>
				<input
					type="password"
					placeholder="Mot de passe"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={loading}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? 'Connexion...' : 'Se connecter'}
				</button>
				{error && <p style={{ color: 'red' }}>{error}</p>}
			</form>
		</div>
	)
}

export default App
