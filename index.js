import Express, { json } from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const app = Express();
app.use(cors());
app.use(json());

const CONNECTION_STRING = process.env.MONGODB_APP_URL;
const DATABASENAME = 'jumpzoneapp';

let db;

// Función para conectar a la base de datos
const connectToDatabase = async () => {
	try {
		const client = await MongoClient.connect(CONNECTION_STRING, {
			useUnifiedTopology: true,
		});
		db = client.db(DATABASENAME);
		console.log('¡Conectado a `' + DATABASENAME + '`!');
	} catch (error) {
		console.error('Error conectando a la base de datos:', error);
		process.exit(1); // Salir si no puede conectarse a la base de datos
	}
};

// Middleware para verificar la conexión a la base de datos
const checkDbConnection = (req, res, next) => {
	if (!db) {
		return res.status(500).send('La base de datos no está conectada');
	}
	next();
};

// Conectar a la base de datos al iniciar el servidor
app.listen(5038, () => {
	connectToDatabase();
});

// Usar el middleware en las rutas que requieren la conexión a la base de datos
app.use(checkDbConnection);

app.get('/api/jumpzoneapp/getnotes', async (req, res) => {
	try {
		const result = await db.collection('jumpzone').find({}).toArray();
		res.send(result);
	} catch (error) {
		console.error('Error al obtener las notas:', error);
		res.status(500).send('Error al obtener las notas.');
	}
});

app.post('/api/jumpzoneapp/AddNote', async (req, res) => {
	try {
		const count = await db.collection('jumpzone').countDocuments({});
		await db.collection('jumpzone').insertOne({
			id: (count + 1).toString(),
			hostName: req.body.hostName,
			hostLink: req.body.hostLink,
			coments: req.body.coments,
		});
		res.json('Agregado exitosamente');
	} catch (error) {
		console.error('Error al agregar la nota:', error);
		res.status(500).send('Error al agregar la nota.');
	}
});
