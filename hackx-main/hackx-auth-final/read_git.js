const { execSync } = require('child_process');
const fs = require('fs');

try {
  const diff = execSync('git log -p -2 app/page.tsx').toString('utf8');
  fs.writeFileSync('git_output.txt', diff);
  console.log("Wrote diff");
} catch (e) {
  console.log(e.message);
}
