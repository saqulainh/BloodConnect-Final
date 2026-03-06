import { execSync } from 'child_process';
try {
    const out = execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' });
    console.log(out);
} catch (err) {
    console.error("VITE BUILD FAILED!");
    console.error("STDOUT:", err.stdout);
    console.error("STDERR:", err.stderr);
}
