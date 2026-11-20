const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {Liquid}=require('liquidjs');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync('sections/gift-options.liquid','utf8');
const engine=new Liquid();
engine.registerTag('schema',{parse(token,tokens){while(tokens.length&&tokens.shift().name!=='endschema'){}},render(){return '';}});
const tick=()=>new Promise(resolve=>setTimeout(resolve,20));
async function setup(attributes={},items=[{quantity:2,requires_shipping:true,gift_card:false}]){
  const html=await engine.parseAndRender(source,{cart:{items,item_count:items.reduce((n,i)=>n+i.quantity,0),attributes},section:{id:'test',settings:{heading:'Gift options',toggle_label:'This is a gift',message_max:150}}});
  const dom=new JSDOM('<form id="cart"></form>'+html,{url:'https://example.com/cart',runScripts:'outside-only'}),w=dom.window;
  const writes=[];let notify;
  w.subscribe=(name,fn)=>{notify=fn;return()=>{};};w.PUB_SUB_EVENTS={cartUpdate:'cartUpdate'};
  w.fetch=async(url,request)=>{const data=JSON.parse(request.body);writes.push(data.attributes);return {ok:true,json:async()=>({attributes:data.attributes})};};
  w.eval(w.document.querySelector('script').textContent);
  return {dom,w,form:w.document.querySelector('gift-options-form-v4'),writes,notify:event=>notify(event)};
}
function change(w,input,checked){input.checked=checked;input.dispatchEvent(new w.Event('change',{bubbles:true}));}
test('fewer boxes saves independently, survives reload and yields to gift packaging',async()=>{
  const {dom,w,form,writes}=await setup();
  assert.equal(form.packaging.checked,false);assert.equal(form.packaging.disabled,false);
  change(w,form.packaging,true);await tick();
  assert.equal(writes.at(-1)['Packaging preference'],'Fewer boxes');
  assert.equal(form.querySelector('[data-output="packaging"]').value,'Fewer boxes');
  change(w,form.enabled,true);await tick();
  assert.equal(form.packaging.disabled,true);assert.equal(form.packaging.checked,false);
  assert.equal(writes.at(-1)['Packaging preference'],'');assert.equal(writes.at(-1)['Gift order'],'Yes');
  change(w,form.enabled,false);await tick();assert.equal(form.packaging.checked,false);
  const saved=await setup({'Packaging preference':'Fewer boxes'});assert.equal(saved.form.packaging.checked,true);
  dom.window.close();saved.dom.window.close();
});
test('quantity changes count shippable items and clear an ineligible preference',async()=>{
  const {dom,form,writes,notify}=await setup({'Packaging preference':'Fewer boxes'});
  notify({cartData:{item_count:3,items:[{quantity:1,requires_shipping:true},{quantity:2,requires_shipping:false,gift_card:true}]}});
  await tick();assert.equal(form.querySelector('[data-packaging-choice]').hidden,true);
  assert.equal(form.packaging.checked,false);assert.equal(writes.at(-1)['Packaging preference'],'');
  notify({cartData:{item_count:2,items:[{quantity:2,requires_shipping:true}]}});
  assert.equal(form.packaging.disabled,false);assert.equal(form.querySelector('[data-packaging-choice]').hidden,false);
  dom.window.close();
});
test('rapid gift changes during a pending save persist the final exclusive choice',async()=>{
  const {dom,w,form,writes}=await setup();
  let release;
  w.fetch=async(url,request)=>{const attrs=JSON.parse(request.body).attributes;writes.push(attrs);if(writes.length===1)await new Promise(r=>release=r);return {ok:true,json:async()=>({attributes:attrs})};};
  change(w,form.packaging,true);await tick();change(w,form.enabled,true);await tick();release();await tick();
  assert.equal(writes.length,2);assert.equal(writes[1]['Gift order'],'Yes');assert.equal(writes[1]['Packaging preference'],'');
  assert.equal(form.savedRevision,form.revision);dom.window.close();
});
