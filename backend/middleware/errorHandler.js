const notFound = (req, res) => res.status(404).json({ message: 'Ruta no encontrada' });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON inválido' });
  if (err.code === '23505') return res.status(409).json({ message: 'Ese valor ya existe' });
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
};

module.exports = { notFound, errorHandler };
