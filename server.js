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

app.post('/api/register', async (req, res, next) =>
{
  // incoming: email, password, name
  // outgoing: id, error

  var error = '';
  const { email, password, name } = req.body;

  const db = client.db('MTG');

  const existingUser = await db.collection('Users').find({email:email}).toArray();

  var id = -1;

  if( existingUser.length > 0 )
  {
    error = 'Email already in use';
  }
  else
  {
    try
    {
      const newUser = {email:email, name:name, password:password};
      const result = await db.collection('Users').insertOne(newUser);
      id = result.insertedId;
    }
    catch(e)
    {
      error = e.toString();
      id = -1;
    }
  }

  var ret = { id:id, error:error };
  res.status(200).json(ret);
});

app.post('/api/login', async (req, res, next) =>
{
  // incoming: email, password
  // outgoing: id, name, error

  var error = '';
  const { name, password } = req.body;

  const db = client.db('MTG');
  const results = await db.collection('Users').find({name:name, password:password}).toArray();

  var id = -1;
  var email = '';

  if( results.length > 0 )
  {
    id = results[0]._id;
    email = results[0].email;
    username = results[0].name;
  }
  else
  {
    error = 'Invalid name/password';
  }

  var ret = { id:id, email:email, error:error };
  res.status(200).json(ret);
});


// Helper: maps a raw MTGSET document to the full API card object
function buildCardObject(card)
{
  return {
    id:            card._id,
    name:          card.name,
    manaCost:      card.manaCost,
    cmc:           card.cmc,
    colors:        card.colors,
    colorIdentity: card.colorIdentity,
    typeLine:      card.typeLine,
    oracleText:    card.oracleText,
    power:         card.power,
    toughness:     card.toughness,
    loyalty:       card.loyalty,
    rarity:        card.rarity,
    setName:       card.setName,
    setCode:       card.setCode,
    artist:        card.artist,
    imageUrl:      card.imageUrl,
    comBan:        card.ComBan,
    gamechanger:   card.Gamechanger
  };
}

app.post('/api/searchcards', async (req, res, next) =>
{
  // incoming: search (optional), comBan (optional), gamechanger (optional)
  // outgoing: results[], error

  var error = '';
  const { search, comBan, gamechanger } = req.body;

  // build the query object dynamically based on what was provided
  var query = {};

  if( search && search.trim() !== '' )
  {
    query.name = { $regex: search.trim() + '.*', $options: 'i' };
  }

  if( comBan === true || comBan === 1 )
  {
    query.ComBan = 1;
  }

  if( gamechanger === true || gamechanger === 1 )
  {
    query.Gamechanger = 1;
  }

  var _ret = [];

  const db = client.db('MTG');
  const results = await db.collection('MTGSET').find(query).toArray();

  for( var i=0; i<results.length; i++ )
  {
    _ret.push( buildCardObject(results[i]) );
  }

  var ret = {results:_ret, error:error};
  res.status(200).json(ret);
});

