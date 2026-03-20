const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, 'frontend/src/pages/AdminDashboard.tsx'),
  path.join(__dirname, 'frontend/src/pages/CoordinatorDashboard.tsx')
];

for (const file of filesToPatch) {
  let content = fs.readFileSync(file, 'utf8');

  // Insert roleMap global dictionary right after imports
  if (!content.includes('const roleMap')) {
    content = content.replace(/(const LOGO_URL = [^;]+;)/, '$1\n\nconst roleMap: Record<string, string> = {\n  ADMIN: \'ADMINISTRADOR\',\n  SPECIALIST: \'ESPECIALISTA\',\n  COORDINATOR: \'COORDINADOR\',\n  CLIENT: \'PACIENTE\'\n};');
  }

  // Find all instances of {user.role} or {u.role} rendering the raw text
  // The table typically renders: {user.role} inside a span or td.
  content = content.replace(/\{user\.role\}/g, '{roleMap[user.role] || user.role}');
  content = content.replace(/\{u\.role\}/g, '{roleMap[u.role] || u.role}');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Role UI map successfully injected!');
