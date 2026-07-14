const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
//Change to our URL
const url = process.env.MONGODB_URI;

const client = new MongoClient(url);
client.connect();

var api = require('./api.js');
api.setApp( app, client );

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});
 

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
});