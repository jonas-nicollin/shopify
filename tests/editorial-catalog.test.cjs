const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const section = fs.readFileSync('sections/main-collection-product-grid.liquid', 'utf8');
const gallery = fs.readFileSync('snippets/product-card-gallery.liquid', 'utf8');
const script = source => source.match(/{% javascript %}([\s\S]*?){% endjavascript %}/)[1];
const tick = () => new Promise(resolve => setTimeout(resolve, 30));

function environment() {
  const dom = new JSDOM('<body></body>', { url: 'https://example.com/collections/all', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.HTMLImageElement.prototype.decode = () => Promise.resolve();
  w.HTMLElement.prototype.setPointerCapture = () => {};
  w.matchMedia = () => ({matches: false});
  w.CSS = {escape: value => value};
  w.eval(script(gallery));
  w.eval(script(section));
  return dom;
}
function pointer(w, element, name, x, y) {
  const event = new w.Event(name, {bubbles:true, cancelable:true});
  Object.assign(event, {pointerType:'touch',isPrimary:true,pointerId:1,clientX:x,clientY:y});
  element.dispatchEvent(event);
}

test('touch swipe changes images, keeps vertical scroll and prevents accidental navigation', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<div class="card__media"><div class="product-card-gallery__controls"><button data-step="-1"></button><button data-step="1"></button></div><product-card-gallery><a href="/products/one"><img src="/one.jpg"><template><img src="/two.jpg"></template><template><img src="/three.jpg"></template></a></product-card-gallery><div class="product-card-gallery__scrollbar" hidden><input type="range" min="1" max="3" value="1"></div></div>';
  await tick();
  const el=w.document.querySelector('product-card-gallery'),link=el.querySelector('a');
  assert.equal(el.hasAttribute('data-gallery-interacting'),false);
  pointer(w,link,'pointerdown',220,100);pointer(w,link,'pointerup',80,105);await tick();
  assert.equal(el.hasAttribute('data-gallery-interacting'),true);
  assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/two.jpg');
  const click=new w.MouseEvent('click',{bubbles:true,cancelable:true,detail:1});link.dispatchEvent(click);assert.equal(click.defaultPrevented,true);
  pointer(w,link,'pointerdown',220,100);pointer(w,link,'pointerup',210,230);await tick();
  assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/two.jpg');
  pointer(w,link,'pointerdown',220,100);pointer(w,link,'pointercancel',210,100);pointer(w,link,'pointerup',80,100);await tick();
  assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/two.jpg');
  el.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await tick();assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/three.jpg');
  el.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await tick();assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/one.jpg');
  const range=w.document.querySelector('input[type=range]');range.value='3';range.dispatchEvent(new w.Event('input',{bubbles:true}));await tick();
  assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/three.jpg');
  assert.equal(range.getAttribute('aria-valuetext'),'3 / 3');assert.equal(range.parentElement.style.getPropertyValue('--gallery-index'),'2');
  assert.equal(range.parentElement.hidden,false);
  await new Promise(resolve=>setTimeout(resolve,1450));
  assert.equal(el.hasAttribute('data-gallery-interacting'),false);
  dom.window.close();
});

test('gallery navigation still works with the optional scrollbar disabled', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<div class="card__media"><div class="product-card-gallery__controls" hidden><button data-step="1"></button></div><product-card-gallery><a href="/products/one"><img src="/one.jpg"><template><img src="/two.jpg"></template></a></product-card-gallery></div>';
  await tick();w.document.querySelector('button').click();await tick();
  const gallery=w.document.querySelector('product-card-gallery');
  assert.equal(gallery.querySelector('img.is-active').getAttribute('src'),'/two.jpg');
  assert.equal(gallery.hasAttribute('data-gallery-interacting'),false);
  dom.window.close();
});

