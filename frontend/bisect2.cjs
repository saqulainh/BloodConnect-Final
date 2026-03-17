const fs = require('fs');
const { execSync } = require('child_process');

const files = fs.readFileSync('files.txt', 'utf16le')
  .split('\n')
  .map(l => l.trim().replace(/^frontend\//, '').replace(/^"|"$/g, ''))
  .filter(l => l.endsWith('.jsx'));

console.log('Testing ' + files.length + ' files...');
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} as it doesn't exist`);
    continue;
  }
  const orig = fs.readFileSync(file, 'utf8');
  try {
    const name = file.split('/').pop().replace('.jsx', '');
    fs.writeFileSync(file, 'export default function ' + name + '() { return null; }\n');
    execSync('npx vite build', {stdio: 'pipe'});
    console.log('✅ BUG FOUND IN: ' + file);
    fs.appendFileSync('bisect_results.txt', '✅ BUG IN: ' + file + '\n');
  } catch(e) {
    fs.appendFileSync('bisect_results.txt', '❌ Not (solely) ' + file + ' : ' + e.message + '\n');
    console.log('❌ Not ' + file);
  } finally {
    fs.writeFileSync(file, orig);
  }
}
console.log('Done.');
