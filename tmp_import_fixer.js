const fs = require('fs');
const path = require('path');
const files = [
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/audit-logs/route.ts',
  'app/api/upload-b3/route.ts',
  'app/api/contas/route.ts',
  'app/api/clientes/route.ts',
  'app/api/instituicoes/route.ts',
  'app/api/tipos-investimento/route.ts',
  'app/clientes/page.tsx',
  'app/contas/page.tsx',
  'app/posicoes/page.tsx'
];
const root = 'C:/dev/gerinvest';
const replacements = [
  ['@/lib/authGuard', '../../../src/lib/authGuard'],
  ['@/lib/audit', '../../../src/lib/audit'],
  ['@/lib/schemas', '../../../src/lib/schemas'],
  ['@/lib/apiHelper', '../../../src/lib/apiHelper'],
  ['@/lib/db', '../../../src/lib/db'],
  ['@/lib/auth', '../../../src/lib/auth'],
];
files.forEach((f) => {
  const p = path.join(root, ...f.split('/'));
  if (!fs.existsSync(p)) {
    console.log('skip', f);
    return;
  }
  let c = fs.readFileSync(p, 'utf8');
  replacements.forEach(([a,b]) => { c = c.split(a).join(b); });
  fs.writeFileSync(p, c, 'utf8');
  console.log('updated', f);
});