test('header height preserves its visible-section contract without a mutation feedback loop', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<header class="shopify-section-group-header-group"></header><div class="shopify-section-group-header-group"></div>';
  const [header,announcement]=w.document.querySelectorAll('.shopify-section-group-header-group');
  header.getBoundingClientRect=()=>({height:80,top:-20,bottom:60});
  announcement.getBoundingClientRect=()=>({height:30,top:60,bottom:90});
  let writes=0;const original=w.document.documentElement.style.setProperty.bind(w.document.documentElement.style);
  w.document.documentElement.style.setProperty=(...args)=>{writes++;original(...args);};
  w.eval(fs.readFileSync('assets/total-header-height-variable.js','utf8'));
  w.dispatchEvent(new w.Event('load'));await tick();await tick();
  assert.equal(w.document.documentElement.style.getPropertyValue('--total-header-height'),'110px');
  assert.equal(writes,1);
  announcement.style.display='none';await tick();await tick();
  assert.equal(w.document.documentElement.style.getPropertyValue('--total-header-height'),'80px');
  assert.equal(writes,2);
  dom.window.close();
});

test('filter requests preserve repeated facets and only submit the active desktop/mobile form set', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<product-catalog data-section="test"><catalog-filters-form><form id="desktop"><input name="filter.color" value="red"><input name="filter.color" value="blue"></form></catalog-filters-form><catalog-filters-form><form id="sort"><input name="sort_by" value="price-ascending"></form></catalog-filters-form><catalog-filters-form><form id="FacetFiltersFormMobile"><input name="filter.color" value="green"></form></catalog-filters-form></product-catalog>';
  await tick();const root=w.document.querySelector('product-catalog');let result;
  root.renderFilters=url=>{result=url;};root.submitFilters(w.document.querySelector('#desktop'));
  assert.deepEqual([...result.searchParams.getAll('filter.color')],['red','blue']);assert.equal(result.searchParams.get('sort_by'),'price-ascending');
  root.submitFilters(w.document.querySelector('#FacetFiltersFormMobile'));
  assert.equal(result.searchParams.get('filter.color'),'green');assert.equal(result.searchParams.has('sort_by'),false);
  dom.window.close();
});

test('native image loading remains intact and filter replacement cancels an obsolete request', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<product-catalog data-section="test"><div data-catalog-item><img src="/native.jpg" loading="lazy"></div><span data-catalog-status></span></product-catalog>';
  await tick();const root=w.document.querySelector('product-catalog');
  assert.equal(root.querySelector('img').getAttribute('src'),'/native.jpg');
  assert.equal(root.querySelector('img').getAttribute('loading'),'lazy');
  assert.equal(root.querySelector('[data-catalog-item]').hasAttribute('data-reveal'),false);
  root.querySelector('img').dispatchEvent(new w.Event('load'));assert.equal(root.querySelector('img').hasAttribute('data-catalog-reveal'),true);
  const pending=[];root.fetchSection=(url,signal)=>new Promise(resolve=>pending.push({url,signal,resolve}));
  const first=root.renderFilters(new w.URL('https://example.com/collections/all?filter.color=red'),true);
  const second=root.renderFilters(new w.URL('https://example.com/collections/all?filter.color=blue'),true);
  assert.equal(pending[0].signal.aborted,true);
  const response=count=>{const el=w.document.createElement('product-catalog');el.innerHTML=`<span id="ProductCount">${count}</span><span data-catalog-status></span>`;return el;};
  pending[1].resolve(response('Blue results'));await second;
  pending[0].resolve(response('Red results'));await first;
  assert.equal(root.querySelector('#ProductCount').textContent,'Blue results');assert.equal(root.hasAttribute('aria-busy'),false);assert.equal(w.location.search,'?filter.color=blue');
  dom.window.close();
});

test('next-page loading appends products once and retains a navigation fallback on failure', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<product-catalog data-section="test"><ul id="product-grid"><li data-product="1"></li></ul><div><a data-catalog-next href="?page=2">Next</a></div></product-catalog>';
  await tick();const root=w.document.querySelector('product-catalog'),link=root.querySelector('a');let finish,calls=0;
  root.fetchSection=()=>{calls++;return new Promise(resolve=>finish=resolve);};
  const first=root.loadNext(link);await root.loadNext(link);assert.equal(calls,1);
  const response=w.document.createElement('product-catalog');response.innerHTML='<ul id="product-grid"><li data-product="2"></li></ul><div><a data-catalog-next href="?page=3">Next</a></div>';
  finish(response);await first;assert.equal(root.querySelectorAll('li').length,2);assert.equal(new URL(link.href).search,'?page=3');
  root.fetchSection=async()=>{throw new Error('offline');};await root.loadNext(link);assert.equal(link.isConnected,true);assert.equal(link.dataset.retry,'true');assert.equal(link.hasAttribute('aria-busy'),false);
  const click=new w.MouseEvent('click',{bubbles:true,cancelable:true});
  let nativeFallback=false;w.document.addEventListener('click',event=>{nativeFallback=!event.defaultPrevented;event.preventDefault();},{once:true});
  link.dispatchEvent(click);assert.equal(nativeFallback,true);
  dom.window.close();
});


