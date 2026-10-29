const { execSync } = require('child_process');
execSync('ssh-keygen -t ed25519 -N "" -f C:\\Users\\visha\\.ssh\\id_ed25519');
console.log('SSH Key generated successfully!');

