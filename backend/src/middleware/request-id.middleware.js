const { v4: uuidv4 } = require('uuid');

function requestIdMiddleware(req, res, next) {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
}

module.exports = { requestIdMiddleware };
