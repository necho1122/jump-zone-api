import Express, { json } from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = Express();
app.use(cors());
app.use(json());

const CONNECTION_STRING = process.env.MONGODB_APP_URL;
const DATABASENAME = 'jumpzoneapp';

const client = new MongoClient(CONNECTION_STRING, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

let db;

const connectToDatabase = async () => {
	try {
		await client.connect();
		db = client.db(DATABASENAME);
		console.log('¡Conectado a `' + DATABASENAME + '`!');
	} catch (error) {
		console.error('Error conectando a la base de datos:', error);
		process.exit(1); // Salir si no puede conectarse a la base de datos
	}
};

const checkDbConnection = (req, res, next) => {
	if (!db) {
		return res.status(500).send('La base de datos no está conectada');
	}
	next();
};

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

// Inicia la conexión a la base de datos y luego el servidor Express
const startServer = async () => {
	await connectToDatabase();
	const PORT = process.env.PORT || 5038;
	app.listen(PORT, () => {
		console.log(`Servidor corriendo en el puerto ${PORT}`);
	});
};

startServer();