test('step indicator follows swipe, range and keyboard navigation', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<div class="card__media"><div class="product-card-gallery__controls"><button data-step="1"></button></div><product-card-gallery><a href="/products/one"><img src="/one.jpg"><template><img src="/two.jpg"></template><template><img src="/three.jpg"></template></a></product-card-gallery><div class="product-card-gallery__scrollbar product-card-gallery__scrollbar--steps"><span data-gallery-step="0" class="is-active"></span><span data-gallery-step="1"></span><span data-gallery-step="2"></span><input type="range" min="1" max="3" value="1"></div></div>';
  await tick();const link=w.document.querySelector('product-card-gallery a');
  pointer(w,link,'pointerdown',200,100);pointer(w,link,'pointerup',80,100);await tick();
  assert.equal(w.document.querySelector('[data-gallery-step].is-active').dataset.galleryStep,'1');
  const range=w.document.querySelector('input');range.value='3';range.dispatchEvent(new w.Event('input',{bubbles:true}));await tick();
  assert.equal(w.document.querySelectorAll('[data-gallery-step].is-active').length,1);
  assert.equal(w.document.querySelector('[data-gallery-step].is-active').dataset.galleryStep,'2');
  link.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await tick();
  assert.equal(w.document.querySelector('[data-gallery-step].is-active').dataset.galleryStep,'0');
  dom.window.close();
});

test('numbered pagination is never intercepted by the automatic page loader', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<product-catalog data-section="test" data-pagination="true"><ul id="product-grid"><li></li></ul><nav class="pagination"><a href="?page=2">2</a></nav></product-catalog>';
  await tick();const root=w.document.querySelector('product-catalog');let loads=0;root.loadNext=()=>loads++;
  let native=false;w.document.addEventListener('click',event=>{native=!event.defaultPrevented;event.preventDefault();},{once:true});root.querySelector('a').click();
  assert.equal(native,true);assert.equal(loads,0);
  dom.window.close();
});


test('Apply keeps a mobile drawer closed when an in-flight filter response arrives', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<product-catalog><menu-drawer><details id="drawer" class="mobile-facets__disclosure menu-opening" open><summary>Filters</summary><div class="mobile-facets__footer"><button>Apply</button></div></details></menu-drawer><span data-catalog-status></span></product-catalog>';
  await tick();const root=w.document.querySelector('product-catalog');const drawer=root.querySelector('menu-drawer');
  drawer.closeMenuDrawer=()=>{drawer.querySelector('details').classList.remove('menu-opening');};
  let finish;root.fetchSection=()=>new Promise(resolve=>finish=resolve);
  const pending=root.renderFilters(new w.URL('https://example.com/collections/all?filter=1'),true);
  root.querySelector('button').click();assert.equal(root.drawerClosing,true);
  const response=w.document.createElement('product-catalog');response.innerHTML='<menu-drawer><details id="drawer" class="mobile-facets__disclosure"><summary>Filters</summary></details></menu-drawer><span data-catalog-status></span>';
  finish(response);await pending;assert.equal(root.querySelector('details').open,false);dom.window.close();
});

