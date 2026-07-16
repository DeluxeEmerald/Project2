require('express');
require('mongodb');

const token = require('./createJWT.js')

module.exports = function(app, client)
{

var token = require('./createJWT.js');

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
  // incoming: name, password
  // outgoing: accessToken, error
 
  var error = '';
  const {name, password } = req.body;
 
  const db = client.db('MTG');
  const results = await db.collection('Users').find({name:name, password:password}).toArray();
 
  var ret;
 
  if( results.length > 0 )
  {
    try
    {
      ret = token.createToken(results[0].name, results[0]._id, error);
    }
    catch(e)
    {
      ret = { error: e.message };
    }
  }
  else
  {
    ret = { error: 'Invalid email/password' };
  }
 
  res.status(200).json(ret);
});
 
 
// ---------------------------------------------------------------------
// Helper: maps a raw MTGSET document to the full API card object
// ---------------------------------------------------------------------
 
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
 
 
// ---------------------------------------------------------------------
// CARD SEARCH  (MTGSET collection)
// search matches across: name, manaCost, typeLine, oracleText,
//                        setName, setCode, artist, rarity, cmc
// ---------------------------------------------------------------------
 
app.post('/api/searchcards', async (req, res, next) =>
{
  // incoming: jwtToken, search (optional), comBan (optional), gamechanger (optional)
  // outgoing: results[], error, jwtToken
 
  var error = '';
  const { jwtToken, search, comBan, gamechanger } = req.body;
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var query = {};
 
  if( search && search.trim() !== '' )
  {
    var _search = search.trim();
    query.$or = [
      { name:       { $regex: _search, $options: 'i' } },
      { manaCost:   { $regex: _search, $options: 'i' } },
      { typeLine:   { $regex: _search, $options: 'i' } },
      { oracleText: { $regex: _search, $options: 'i' } },
      { setName:    { $regex: _search, $options: 'i' } },
      { setCode:    { $regex: _search, $options: 'i' } },
      { artist:     { $regex: _search, $options: 'i' } },
      { rarity:     { $regex: _search, $options: 'i' } },
      { cmc:        !isNaN(_search) ? Number(_search) : null },
    ].filter(condition => Object.values(condition)[0] !== null);
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
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
 
// ---------------------------------------------------------------------
// ADD CARD  (MTGSET collection)
// ---------------------------------------------------------------------
 
app.post('/api/addcard', async (req, res, next) =>
{
  // incoming: jwtToken, name, manaCost, cmc, colors, colorIdentity,
  //           typeLine, oracleText, power, toughness, loyalty, rarity,
  //           setName, setCode, artist, imageUrl, ComBan, Gamechanger
  // outgoing: id, error, jwtToken
 
  var error = '';
  var id = -1;
 
  const {
    jwtToken, name, manaCost, cmc, colors, colorIdentity, typeLine,
    oracleText, power, toughness, loyalty, rarity, setName,
    setCode, artist, imageUrl, ComBan, Gamechanger
  } = req.body;
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
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
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { id:id, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
 
// ---------------------------------------------------------------------
// INVENTORY  (Inventory collection: _id, cardID, total, userID, CardName)
// ---------------------------------------------------------------------
 
app.post('/api/addinventory', async (req, res, next) =>
{
  // incoming: jwtToken, userID, cardID, total, CardName
  // outgoing: error, jwtToken
 
  var error = '';
  const { jwtToken, userID, cardID, total, CardName } = req.body;
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  try
  {
    const db = client.db('MTG');
 
    const existing = await db.collection('Inventory').find(
      {userID:new ObjectId(userID), cardID:new ObjectId(cardID)}
    ).toArray();
 
    if( existing.length > 0 )
    {
      await db.collection('Inventory').updateOne(
        { _id: existing[0]._id },
        { $inc: { total: total } }
      );
    }
    else
    {
      const newEntry = {cardID:new ObjectId(cardID), userID:new ObjectId(userID), total:total, CardName:CardName};
      await db.collection('Inventory').insertOne(newEntry);
    }
  }
  catch(e)
  {
    error = e.toString();
  }
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
app.post('/api/removeinventory', async (req, res, next) =>
{
  // incoming: jwtToken, userID, cardID, total
  // outgoing: error, jwtToken
 
  var error = '';
  const { jwtToken, userID, cardID, total } = req.body;
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
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
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
app.post('/api/getinventory', async (req, res, next) =>
{
  // incoming: jwtToken, userID
  // outgoing: results[], error, jwtToken
 
  var error = '';
  const { jwtToken, userID } = req.body;
  var _ret = [];
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  try
  {
    const db = client.db('MTG');
 
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
        cardId:      results[i].card._id,
        name:        results[i].card.name,
        CardName:    results[i].CardName,
        imageUrl:    results[i].card.imageUrl,
        total:       results[i].total
      } );
    }
  }
  catch(e)
  {
    error = e.toString();
  }
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
app.post('/api/searchinventory', async (req, res, next) =>
{
  // incoming: jwtToken, userID, search (optional), comBan (optional), gamechanger (optional)
  // outgoing: results[], error, jwtToken
 
  var error = '';
  const { jwtToken, userID, search, comBan, gamechanger } = req.body;
  var _ret = [];
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  try
  {
    const db = client.db('MTG');
 
    const inventoryResults = await db.collection('Inventory').aggregate([
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
 
    for( var i=0; i<inventoryResults.length; i++ )
    {
      var card = inventoryResults[i].card;
      var match = true;
 
      if( search && search.trim() !== '' )
      {
        var _search = search.trim().toLowerCase();
        var searchMatch =
          (card.name        && card.name.toLowerCase().includes(_search))        ||
          (card.manaCost    && card.manaCost.toLowerCase().includes(_search))     ||
          (card.typeLine    && card.typeLine.toLowerCase().includes(_search))     ||
          (card.oracleText  && card.oracleText.toLowerCase().includes(_search))   ||
          (card.setName     && card.setName.toLowerCase().includes(_search))      ||
          (card.setCode     && card.setCode.toLowerCase().includes(_search))      ||
          (card.artist      && card.artist.toLowerCase().includes(_search))       ||
          (card.rarity      && card.rarity.toLowerCase().includes(_search))       ||
          (!isNaN(_search)  && card.cmc === Number(_search));
 
        if( !searchMatch ) match = false;
      }
 
      if( (comBan === true || comBan === 1) && card.ComBan !== 1 )
      {
        match = false;
      }
 
      if( (gamechanger === true || gamechanger === 1) && card.Gamechanger !== 1 )
      {
        match = false;
      }
 
      if( match )
      {
        _ret.push( {
          inventoryId: inventoryResults[i]._id,
          total:       inventoryResults[i].total,
          CardName:    inventoryResults[i].CardName,
          ...buildCardObject(card)
        } );
      }
    }
  }
  catch(e)
  {
    error = e.toString();
  }
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
 
// ---------------------------------------------------------------------
// DECKS  (Decks collection: _id, cards[], deckName, inventoryId, userId)
// ---------------------------------------------------------------------
 
app.post('/api/createdeck', async (req, res, next) =>
{
  // incoming: jwtToken, userId, deckName
  // outgoing: id, error, jwtToken
 
  var error = '';
  const { jwtToken, userId, deckName } = req.body;
  var id = -1;
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
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
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { id:id, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
app.post('/api/addcardtodeck', async (req, res, next) =>
{
  // incoming: jwtToken, deckId, cardId, quantity
  // outgoing: error, jwtToken
 
  var error = '';
  const { jwtToken, deckId, cardId, quantity } = req.body;
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  try
  {
    const db = client.db('MTG');
 
    const deck = await db.collection('Decks').findOne({ _id: new ObjectId(deckId) });
    const existingCard = deck.cards.find(c => c.cardId.toString() === cardId);
 
    if( existingCard )
    {
      await db.collection('Decks').updateOne(
        { _id: new ObjectId(deckId), "cards.cardId": new ObjectId(cardId) },
        { $inc: { "cards.$.quantity": quantity } }
      );
    }
    else
    {
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
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
app.post('/api/removecardfromdeck', async (req, res, next) =>
{
  // incoming: jwtToken, deckId, cardId
  // outgoing: error, jwtToken
 
  var error = '';
  const { jwtToken, deckId, cardId } = req.body;
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
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
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
app.post('/api/getdecks', async (req, res, next) =>
{
  // incoming: jwtToken, userId
  // outgoing: results[], error, jwtToken
 
  var error = '';
  const { jwtToken, userId } = req.body;
  var _ret = [];
 
  try
  {
    if( token.isExpired(jwtToken) )
    {
      var r = { error: 'The JWT is no longer valid', jwtToken: '' };
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  try
  {
    const db = client.db('MTG');
    const results = await db.collection('Decks').find({ userId: new ObjectId(userId) }).toArray();
 
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( {
        id:       results[i]._id,
        deckName: results[i].deckName,
        cards:    results[i].cards
      } );
    }
  }
  catch(e)
  {
    error = e.toString();
  }
 
  var refreshedToken = null;
  try
  {
    var refreshResult = token.refresh(jwtToken);
    refreshedToken = refreshResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});

}