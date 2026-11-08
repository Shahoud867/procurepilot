import type {State,Ingredient,Scenario} from './types';
export const restaurants=[{id:'margalla',name:'Margalla Table',location:'F-7 Markaz · Islamabad',type:'Casual dining'},{id:'potohar',name:'Potohar Café',location:'Satellite Town · Rawalpindi',type:'Café & kitchen'},{id:'bakehouse',name:'Twin Cities Bakehouse',location:'Bahria Town · Rawalpindi',type:'Bakery & café'}];
export function rng(seed:number){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const day=(d:string,n:number)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
export const round=(n:number)=>Math.round(n*100)/100;
export function seedState(id='margalla',seed=42):State{
 const random=rng(seed+restaurants.findIndex(r=>r.id===id)*17),asOf='2026-11-08';
 const rows:[string,string,string,string,number,number,number,number][]=[['chicken','Chicken breast','Protein','kg',5,820,7,18],['flour','All-purpose flour','Dry goods','kg',10,165,10,12],['oil','Cooking oil','Pantry','L',5,560,5,6],['milk','Fresh milk','Dairy','L',6,240,6,15],['rice','Basmati rice','Dry goods','kg',5,360,5,10],['tomato','Tomatoes','Produce','kg',5,180,5,9],['onion','Onions','Produce','kg',5,150,5,10],['sugar','White sugar','Dry goods','kg',5,165,3,5],['butter','Unsalted butter','Dairy','kg',1,2450,1,2],['coffee','Coffee beans','Beverages','kg',1,3900,0.5,1.2],['cream','Dairy cream','Dairy','L',1,1050,1,2.5],['eggs','Eggs','Protein','dozen',1,360,1,3]];
 const ingredients:Ingredient[]=rows.map(([id,name,category,unit,pack,referencePrice,safety,daily])=>({id,name,category,unit,pack,referencePrice,safety,storage:Math.ceil(daily*12),maxCover:['Produce','Dairy','Protein'].includes(category)?5:14,grade:'Approved standard'}));
 const s:State={synthetic:true,restaurant:restaurants.find(r=>r.id===id)||restaurants[0],seed,asOf,scenario:'ordinary',inputVersion:1,budget:140000,horizon:3,fee:10000,ingredients,lots:[],movements:[],usage:[],suppliers:[{id:'s1',name:'Capital Fresh Co.',area:'I-11 Wholesale Market',delivery:450,leadDays:1,minimum:0,approved:true,deliveries:40,onTime:38,accepted:990,received:1000},{id:'s2',name:'Potohar Food Supply',area:'Raja Bazaar, Rawalpindi',delivery:650,leadDays:1,minimum:0,approved:true,deliveries:32,onTime:29,accepted:945,received:960},{id:'s3',name:'Metro Pantry Partners',area:'I-10, Islamabad',delivery:350,leadDays:1,minimum:0,approved:true,deliveries:24,onTime:23,accepted:714,received:720}],quotes:[],plans:[],receipts:[],bidRounds:[],settings:{minimumReliability:0.8}};
 const active=new Map<string,{qty:number;id:string;expires:string;received:string}[]>();
 ingredients.forEach((i,ix)=>{let lots:{qty:number;id:string;expires:string;received:string}[]=[];active.set(i.id,lots);for(let t=-89;t<=0;t++){const date=day(asOf,t),weekday=new Date(date).getUTCDay();const base=rows[ix][7]*(id==='potohar'?0.76:id==='bakehouse'?(i.category==='Dry goods'?1.3:0.6):1);const desired=round(base*([0,5,6].includes(weekday)?1.19:0.92)*(0.88+random()*.24));
   for(const lot of lots.filter(l=>l.expires<date&&l.qty>0)){s.movements.push({id:`w-${i.id}-${t}`,ingredientId:i.id,date,type:'waste',qty:-round(lot.qty),reference:lot.id});lot.qty=0;}
   let stock=lots.reduce((n,l)=>n+l.qty,0);if(stock<desired&&t<-1){const qty=Math.ceil((desired*(i.maxCover<=5?3:6)-stock)/i.pack)*i.pack;const lot={id:`lot-${i.id}-${t}`,qty,expires:day(date,i.maxCover<=5?5:60),received:date};lots.push(lot);s.movements.push({id:`r-${i.id}-${t}`,ingredientId:i.id,date,type:'receipt',qty,reference:lot.id});stock+=qty;}
   let remaining=Math.min(stock,desired);const actual=round(remaining);for(const lot of lots.sort((a,b)=>a.expires.localeCompare(b.expires))){const used=Math.min(lot.qty,remaining);lot.qty=round(lot.qty-used);remaining=round(remaining-used);if(remaining<=0)break;}
   s.usage.push({ingredientId:i.id,date,qty:actual,stockout:actual+0.02<desired,closed:false});s.movements.push({id:`u-${i.id}-${t}`,ingredientId:i.id,date,type:'consumption',qty:-actual,reference:'historical synthetic kitchen usage'});
  }s.lots.push(...lots.filter(l=>l.qty>0).map(l=>({...l,ingredientId:i.id})));s.suppliers.forEach((supplier,j)=>{const multiplier=j===0?1:j===1?(ix%3===0?.91:.96):(ix%3===1?.90:.975);s.quotes.push({id:`q-${supplier.id}-${i.id}`,supplierId:supplier.id,ingredientId:i.id,price:round(i.referencePrice*multiplier),pack:i.pack,capacity:Math.ceil(rows[ix][7]*(j===2?3:6)/i.pack)*i.pack,validUntil:day(asOf,5),confirmedAt:asOf,grade:i.grade});});});
 return s;
}
export function applyScenario(s:State,scenario:Scenario):State{
 const n=seedState(s.restaurant.id,s.seed);n.inputVersion=s.inputVersion+1;n.scenario=scenario;n.plans=s.plans;n.receipts=s.receipts;n.bidRounds=s.bidRounds;n.fee=s.fee;
 if(scenario==='shortage')n.quotes.filter(q=>q.ingredientId==='chicken'&&q.supplierId!=='s1').forEach(q=>q.capacity=0);
 if(scenario==='spike'){n.horizon=3;n.budget=190000;}
 if(scenario==='volatile')n.quotes.filter(q=>['chicken','oil'].includes(q.ingredientId)&&q.supplierId==='s1').forEach(q=>q.price=round(q.price*1.28));
 if(scenario==='unreliable'){n.suppliers[1].onTime=17;}
 if(scenario==='budget')n.budget=15000;
 if(scenario==='no-savings')n.quotes.filter(q=>q.supplierId!=='s1').forEach(q=>q.price=round(q.price*1.3));
 return n;
}
