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

app.listen(5038, () => {
	connectToDatabase();
});

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
