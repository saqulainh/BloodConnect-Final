const fs = require('fs');
const { execSync } = require('child_process');

const files = fs.readFileSync('files.txt', 'utf16le')
  .split('\n')
  .map(l => l.trim().replace(/^frontend\//, '').replace(/^"|"$/g, ''))
  .filter(l => l.endsWith('.jsx'));

const originals = {};
for (const file of files) {
  if (fs.existsSync(file)) {
    originals[file] = fs.readFileSync(file, 'utf8');
    const name = file.split('/').pop().replace('.jsx', '');
    fs.writeFileSync(file, 'export default function ' + name + '() { return null; }\n');
  }
}

try {
  execSync('npx vite build', {stdio: 'ignore'});
  console.log('Baseline passes! Starting test...');
} catch(e) {
  console.log('BASELINE FAILS! Bug is NOT in these 38 files!');
  for (const file in originals) fs.writeFileSync(file, originals[file]);
  process.exit(1);
}

fs.writeFileSync('bisect3_results.txt', '');
for (const file in originals) {
  fs.writeFileSync(file, originals[file]); 
  try {
    execSync('npx vite build', {stdio: 'ignore'});
    console.log('✅ SAFE: ' + file);
    fs.appendFileSync('bisect3_results.txt', '✅ SAFE: ' + file + '\n');
  } catch(e) {
    console.log('❌ BUGGY!: ' + file);
    fs.appendFileSync('bisect3_results.txt', '❌ BUGGY: ' + file + '\n');
  } finally {
    const name = file.split('/').pop().replace('.jsx', '');
    fs.writeFileSync(file, 'export default function ' + name + '() { return null; }\n'); 
  }
}

for (const file in originals) fs.writeFileSync(file, originals[file]);
console.log('Done reporting to bisect3_results.txt');
