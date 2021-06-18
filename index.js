const express = require('express')

const bodyParser = require('body-parser')
const cors = require('cors')
const port = 5000
const admin = require('firebase-admin');
require('dotenv').config()
console.log(process.env.DB_PASS);


const app = express()
app.use(cors());
app.use(bodyParser.json());

// const pass = ArabianHorse79

const serviceAccount = require("./configs/ahmed-burj-al-arab-firebase-adminsdk-lvgcq-e975d602b7.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.na2s6.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    console.log("db connected successfully")
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
        console.log(newBooking);
    })

    app.get('/bookings', (req, res) => {
        const bearer = (req.headers.authorization);
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });

            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail === queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.send(documents)
                            })
                    }

                })
                .catch((error) => {

                });
        }
        else{
            res.status(401).send('un-authorized access');
        }

    })
});


app.get('/', (req, res) => {
    res.send('Hero World!')
})


app.listen(port);