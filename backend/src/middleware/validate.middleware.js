function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return res.status(400).json({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message },
      });
    }
    req.validated = req.validated || {};
    req.validated.body = value;
    return next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return res.status(400).json({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message },
      });
    }
    req.validated = req.validated || {};
    req.validated.query = value;
    return next();
  };
}

module.exports = { validateBody, validateQuery };