app.post('/api/addcard', async (req, res, next) =>
{
  // incoming: name, manaCost, cmc, colors, colorIdentity, typeLine,
  //           oracleText, power, toughness, loyalty, rarity, setName,
  //           setCode, artist, imageUrl, ComBan, Gamechanger
  // outgoing: id, error

  var error = '';
  var id = -1;

  const {
    name, manaCost, cmc, colors, colorIdentity, typeLine,
    oracleText, power, toughness, loyalty, rarity, setName,
    setCode, artist, imageUrl, ComBan, Gamechanger
  } = req.body;

  try
  {
    const db = client.db('MTG');

    const newCard = {
      name:          name,
      manaCost:      manaCost,
      cmc:           cmc,
      colors:        colors        || [],
      colorIdentity: colorIdentity || [],
      typeLine:      typeLine,
      oracleText:    oracleText,
      power:         power         || null,
      toughness:     toughness     || null,
      loyalty:       loyalty       || null,
      rarity:        rarity,
      setName:       setName,
      setCode:       setCode,
      artist:        artist,
      imageUrl:      imageUrl,
      ComBan:        ComBan        || 0,
      Gamechanger:   Gamechanger   || 0
    };

    const result = await db.collection('MTGSET').insertOne(newCard);
    id = result.insertedId;
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = { id:id, error:error };
  res.status(200).json(ret);
});

app.post('/api/addinventory', async (req, res, next) =>
{
  // incoming: userID, cardID, total
  // outgoing: error

  var error = '';
  const { userID, cardID, total } = req.body;

  try
  {
    const db = client.db('MTG');

    const existing = await db.collection('Inventory').find(
      {userID:new ObjectId(userID), cardID:new ObjectId(cardID)}
    ).toArray();

    if( existing.length > 0 )
    {
      // already own some of this card -- just bump the count
      await db.collection('Inventory').updateOne(
        { _id: existing[0]._id },
        { $inc: { total: total } }
      );
    }
    else
    {
      // first time owning this card -- create the record
      const newEntry = {cardID:new ObjectId(cardID), userID:new ObjectId(userID), total:total};
      await db.collection('Inventory').insertOne(newEntry);
    }
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/removeinventory', async (req, res, next) =>
{
  // incoming: userID, cardID, total
  // outgoing: error

  var error = '';
  const { userID, cardID, total } = req.body;

  try
  {
    const db = client.db('MTG');

    const existing = await db.collection('Inventory').find(
      {userID:new ObjectId(userID), cardID:new ObjectId(cardID)}
    ).toArray();

    if( existing.length > 0 )
    {
      var newTotal = existing[0].total - total;

      if( newTotal < 0 )
      {
        // don't let the count go negative, but keep the record
        newTotal = 0;
      }

      await db.collection('Inventory').updateOne(
        { _id: existing[0]._id },
        { $set: { total: newTotal } }
      );
    }
    else
    {
      error = 'Card not found in inventory';
    }
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/getinventory', async (req, res, next) =>
{
  // incoming: userID
  // outgoing: results[], error

  var error = '';
  const { userID } = req.body;
  var _ret = [];

  try
  {
    const db = client.db('MTG');

    // $lookup joins each Inventory record with its matching MTGSET card
    // so the response includes the card name/image, not just an ID
    const results = await db.collection('Inventory').aggregate([
      { $match: { userID: new ObjectId(userID) } },
      { $lookup: {
          from: 'MTGSET',
          localField: 'cardID',
          foreignField: '_id',
          as: 'card'
        }
      },
      { $unwind: '$card' }
    ]).toArray();

    for( var i=0; i<results.length; i++ )
    {
      _ret.push( {
        inventoryId: results[i]._id,
        cardId: results[i].card._id,
        name: results[i].card.name,
        imageUrl: results[i].card.imageUrl,
        total: results[i].total
      } );
    }
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = {results:_ret, error:error};
  res.status(200).json(ret);
});

app.post('/api/createdeck', async (req, res, next) =>
{
  // incoming: userId, deckName
  // outgoing: id, error

  var error = '';
  const { userId, deckName } = req.body;
  var id = -1;

  try
  {
    const db = client.db('MTG');
    const newDeck = {userId:new ObjectId(userId), deckName:deckName, cards:[]};
    const result = await db.collection('Decks').insertOne(newDeck);
    id = result.insertedId;
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = { id:id, error:error };
  res.status(200).json(ret);
});

app.post('/api/addcardtodeck', async (req, res, next) =>
{
  // incoming: deckId, cardId, quantity
  // outgoing: error

  var error = '';
  const { deckId, cardId, quantity } = req.body;

  try
  {
    const db = client.db('MTG');

    const deck = await db.collection('Decks').findOne({ _id: new ObjectId(deckId) });
    const existingCard = deck.cards.find(c => c.cardId.toString() === cardId);

    if( existingCard )
    {
      // card is already in the deck -- bump its quantity
      await db.collection('Decks').updateOne(
        { _id: new ObjectId(deckId), "cards.cardId": new ObjectId(cardId) },
        { $inc: { "cards.$.quantity": quantity } }
      );
    }
    else
    {
      // new card for this deck -- push it onto the array
      await db.collection('Decks').updateOne(
        { _id: new ObjectId(deckId) },
        { $push: { cards: { cardId: new ObjectId(cardId), quantity: quantity } } }
      );
    }
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/removecardfromdeck', async (req, res, next) =>
{
  // incoming: deckId, cardId
  // outgoing: error

  var error = '';
  const { deckId, cardId } = req.body;

  try
  {
    const db = client.db('MTG');

    await db.collection('Decks').updateOne(
      { _id: new ObjectId(deckId) },
      { $pull: { cards: { cardId: new ObjectId(cardId) } } }
    );
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/getdecks', async (req, res, next) =>
{
  // incoming: userId
  // outgoing: results[], error

  var error = '';
  const { userId } = req.body;
  var _ret = [];

  try
  {
    const db = client.db('MTG');
    const results = await db.collection('Decks').find({ userId: new ObjectId(userId) }).toArray();

    for( var i=0; i<results.length; i++ )
    {
      _ret.push( {
        id: results[i]._id,
        deckName: results[i].deckName,
        cards: results[i].cards
      } );
    }
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = {results:_ret, error:error};
  res.status(200).json(ret);
});
 

app.listen(5000); // start Node + Express server on port 5000