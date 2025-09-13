// minimal Express; we'll grow this into proper MVC later
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
