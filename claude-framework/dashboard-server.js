const LogDashboard = require('./dashboard');

// Standalone dashboard server
const dashboard = new LogDashboard(3000, './logs');
dashboard.start();

console.log('Claude Framework Dashboard started');
console.log('Open http://localhost:3000 in your browser');
console.log('Press Ctrl+C to stop');