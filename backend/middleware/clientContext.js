const { isKey, diffDays, utcToday } = require('../utils/dates');

/**
 * El navegador manda su fecha y hora local (X-Client-Date / X-Client-Hour) para que "hoy" y las rachas
 * respeten la zona horaria del usuario. Se acepta solo si es coherente con la fecha UTC (máx. ±1 día),
 * así no se puede falsear la fecha para hacer trampa.
 */
module.exports = (req, res, next) => {
  const server = utcToday();
  const sent = req.headers['x-client-date'];
  req.today = isKey(sent) && Math.abs(diffDays(sent, server)) <= 1 ? sent : server;
  const hour = Number(req.headers['x-client-hour']);
  req.hour = Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
  next();
};
