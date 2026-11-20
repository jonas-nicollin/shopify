const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const { JSDOM } = require('jsdom');
const engine = new Liquid({ root: path.join(__dirname, '../snippets'), extname: '.liquid' });
engine.registerTag('stylesheet', { parse(token, tokens) { while(tokens.length && tokens.shift().name !== 'endstylesheet') {} }, render() { return ''; } });
const link = (title, handle, links=[]) => ({ title, url: '/collections/'+handle, links });
const menu = { links: [link('Necklaces','necklaces',[link('Grape','grape'),link('Lungo Grape','lungo-grape')]),link('Bracelets','bracelets')] };
const context = { menu, routes: {root_url:'/'}, shop:{name:'Example'}, current_collection:{handle:'lungo-grape'} };
test('collection identity selects one row and one active sibling', async () => {
  const html = await engine.renderFile('collection-context',{...context,mode:'navigation'});
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('nav').length,1);
  assert.equal(doc.querySelector('h2').textContent,'Necklaces');
  assert.equal(doc.querySelectorAll('[aria-current=page]').length,1);
  assert.equal(doc.querySelector('[aria-current=page]').textContent,'Lungo Grape');
});
test('root View all and missing collections do not invent relationships',async()=>{
  const html=await engine.renderFile('collection-context',{...context,mode:'navigation',current_collection:{handle:'necklaces'}});
  assert.equal(new JSDOM(html).window.document.querySelector('[aria-current=page]').textContent,'View all');
  assert.equal((await engine.renderFile('collection-context',{...context,mode:'navigation',current_collection:{handle:'unknown'}})).trim(),'');
});
const product={ title:'Lungo <Pearl>',collections:[{handle:'necklaces',all_products_count:70},{handle:'grape',all_products_count:29},{handle:'lungo-grape',all_products_count:4}] };
test('direct product arrival chooses narrower collection; context and explicit choice have priority',async()=>{
  const data={...context,current_collection:null,context_product:product,mode:'breadcrumbs'};
  const render=async d=>new JSDOM(await engine.renderFile('collection-context',d)).window.document;
  let doc=await render(data);
  assert.deepEqual([...doc.querySelectorAll('li')].map(e=>e.textContent),['Example','Necklaces','Lungo Grape','Lungo <Pearl>']);
  doc=await render({...data,current_collection:{handle:'grape'}});
  assert.equal(doc.querySelectorAll('li')[2].textContent,'Grape');
  doc=await render({...data,current_collection:{handle:'grape'},context_product:{...product,metafields:{custom:{breadcrumb_collection:{value:{handle:'lungo-grape'}}}}}});
  assert.equal(doc.querySelectorAll('li')[2].textContent,'Lungo Grape');
  assert.equal(doc.querySelectorAll('pearl').length,0);
});
test('three-level menus remain one row and have complete breadcrumbs',async()=>{
  const nested={links:[link('Necklaces','necklaces',[link('New In','new-in'),link('One of a kind','unique'),link('Main collection','main',[link('Grape','grape'),link('Lungo Grape','lungo-grape')])])]};
  const html=await engine.renderFile('collection-context',{...context,menu:nested,mode:'navigation',current_collection:{handle:'grape'}});
  const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('nav').length,1);
  assert.equal(doc.querySelector('h2').textContent,'Necklaces');
  assert.equal(doc.querySelector('[aria-current=page]').textContent,'Grape');
  assert.deepEqual([...doc.querySelectorAll('nav a')].map(a=>a.textContent),['View all','New In','One of a kind','Grape','Lungo Grape']);
  const crumb=new JSDOM(await engine.renderFile('collection-context',{...context,menu:nested,mode:'breadcrumbs',current_collection:{handle:'grape'},context_product:product})).window.document;
  assert.deepEqual([...crumb.querySelectorAll('li')].map(e=>e.textContent),['Example','Necklaces','Main collection','Grape','Lungo <Pearl>']);
});
test('editorial field supports direct image/video, metaobject and safe fallback',async()=>{
  const source=fs.readFileSync(path.join(__dirname,'../sections/main-collection-product-grid.liquid'),'utf8');
  const block=source.match(/{% liquid\s+assign media = product.images\[1\][\s\S]*?%}/)[0];
  const evaluate=async(field,value)=>engine.parseAndRender(block+'{{ media.id }}',{section:{settings:{editorial_media_path:field,editorial_interval:16}},position:16,product:{images:[{id:'first'},{id:'fallback'}],metafields:{custom:{source:{value}}}}});
  assert.equal((await evaluate('custom.source',{id:'image',media_type:'image'})).trim(),'image');
  assert.equal((await evaluate('custom.source',{id:'video',media_type:'video'})).trim(),'video');
  assert.equal((await evaluate('custom.source.media',{media:{value:{id:'nested',media_type:'video'}}})).trim(),'nested');
  for(const field of ['', 'bad', 'custom.source.extra.bad'])assert.equal((await evaluate(field,{id:'bad',media_type:'image'})).trim(),'fallback');
  assert.equal((await evaluate('custom.source',{id:'file',media_type:'generic_file'})).trim(),'fallback');
});
