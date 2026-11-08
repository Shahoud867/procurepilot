import {serve} from '@hono/node-server';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdirSync,readdirSync} from 'node:fs';
import app from './app';
import type {Database,Statement} from './app';
mkdirSync('.local',{recursive:true});const sqlite=new DatabaseSync('.local/procurepilot.db');sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations(name TEXT PRIMARY KEY)');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){if(!sqlite.prepare('SELECT name FROM local_migrations WHERE name=?').get(file)){sqlite.exec(readFileSync('drizzle/'+file,'utf8'));sqlite.prepare('INSERT INTO local_migrations(name) VALUES(?)').run(file);}}
function prepared(sql:string,args:any[]=[]):Statement{return{bind(...a:any[]){return prepared(sql,a)},async first<T>(){return (sqlite.prepare(sql).get(...args)||null) as T|null},async all<T>(){return{results:sqlite.prepare(sql).all(...args) as T[]}},async run(){const r=sqlite.prepare(sql).run(...args);return{meta:{changes:Number(r.changes)}}}};}
const db:Database={prepare:prepared,async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const results=[];for(const st of statements)results.push(await st.run());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};
const args=process.argv;const portIndex=args.indexOf('--port');const hostIndex=args.indexOf('--host');const port=portIndex>=0?Number(args[portIndex+1]):Number(process.env.PORT||4173);const hostname=hostIndex>=0?args[hostIndex+1]:'127.0.0.1';
serve({fetch:(req)=>app.fetch(req,{DB:db,LOCAL_DEMO:true,HTML:readFileSync('dist/client.html','utf8'),SOURCE:readFileSync('dist/source.b64','utf8')}),port,hostname},info=>console.log(`ProcurePilot local synthetic demo http://${hostname}:${info.port}`));
