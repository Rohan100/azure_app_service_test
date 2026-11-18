// Load local environment variables before the app reads its configuration.
require('dotenv').config();

const app = require('./src/app');

const port = Number(process.env.PORT) || 3000;

// App Service supplies PORT. Binding to 0.0.0.0 makes the app reachable in its container.
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`${process.env.APP_NAME || 'TechMart'} listening on 0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Allow the process manager to stop the server cleanly during restarts or deployments.
function shutDown(signal) {
  console.log(`${signal} received. Closing HTTP server...`);
  server.close((error) => {
    if (error) {
      console.error('Error while closing the HTTP server:', error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGINT', () => shutDown('SIGINT'));

server.on('error', (error) => {
  console.error('HTTP server failed to start:', error);
  process.exit(1);
});
