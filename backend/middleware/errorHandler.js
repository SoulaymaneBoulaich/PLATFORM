const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const logPath = path.join(__dirname, '../error.log');
  const logEntry = `[${new Date().toISOString()}] ${err.stack}\n\n`;

  fs.appendFile(logPath, logEntry, (writeErr) => {
    if (writeErr) console.error('Failed to write to error log', writeErr);
  });

  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
