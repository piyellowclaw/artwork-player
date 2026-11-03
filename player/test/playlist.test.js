'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createPlaylist}=require('../playlist');
function rng(seed=123){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('each shuffled round includes all 8 exactly once, each with 3 consecutive generations',()=>{
 const list=createPlaylist(8,3,{random:rng()});let p=list.initial(),last;
 const rounds=[];
 for(let round=0;round<100;round++){
  const entries=[];
  for(let slot=0;slot<8;slot++){
   entries.push(p.index);if(slot===0&&last!==undefined)assert.notEqual(p.index,last);
   for(let repeat=0;repeat<3;repeat++){assert.equal(p.round,round);assert.equal(p.slot,slot);assert.equal(p.repeat,repeat);assert.equal(p.index,entries[slot]);p=list.next(p);}
  }
  assert.deepEqual([...entries].sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);last=entries.at(-1);rounds.push(entries.join(','));
 }
 assert.ok(new Set(rounds).size>1);
});
test('speculative next/preload at round boundary is stable and consumes RNG once',()=>{
 let calls=0;const list=createPlaylist(3,1,{random:()=>{calls++;return 0.1;}});let p=list.initial();p=list.next(list.next(p));const a=list.next(p),after=calls,b=list.next(p);assert.equal(calls,after);assert.equal(a.order,b.order);assert.deepEqual(a,b);
});
test('sequential mode preserves manifest order and wrap',()=>{const list=createPlaylist(3,2,{shuffle:false,random:()=>{throw Error('RNG must not run');}});let p=list.initial(),seen=[];for(let n=0;n<8;n++){seen.push(p.index);p=list.next(p);}assert.deepEqual(seen,[0,0,1,1,2,2,0,0]);});
test('single artwork repeats safely without impossible anti-repeat loop',()=>{const list=createPlaylist(1,3);let p=list.initial();for(let n=0;n<100;n++){assert.equal(p.index,0);assert.equal(p.repeat,n%3);p=list.next(p);}});
test('two artwork boundary constraint and initial shuffle are finite even constant RNG',()=>{const list=createPlaylist(2,1,{random:()=>0});let p=list.initial();for(let i=0;i<100;i++){const next=list.next(p);assert.notEqual(p.index,next.index);p=next;}});
