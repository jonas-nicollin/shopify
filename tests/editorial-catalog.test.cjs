const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const section = fs.readFileSync('sections/main-collection-editorial-grid.liquid', 'utf8');
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
  w.document.body.innerHTML='<product-card-gallery><a href="/products/one"><img src="/one.jpg"><template><img data-catalog-src="/two.jpg"></template><template><img data-catalog-src="/three.jpg"></template></a><div class="product-card-gallery__controls"><button data-step="-1"></button><button data-step="1"></button></div></product-card-gallery>';
  await tick();
  const el=w.document.querySelector('product-card-gallery'),link=el.querySelector('a');
  pointer(w,link,'pointerdown',220,100);pointer(w,link,'pointerup',80,105);await tick();
  assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/two.jpg');
  const click=new w.MouseEvent('click',{bubbles:true,cancelable:true,detail:1});link.dispatchEvent(click);assert.equal(click.defaultPrevented,true);
  pointer(w,link,'pointerdown',220,100);pointer(w,link,'pointerup',210,230);await tick();
  assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/two.jpg');
  pointer(w,link,'pointerdown',220,100);pointer(w,link,'pointercancel',210,100);pointer(w,link,'pointerup',80,100);await tick();
  assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/two.jpg');
  el.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await tick();assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/three.jpg');
  el.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await tick();assert.equal(el.querySelector('img.is-active').getAttribute('src'),'/one.jpg');
  dom.window.close();
});

test('filter requests preserve repeated facets and only submit the active desktop/mobile form set', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<editorial-catalog data-section="test"><catalog-filters-form><form id="desktop"><input name="filter.color" value="red"><input name="filter.color" value="blue"></form></catalog-filters-form><catalog-filters-form><form id="sort"><input name="sort_by" value="price-ascending"></form></catalog-filters-form><catalog-filters-form><form id="FacetFiltersFormMobile"><input name="filter.color" value="green"></form></catalog-filters-form></editorial-catalog>';
  await tick();const root=w.document.querySelector('editorial-catalog');let result;
  root.renderFilters=url=>{result=url;};root.submitFilters(w.document.querySelector('#desktop'));
  assert.deepEqual([...result.searchParams.getAll('filter.color')],['red','blue']);assert.equal(result.searchParams.get('sort_by'),'price-ascending');
  root.submitFilters(w.document.querySelector('#FacetFiltersFormMobile'));
  assert.equal(result.searchParams.get('filter.color'),'green');assert.equal(result.searchParams.has('sort_by'),false);
  dom.window.close();
});

test('lazy media is activated by the section and filter replacement cancels an obsolete request', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<editorial-catalog data-section="test"><div data-catalog-item><img data-catalog-src="/deferred.jpg"></div><span data-catalog-status></span></editorial-catalog>';
  await tick();const root=w.document.querySelector('editorial-catalog');
  assert.equal(root.querySelector('img').getAttribute('src'),'/deferred.jpg');
  const pending=[];root.fetchSection=(url,signal)=>new Promise(resolve=>pending.push({url,signal,resolve}));
  const first=root.renderFilters(new w.URL('https://example.com/collections/all?filter.color=red'),true);
  const second=root.renderFilters(new w.URL('https://example.com/collections/all?filter.color=blue'),true);
  assert.equal(pending[0].signal.aborted,true);
  const response=count=>{const el=w.document.createElement('editorial-catalog');el.innerHTML=`<span id="ProductCount">${count}</span><span data-catalog-status></span>`;return el;};
  pending[1].resolve(response('Blue results'));await second;
  pending[0].resolve(response('Red results'));await first;
  assert.equal(root.querySelector('#ProductCount').textContent,'Blue results');assert.equal(root.hasAttribute('aria-busy'),false);assert.equal(w.location.search,'?filter.color=blue');
  dom.window.close();
});

test('next-page loading appends products once and retains a navigation fallback on failure', async () => {
  const dom=environment(),w=dom.window;
  w.document.body.innerHTML='<editorial-catalog data-section="test"><ul id="product-grid"><li data-product="1"></li></ul><div><a data-catalog-next href="?page=2">Next</a></div></editorial-catalog>';
  await tick();const root=w.document.querySelector('editorial-catalog'),link=root.querySelector('a');let finish,calls=0;
  root.fetchSection=()=>{calls++;return new Promise(resolve=>finish=resolve);};
  const first=root.loadNext(link);await root.loadNext(link);assert.equal(calls,1);
  const response=w.document.createElement('editorial-catalog');response.innerHTML='<ul id="product-grid"><li data-product="2"></li></ul><div><a data-catalog-next href="?page=3">Next</a></div>';
  finish(response);await first;assert.equal(root.querySelectorAll('li').length,2);assert.equal(new URL(link.href).search,'?page=3');
  root.fetchSection=async()=>{throw new Error('offline');};await root.loadNext(link);assert.equal(link.isConnected,true);assert.equal(link.dataset.retry,'true');assert.equal(link.hasAttribute('aria-busy'),false);
  const click=new w.MouseEvent('click',{bubbles:true,cancelable:true});
  let nativeFallback=false;w.document.addEventListener('click',event=>{nativeFallback=!event.defaultPrevented;event.preventDefault();},{once:true});
  link.dispatchEvent(click);assert.equal(nativeFallback,true);
  dom.window.close();
});
