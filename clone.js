const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'frontend/src/pages/AdminDashboard.tsx');
const coordPath = path.join(__dirname, 'frontend/src/pages/CoordinatorDashboard.tsx');

let content = fs.readFileSync(adminPath, 'utf8');

// 1. Rename Component
content = content.replace(/const AdminDashboard = \(\) => {/g, 'const CoordinatorDashboard = () => {');
content = content.replace(/export default AdminDashboard;/g, 'export default CoordinatorDashboard;');

// 2. Change Header Branding
content = content.replace(
  /<span className="font-bold text-\[15px\] tracking-tight text-slate-100">Agenda Clínica <span className="text-\[#00A89C\]">Equilibrar<\/span><\/span>/g,
  '<span className="font-bold text-[15px] tracking-tight text-slate-100">Portal <span className="text-secondary">Coordinador</span></span>'
);

// 3. Change Profile Avatar Badge
content = content.replace(
  /<div className="w-9 h-9 bg-\[#00A89C\] rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-\[#1e293b\]">AD<\/div>/g,
  '<div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-[#1e293b]">CO</div>'
);
content = content.replace(
  /<div className="text-sm font-bold leading-tight">Super Admin<\/div>/g,
  '<div className="text-sm font-bold leading-tight">Mesa de Ayuda</div>'
);
content = content.replace(
  /<div className="text-\[10px\] text-emerald-400 font-mono">EN LÍNEA<\/div>/g,
  '<div className="text-[10px] text-blue-400 font-mono">OPERATIVO</div>'
);

// 4. Remove User 'Borrar' button
content = content.replace(
  /<button onClick=\{\(\) => handleDeleteUser\(user\.id\)\} className="text-red-500 hover:bg-red-100 font-bold text-xs bg-red-50 px-3 py-1\.5 rounded-md transition-colors">Borrar<\/button>/g,
  ''
);

// 5. Remove Service 'Borrar' button (if exists)
content = content.replace(
  /<button onClick=\{\(\) => handleDeleteService\(svc\.id\)\} className="text-red-500 hover:bg-red-100 font-bold text-xs bg-red-50 px-3 py-1\.5 rounded-md transition-colors">Borrar<\/button>/g,
  ''
);

fs.writeFileSync(coordPath, content, 'utf8');
console.log('CoordinatorDashboard synthesized with Admin restrictions!');
