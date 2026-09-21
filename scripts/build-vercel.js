const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- [FarmShield Vercel Build Script Starting] ---');
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

if (!fs.existsSync(frontendDir) && fs.existsSync(path.join(rootDir, 'src', 'app'))) {
  console.log('Building directly inside frontend directory with next build...');
  execSync('npx next build', { stdio: 'inherit', cwd: rootDir });
  process.exit(0);
}

console.log('Running build in frontend directory...');
execSync('npm --prefix frontend run build', { stdio: 'inherit', cwd: rootDir });

const srcNext = path.join(frontendDir, '.next');
const destNext = path.join(rootDir, '.next');
if (fs.existsSync(srcNext)) {
  console.log('Syncing frontend/.next to root .next...');
  fs.cpSync(srcNext, destNext, { recursive: true });
}

const srcPublic = path.join(frontendDir, 'public');
const destPublic = path.join(rootDir, 'public');
if (fs.existsSync(srcPublic)) {
  console.log('Syncing frontend/public to root public...');
  fs.cpSync(srcPublic, destPublic, { recursive: true });
}

console.log('--- [FarmShield Vercel Build Complete Successfully] ---');
