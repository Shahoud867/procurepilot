export type Role='owner'|'manager'|'storekeeper'|'viewer';
export type Scenario='ordinary'|'shortage'|'spike'|'volatile'|'unreliable'|'budget'|'no-savings';
export interface Ingredient {id:string;name:string;category:string;unit:string;pack:number;referencePrice:number;safety:number;storage:number;maxCover:number;grade:string;}
export interface Lot {id:string;ingredientId:string;qty:number;expires:string;received:string;}
export interface Movement {id:string;ingredientId:string;date:string;type:'receipt'|'consumption'|'waste'|'adjustment';qty:number;reference:string;}
export interface Usage {ingredientId:string;date:string;qty:number;stockout:boolean;closed:boolean;}
export interface Supplier {id:string;name:string;area:string;delivery:number;leadDays:number;minimum:number;approved:boolean;deliveries:number;onTime:number;accepted:number;received:number;}
export interface Quote {id:string;supplierId:string;ingredientId:string;price:number;pack:number;capacity:number;validUntil:string;confirmedAt:string;grade:string;}
export interface Forecast {ingredientId:string;model:string;daily:number;total:number;lower:number;upper:number;mae:number;wape:number|null;observations:number;history:{date:string;qty:number}[];}
export interface Need {ingredientId:string;stock:number;expiring:number;demand:number;buffer:number;required:number;packRequired:number;forecast:Forecast;}
export interface PlanLine {ingredientId:string;supplierId:string;packs:number;qty:number;unitPrice:number;cost:number;reason:string;}
export interface Trace {agent:string;status:'pass'|'warning'|'blocked';summary:string;details:string[];durationMs:number;}
export interface Plan {id:string;createdAt:string;inputVersion:number;status:'proposed'|'approved'|'rejected'|'received';scenario:Scenario;lines:PlanLine[];needs:Need[];cost:number;productCost:number;deliveryCost:number;baseline:number|null;savings:number|null;baselineMethod:string;baselineFeasible:boolean;warnings:string[];errors:string[];traces:Trace[];optimal:boolean;approvedBy?:string;approvedAt?:string;decisionReason?:string;receivedAt?:string;receiptCost?:number;}
export interface BidRound {id:string;createdAt:string;ingredientId:string;qty:number;privateCosts:{supplierId:string;cost:number;bid:number}[];winner:string;payment:number;firstPrice:number;winnerUtility:number;}
export interface Receipt {id:string;planId:string;date:string;cost:number;baseline:number|null;priceVariance:number|null;qualityAccepted:number;qualityRejected:number;note:string;}
export interface State {synthetic:true;restaurant:{id:string;name:string;location:string;type:string};seed:number;asOf:string;scenario:Scenario;inputVersion:number;budget:number;horizon:number;fee:number;ingredients:Ingredient[];lots:Lot[];movements:Movement[];usage:Usage[];suppliers:Supplier[];quotes:Quote[];plans:Plan[];receipts:Receipt[];bidRounds:BidRound[];settings:{minimumReliability:number;};}
export interface Audit {id:string;at:string;actor:string;action:string;detail:string;}