test('secondary hover respects its setting, ignores touch and restores the selected image',async()=>{
  for(const enabled of [true,false]){
    const dom=environment(),w=dom.window;w.matchMedia=()=>({matches:true});
    w.document.body.innerHTML=`<div class="card__media"><div class="product-card-gallery__controls"><button data-step="1"></button></div><product-card-gallery data-secondary-hover="${enabled}"><a><img src="/one.jpg"><template><img src="/two.jpg"></template><template><img src="/three.jpg"></template></a></product-card-gallery></div>`;
    await tick();const media=w.document.querySelector('.card__media'),gallery=media.querySelector('product-card-gallery');
    const enter=type=>{const e=new w.Event('pointerenter');Object.assign(e,{pointerType:type});media.dispatchEvent(e);};
    enter('touch');await tick();assert.equal(gallery.querySelectorAll('img').length,1);
    enter('mouse');await tick();assert.equal(gallery.querySelectorAll('img').length,enabled?2:1);
    if(enabled)assert.equal(gallery.querySelector('.is-active').getAttribute('src'),'/two.jpg');
    media.dispatchEvent(new w.Event('pointerleave'));await tick();
    if(enabled)assert.equal(gallery.querySelector('.is-active').getAttribute('src'),'/one.jpg');
    media.querySelector('button').click();await tick();media.querySelector('button').click();await tick();
    enter('mouse');await tick();media.dispatchEvent(new w.Event('pointerleave'));await tick();
    assert.equal(gallery.querySelector('.is-active').getAttribute('src'),'/three.jpg');
    dom.window.close();
  }
});

test('desktop drawer sorting keeps selected facets and uses one current sort value',async()=>{
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<product-catalog><catalog-filters-form><form id="FacetFiltersFormMobile"><input type="checkbox" checked name="filter.v.availability" value="0"><input name="sort_by" value="manual"></form></catalog-filters-form><catalog-filters-form><form id="FacetSortDrawerForm"><input name="sort_by" value="price-ascending"></form></catalog-filters-form></product-catalog>';
  await tick();const root=w.document.querySelector('product-catalog');let result;root.renderFilters=url=>result=url;
  root.submitFilters(w.document.querySelector('#FacetSortDrawerForm'));
  assert.equal(result.searchParams.get('filter.v.availability'),'0');
  assert.deepEqual([...result.searchParams.getAll('sort_by')],['price-ascending']);
  dom.window.close();
});

test('sticky responds to grid and viewport geometry after filtering and resizing',async()=>{
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<product-catalog data-sticky="both"><div class="collection-context--navigation"></div><aside class="facets-wrapper"></aside><ul id="product-grid"></ul></product-catalog>';
  const catalog=w.document.querySelector('product-catalog');
  let gridHeight=400;
  catalog.querySelector('#product-grid').getBoundingClientRect=()=>({height:gridHeight});
  catalog.querySelector('.collection-context--navigation').getBoundingClientRect=()=>({height:50});
  catalog.querySelector('.facets-wrapper').getBoundingClientRect=()=>({height:60});
  w.innerHeight=800;
  await tick();
  assert.equal(catalog.dataset.stickyEligible,'false');
  gridHeight=1000;catalog.observeContent();await tick();
  assert.equal(catalog.dataset.stickyEligible,'true');
  assert.equal(catalog.style.getPropertyValue('--catalog-nav-height'),'50px');
  w.innerHeight=1300;w.dispatchEvent(new w.Event('resize'));await tick();
  assert.equal(catalog.dataset.stickyEligible,'false');
  assert.equal(catalog.style.getPropertyValue('--catalog-nav-height'),'0px');
  dom.window.close();
});
test('navigation arrows follow overflow and scroll by a useful distance',async()=>{
  const dom=environment(),w=dom.window;
  w.eval(script(fs.readFileSync('snippets/collection-context.liquid','utf8')));
  w.document.body.innerHTML='<collection-navigation><ul class="collection-context__links"><li><a href="#one">One</a></li><li><a href="#two">Two</a></li></ul><button data-direction="-1"></button><button data-direction="1"></button></collection-navigation>';
  const nav=w.document.querySelector('collection-navigation'),ul=nav.querySelector('ul'),buttons=nav.querySelectorAll('button');
  let left=0;
  ul.getBoundingClientRect=()=>({left:0,right:300});
  Object.defineProperty(ul,'clientWidth',{value:300});
  ul.children[0].getBoundingClientRect=()=>({left,right:left+200});
  ul.children[1].getBoundingClientRect=()=>({left:left+220,right:left+500});
  let requested;ul.scrollBy=options=>{requested=options.left;};
  await tick();assert.equal(buttons[0].hidden,true);assert.equal(buttons[1].hidden,false);
  buttons[1].click();assert.equal(requested,225);
  left=-200;ul.dispatchEvent(new w.Event('scroll'));
  assert.equal(buttons[0].hidden,false);assert.equal(buttons[1].hidden,true);
  dom.window.close();
});
