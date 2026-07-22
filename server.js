const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.MONGODB_URI;

if (!url) {
  console.error('Missing MONGODB_URI in environment. Check .env in backend root.');
  process.exit(1);
}

const client = new MongoClient(url);
client.connect();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

require('./api.js')(app, client);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (require.main === module) {
  app.listen(5000, '0.0.0.0', () => {
    // console.log('Server is running on port 5000');
  });
}

module.exports = app;