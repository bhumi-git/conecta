const fs = require('fs');
const path = require('path');

const nestedPath = 'src/pages/src';
const cwd = process.cwd();

console.log('📁 Checking file structure...');
console.log(`Current working directory: ${cwd}\n`);

try {
  if (fs.existsSync(nestedPath)) {
    console.log(`🗑️  Found duplicate nested folder: ${nestedPath}`);
    fs.rmSync(nestedPath, { recursive: true, force: true });
    console.log('✅ Successfully removed nested duplicate folders!\n');
  } else {
    console.log('✅ No duplicate nested folders found\n');
  }
  
  console.log('📂 Current src/pages/ structure:');
  const pagesDir = 'src/pages';
  const files = fs.readdirSync(pagesDir).sort();
  files.forEach(file => {
    const stat = fs.statSync(path.join(pagesDir, file));
    const icon = stat.isDirectory() ? '📁' : '📄';
    console.log(`  ${icon} ${file}`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
