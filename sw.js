/* Bidlisiw yearbook service worker
   - always asks the network first, so the book stays current
   - keeps a copy of the book (and its icons) for when you're offline
   - refreshes that copy whenever the page says a new edition is in use */
const C='bidlisiw-yearbook';
const CORE=['./','manifest.webmanifest','favicon.ico','favicon-32.png','apple-touch-icon.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{
  const d=e.data||{};if(d.type!=='precache'||!d.build)return;
  e.waitUntil(caches.open(C).then(async c=>{
    const m=await c.match('__build');if(m&&(await m.text())===d.build)return;
    await Promise.all(CORE.map(p=>fetch(p,{cache:p==='./'?'no-cache':'default'}).then(r=>{if(r.ok)return c.put(p,r);}).catch(()=>{})));
    await c.put('__build',new Response(d.build));
  }));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin||u.pathname.endsWith('version.json'))return;
  e.respondWith(fetch(r).catch(()=>caches.open(C).then(c=>c.match(r.mode==='navigate'?'./':r,{ignoreSearch:true}).then(m=>m||c.match('./'))).then(m=>m||Response.error())));
});
