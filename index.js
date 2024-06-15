import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Firebase
const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
	measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Ruta para obtener datos
app.get('/data', async (req, res) => {
	try {
		const querySnapshot = await getDocs(collection(db, 'jumpzone'));
		const data = [];
		querySnapshot.forEach((doc) => {
			data.push({ id: doc.id, ...doc.data() });
		});
		res.status(200).json(data);
	} catch (error) {
		console.error('Error al obtener productos:', error);
		res.status(500).json({ message: 'Error al obtener productos' });
	}
});

app.post('/addnote', async (req, res) => {
	try {
		const { hostName, hostLink, coments } = req.body;

		if (!hostName || !hostLink || !coments) {
			return res
				.status(400)
				.json({ message: 'Todos los campos son obligatorios' });
		}

		const newNote = {
			hostName,
			hostLink,
			coments,
		};

		const docRef = await addDoc(collection(db, 'jumpzone'), newNote);
		console.log('Documento agregado con ID: ', docRef.id); // Firestore asigna un ID único automáticamente

		res.json('Agregado exitosamente');
	} catch (error) {
		console.error('Error al agregar la nota:', error);
		res.status(500).send('Error al agregar la nota.');
	}
});

const PORT = process.env.PORT || 5038;
app.listen(PORT, () => {
	console.log(`Servidor escuchando en el puerto ${PORT}`);
});
