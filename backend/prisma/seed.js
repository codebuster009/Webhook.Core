const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', '..', 'scripts', 'seed-demo.js');
const res = spawnSync(process.execPath, [script], {
  stdio: 'inherit',
  env: { ...process.env },
});
process.exit(res.status === null ? 1 : res.status);
