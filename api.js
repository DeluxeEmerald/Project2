require('express');
const {ObjectId} = require('mongodb');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5000';

const token = require('./createJWT.js')

module.exports = function(app, client)
{

var token = require('./createJWT.js');

// ---------------------------------------------------------------------
// Email helpers
// ---------------------------------------------------------------------

async function sendVerificationEmail(email, verificationToken)
{
  const verifyLink = `${CLIENT_URL}/verify-email?token=${verificationToken}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Verify your MTG Collection account',
    text: `Welcome! Verify your email by visiting: ${verifyLink}`,
    html: `<p>Welcome! Please verify your email by clicking the link below.</p>`
        + `<p><a href="${verifyLink}">Verify Email</a></p>`,
  };

  await sgMail.send(msg);
}

async function sendPasswordResetEmail(email, resetToken)
{
  const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset your MTG Collection password',
    text: `We received a request to reset your password. This link expires in 1 hour: ${resetLink}`,
    html: `<p>We received a request to reset your password. This link expires in 1 hour.</p>`
        + `<p><a href="${resetLink}">Reset Password</a></p>`,
  };

  await sgMail.send(msg);
}

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
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const newUser = {
        email: email,
        name: name,
        password: password,
        verified: false,
        verificationToken: verificationToken,
        resetToken: '',
        resetTokenExpiry: null
      };
      const result = await db.collection('Users').insertOne(newUser);
      id = result.insertedId;

      try
      {
        await sendVerificationEmail(email, verificationToken);
      }
      catch(e)
      {
        // Don't fail registration just because the email didn't send —
        // log it so it shows up in the server console for debugging.
        console.log('SendGrid verification email failed: ' + e.message);
      }
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

app.post('/api/verifyemail', async (req, res, next) =>
{
  // incoming: token
  // outgoing: verified, error
 
  var error = '';
  const { token: verificationToken } = req.body;
 
  const db = client.db('MTG');
  const results = await db.collection('Users').find({verificationToken:verificationToken}).toArray();
 
  var verified = false;
 
  if( results.length > 0 )
  {
    await db.collection('Users').updateOne(
      { _id: results[0]._id },
      { $set: { verified:true, verificationToken:'' } }
    );
    verified = true;
  }
  else
  {
    error = 'Invalid or expired verification link';
  }
 
  var ret = { verified:verified, error:error };
  res.status(200).json(ret);
});

app.post('/api/requestpasswordreset', async (req, res, next) =>
{
  // incoming: email
  // outgoing: error
 
  var error = '';
  const { email } = req.body;
 
  const db = client.db('MTG');
  const results = await db.collection('Users').find({email:email}).toArray();
 
  if( results.length > 0 )
  {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
 
    await db.collection('Users').updateOne(
      { _id: results[0]._id },
      { $set: { resetToken:resetToken, resetTokenExpiry:resetTokenExpiry } }
    );
 
    try
    {
      await sendPasswordResetEmail(email, resetToken);
    }
    catch(e)
    {
      console.log('SendGrid password reset email failed: ' + e.message);
    }
  }
 
  // Always return success, whether or not the email was found — this
  // keeps the endpoint from revealing which emails are registered.
  var ret = { error:error };
  res.status(200).json(ret);
});
 
app.post('/api/resetpassword', async (req, res, next) =>
{
  // incoming: token, password
  // outgoing: reset, error
 
  var error = '';
  const { token: resetToken, password } = req.body;
 
  const db = client.db('MTG');
  const results = await db.collection('Users').find({resetToken:resetToken}).toArray();
 
  var reset = false;
 
  if( results.length > 0 && results[0].resetTokenExpiry && new Date(results[0].resetTokenExpiry) > new Date() )
  {
    await db.collection('Users').updateOne(
      { _id: results[0]._id },
      { $set: { password:password, resetToken:'', resetTokenExpiry:null } }
    );
    reset = true;
  }
  else
  {
    error = 'Invalid or expired reset link';
  }
 
  var ret = { reset:reset, error:error };
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
    if( results[0].verified === false )
    {
      ret = { error: 'Please verify your email before logging in' };
    }
    else
    {
      try
      {
        ret = token.createToken(results[0].name, results[0]._id);
      }
      catch(e)
      {
        ret = { error: e.message };
      }
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
      { _id:        ObjectId.isValid(_search) ? new ObjectId(_search) : null },
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
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
      {userID:new ObjectId(userID.id), cardID:new ObjectId(cardID)}
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
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
        total:       results[i].total,
        CardName:    results[i].CardName,
        ...buildCardObject(results[i].card)
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
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
          (!isNaN(_search)  && card.cmc === Number(_search))                      ||
          (ObjectId.isValid(_search) && card._id.toString().toLowerCase() === _search);
 
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
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
 
app.post('/api/getdecksbycardin', async (req, res, next) =>
{
  // incoming: jwtToken, userId, cardId
  // outgoing: deckIDs[], error, jwtToken
  // Finds which of the given user's decks contain the given card,
  // and returns just their deckIDs (the cover _id each deck is
  // linked to — the same id used by addcardtodeck/removecardfromdeck).
 
  var error = '';
  const { jwtToken, userId, cardId } = req.body;
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

  const results = await db.collection('Decks').find({
    userId: new ObjectId(userId),
    cards: { $in: [new ObjectId(cardId)] }
  }).toArray();
 
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( results[i] );
    }
  }
  catch(e)
  {
    error = e.toString();
  }
 
  var refreshedToken = null;
  try
  {
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});

app.post('/api/getdecksbycardout', async (req, res, next) =>
{
  // incoming: jwtToken, userId, cardId
  // outgoing: deckIDs[], error, jwtToken
  // Finds which of the given user's decks contain the given card,
  // and returns just their deckIDs (the cover _id each deck is
  // linked to — the same id used by addcardtodeck/removecardfromdeck).
 
  var error = '';
  const { jwtToken, userId, cardId } = req.body;
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

    const results = await db.collection('Decks').find({
      userId: new ObjectId(userId),
      cards: { $ne: new ObjectId(cardId) }
    }).toArray();
 
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( results[i] );
    }
  }
  catch(e)
  {
    error = e.toString();
  }
 
  var refreshedToken = null;
  try
  {
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});

app.post('/api/createdeck', async (req, res, next) =>
{
  // incoming: jwtToken, userId, deckName, public
  // outgoing: id, deckID, error, jwtToken
  // Creates a "cover" document in deck (the browsable/searchable
  // summary) and a matching contents document in Decks (holds the
  // actual card list), linked via Decks.deckID = deck._id.

  var error = '';
  const { jwtToken, userId, deckName, public: isPublic } = req.body;
  var id = -1;
  var deckID = null;

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
    var r = { error: 'Invalid JWT', jwtToken: '' };
    res.status(200).json(r);
    return;
  }

  if( !userId || !ObjectId.isValid(userId) )
  {
    var r = { error: 'Invalid or missing userId', jwtToken: '' };
    res.status(200).json(r);
    return;
  }

  const userObjectId = new ObjectId(userId);

  try
  {
    const db = client.db('MTG');

    const newCover = {
      name: deckName,
      public: isPublic === true,
      userID: userObjectId
    };
    const coverResult = await db.collection('deck').insertOne(newCover);
    id = coverResult.insertedId;
    deckID = id;

    const newDeck = {
      userId: userObjectId,
      deckName: deckName,
      cards: [],
      public: isPublic === true,
      deckID: deckID
    };
    await db.collection('Decks').insertOne(newDeck);
  }
  catch(e)
  {
    error = e.toString();
  }

  var refreshedToken = null;
  try
  {
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken;
  }
  catch(e)
  {
    console.log(e.message);
  }

  var ret = { id:id, deckID:deckID, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});
 
app.post('/api/addcardtodeck', async (req, res, next) =>
{
  // incoming: jwtToken, deckId, cardId, quantity
  // outgoing: error, jwtToken
 
  var error = '';
  const { jwtToken, deckId, cardId, quantity } = req.body; // QUANTITY DOES NOTHING

  function normalizeObjectId(value)
  {
    if( !value ) return '';
    if( typeof value === 'string' ) return value;
    if( typeof value === 'object' && typeof value.$oid === 'string' ) return value.$oid;
    if( value.toHexString ) return value.toHexString();
    var asString = String(value);
    return asString === '[object Object]' ? '' : asString;
  }

  const normalizedDeckId = normalizeObjectId(deckId);
  const normalizedCardId = normalizeObjectId(cardId);
 
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
    if( !ObjectId.isValid(normalizedDeckId) || !ObjectId.isValid(normalizedCardId) )
    {
      error = 'Invalid deck or card id';
    }

    if( error.length === 0 )
    {
      const db = client.db('MTG');
    
      const deck = await db.collection('Decks').findOne({ _id: new ObjectId(normalizedDeckId) });
    
      if( !deck )
      {
        error = 'Deck not found';
      }
      else
      {
        const ownerUserIdString = normalizeObjectId(deck.userId);
        const ownerUserId = ObjectId.isValid(ownerUserIdString) ? new ObjectId(ownerUserIdString) : null;

        if( !ownerUserId )
        {
          error = 'Deck owner is invalid';
        }
        else
        {
          const inventoryEntry = await db.collection('Inventory').findOne({
            userID: ownerUserId,
            cardID: new ObjectId(normalizedCardId)
          });

          if( !inventoryEntry )
          {
            error = 'You can only add cards that are in your inventory.';
          }

          const deckCards = Array.isArray(deck.cards) ? deck.cards : [];
          const existingCard = deckCards.some((element) => normalizeObjectId(element) === normalizedCardId);
    
          if( error.length > 0 )
          {
            // Restriction already set.
          }
          else if( existingCard )
          {
            error = 'The card is already in this deck!';
          }
          else
          {
            await db.collection('Decks').updateOne(
              { _id: new ObjectId(normalizedDeckId) },
              { $push: { cards: new ObjectId(normalizedCardId) /*{ cardId: , quantity: quantity } */ } }
            );
          }
        }
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken;
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
 
    if( !deck )
    {
      error = 'Deck not found';
    }
    else
    {
      const existingCard = deck.cards.find(c => c.toString() === cardId);
      deck.cards.forEach((element) => {
        console.log(element.toString() === cardId);
      });
 
      if( !existingCard )
      {
        error = 'Card not found in deck';
      }
      else
      {
        var newQuantity = existingCard.quantity - quantity;
 
        // Fully removed — drop the card entry from the array.
        await db.collection('Decks').updateOne(
          { _id: new ObjectId(deckId) },
          { $pullAll: { cards: [new ObjectId(cardId)] } }
        );
      
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
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
  // incoming: jwtToken, userId, search
  // outgoing: results[], error, jwtToken
  // search is optional — leave it blank/omitted to get all of the
  // user's decks (old getdecks behavior), or pass a term to filter
  // by deckName / deckID / _id (old searchdecks behavior).
 
  var error = '';
  const { jwtToken, userId, search } = req.body;
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
 
    var query = { userId: new ObjectId(userId) };
 
    if( search && search.trim() !== '' )
    {
      var _search = search.trim();
      var orConditions = [
        { deckName: { $regex: _search, $options: 'i' } },
      ];
 
      if( ObjectId.isValid(_search) )
      {
        orConditions.push({ _id: new ObjectId(_search) });
        orConditions.push({ deckID: new ObjectId(_search) });
      }
 
      query.$or = orConditions;
    }
 
    const results = await db.collection('Decks').find(query).toArray();
 
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( {
        id:       results[i]._id,
        deckID:   results[i].deckID,
        deckName: results[i].deckName,
        cards:    results[i].cards,
        public:   results[i].public
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});

app.post('/api/removedeck', async (req, res, next) =>
{
  // incoming: jwtToken, deckId
  // outgoing: error, jwtToken
  // Removes the deck cover AND its matching contents in Decks,
  // matched on deckID (the cover's _id) + deckName, per spec.
 
  var error = '';
  const { jwtToken, deckId } = req.body;
 
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
 
    const cover = await db.collection('deck').findOne({ _id: new ObjectId(deckId) });
 
    if( cover )
    {
      await db.collection('Decks').deleteOne({
        deckID: cover._id,
        deckName: cover.name
      });
 
      await db.collection('deck').deleteOne({ _id: cover._id });
    }
    else
    {
      error = 'Deck not found';
    }
  }
  catch(e)
  {
    error = e.toString();
  }
 
  var refreshedToken = null;
  try
  {
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});

app.post('/api/searchpublicdecks', async (req, res, next) =>
{
  // incoming: jwtToken, search
  // outgoing: results[], error, jwtToken
  // Searches public deck covers across all users (the deck collection).
 
  var error = '';
  const { jwtToken, search } = req.body;
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
 
    var query = { public: true };
 
    if( search && search.trim() !== '' )
    {
      var _search = search.trim();
      var orConditions = [
        { name: { $regex: _search, $options: 'i' } },
      ];
 
      if( ObjectId.isValid(_search) )
      {
        orConditions.push({ _id: new ObjectId(_search) });
      }
 
      query.$or = orConditions;
    }
 
    const results = await db.collection('deck').find(query).toArray();
 
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( {
        id:     results[i]._id,
        name:   results[i].name,
        userID: results[i].userID
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
    var refreshedResult = token.refresh(jwtToken);
    refreshedToken = refreshedResult.accessToken
  }
  catch(e)
  {
    console.log(e.message);
  }
 
  var ret = { results:_ret, error:error, jwtToken:refreshedToken };
  res.status(200).json(ret);
});

}