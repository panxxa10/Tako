const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { clientUrls, isTest } = require('./config/env');
const clientContext = require('./middleware/clientContext');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Render (y otros hosts) ponen un proxy delante: necesario para que el rate limit vea la IP real.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(clientUrls.length ? { origin: clientUrls } : undefined));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

app.use('/api', clientContext);
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/me', require('./routes/meRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/insights', require('./routes/insightsRoutes'));
app.use('/api/focus', require('./routes/focusRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
