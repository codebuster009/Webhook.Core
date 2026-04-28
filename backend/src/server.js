const express = require('express');
const app = express();

app.get('/healthz', (req, res) => {
  res.json({ ok: true, data: { ok: true, db: false } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
