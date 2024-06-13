import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CONNECTION_STRING = process.env.MONGODB_APP_URL;
const DATABASENAME = 'jumpzoneapp';

// Configuración de Mongoose con reintentos
const connectWithRetry = () => {
	mongoose
		.connect(CONNECTION_STRING, {
			dbName: DATABASENAME,
		})
		.then(() => {
			console.log('¡Conectado a MongoDB!');
		})
		.catch((err) => {
			console.error('Error conectando a la base de datos:', err);
			setTimeout(connectWithRetry, 5000); // Reintentar cada 5 segundos
		});
};

connectWithRetry();

const noteSchema = new mongoose.Schema(
	{
		id: String,
		hostName: String,
		hostLink: String,
		coments: String,
	},
	{ collection: 'jumpzone' }
);

const Note = mongoose.model('Note', noteSchema);

app.get('/api/jumpzoneapp/getnotes', async (req, res) => {
	try {
		const notes = await Note.find();
		res.send(notes);
	} catch (error) {
		console.error('Error al obtener las notas:', error);
		res.status(500).send('Error al obtener las notas.');
	}
});

app.post('/api/jumpzoneapp/addnote', async (req, res) => {
	try {
		const { hostName, hostLink, coments } = req.body;
		const count = await Note.countDocuments({});
		const newNote = new Note({
			id: (count + 1).toString(),
			hostName,
			hostLink,
			coments,
		});
		await newNote.save();
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
