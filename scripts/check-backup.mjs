import {DatabaseSync} from 'node:sqlite';
const file=process.argv[2];if(!file){console.error('Usage: node scripts/check-backup.mjs <database-copy>');process.exit(1)}
const db=new DatabaseSync(file,{readOnly:true});const integrity=db.prepare('PRAGMA integrity_check').get();if(Object.values(integrity)[0]!=='ok')throw new Error('Backup integrity check failed');
console.log('SQLite integrity: ok');for(const table of ['workspaces','members','audit'])console.log(table,db.prepare(`SELECT count(*) AS count FROM ${table}`).get().count);db.close();
