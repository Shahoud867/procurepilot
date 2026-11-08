import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import app from '../server/app';
import type {Database,Statement} from '../server/app';
export function harness(){const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
 function prep(sql:string,args:any[]=[]):Statement{return{bind(...a:any[]){return prep(sql,a)},async first<T>(){return(sqlite.prepare(sql).get(...args)||null) as T|null},async all<T>(){return{results:sqlite.prepare(sql).all(...args) as T[]}},async run(){const r=sqlite.prepare(sql).run(...args);return{meta:{changes:Number(r.changes)}}}};}
 const db:Database={prepare:prep,async batch(st){sqlite.exec('BEGIN IMMEDIATE');try{const results=[];for(const q of st)results.push(await q.run());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};
 return{sqlite,db,async request(path:string,body?:any,user='alice',extra:Record<string,string>={}){const req=new Request('http://localhost'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','x-local-user':user,...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});const response=await app.fetch(req,{DB:db,LOCAL_DEMO:true,HTML:'<!doctype html><title>ProcurePilot</title>'});const text=await response.text();let data:any;try{data=JSON.parse(text)}catch{data=text}return{status:response.status,data,headers:response.headers};},app};}
