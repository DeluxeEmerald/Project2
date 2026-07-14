const jwt = require('jsonwebtoken');
require('dotenv').config();

// Creates a JWT token using the user's id and name
exports.createToken = function(name, id)
{
  try
  {
    const user = { userId: id, name: name };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
    return { accessToken: accessToken };
  }
  catch(e)
  {
    return { error: e.message };
  }
}

// Returns true if the token is expired or invalid
exports.isExpired = function(token)
{
  try
  {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return false;
  }
  catch(e)
  {
    return true;
  }
}

// Returns a fresh token with the same payload
exports.refresh = function(token)
{
  try
  {
    const ud = jwt.decode(token, { complete: true });
    return exports.createToken(ud.payload.name, ud.payload.userId);
  }
  catch(e)
  {
    return { error: e.message };
  }
}