#!/usr/bin/env node

import { spawn } from 'child_process';

const port = process.env.PORT || 3000;

console.log(`Starting server on port ${port}...`);

const serve = spawn('npx', ['serve', '-s', 'dist', '-p', port], {
  stdio: 'inherit',
  shell: true
});

serve.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serve.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});