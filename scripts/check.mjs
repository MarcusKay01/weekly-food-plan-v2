import{readdirSync,readFileSync}from'node:fs';import{execFileSync}from'node:child_process';
for(const path of readdirSync('.').filter(x=>x.endsWith('.js')))execFileSync(process.execPath,['--check',path]);
const html=readFileSync('index.html','utf8');for(const id of [...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1])){if([...html.matchAll(new RegExp('id="'+id+'"','g'))].length!==1)throw new Error('Duplicate ID: '+id)}
if(html.includes('rustic-stone-continuation'))throw new Error('Large background returned');
console.log('Module syntax and shell checks passed');
