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

app.listen(5038, () => {
	MongoClient.connect(
		CONNECTION_STRING,
		{ useUnifiedTopology: true },
		(error, client) => {
			if (error) {
				throw error;
			}
			db = client.db(DATABASENAME);
			console.log('¡Conectado a `' + DATABASENAME + '`!');
		}
	);
});

app.get('/api/jumpzoneapp/getnotes', (req, res) => {
	db.collection('jumpzone')
		.find({})
		.toArray((error, result) => {
			if (error) {
				res.status(500).send(error);
				return;
			}
			res.send(result);
		});
});

app.post('/api/jumpzoneapp/AddNote', (req, res) => {
	db.collection('jumpzone').countDocuments({}, (error, count) => {
		if (error) {
			res.status(500).send(error);
			return;
		}
		db.collection('jumpzone').insertOne(
			{
				id: (count + 1).toString(),
				hostName: req.body.hostName,
				hostLink: req.body.hostLink,
				coments: req.body.coments,
			},
			(err) => {
				if (err) {
					res.status(500).send(err);
					return;
				}
				res.json('Agregado exitosamente');
			}
		);
	});
});
