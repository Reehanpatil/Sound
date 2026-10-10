const V='mera-playlist-v1';
const SHELL=['./','index.html','playlist-links.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // Never touch YouTube, thumbnails, GitHub API: always live
  if(/youtube|youtu\.be|ytimg|googlevideo|ggpht|github|noembed|oembed/.test(u.hostname))return;
  const same=u.origin===location.origin;
  if(same){ // network-first so edits to index.html / playlist-links.js show up at once
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));
  }else{ // fonts, tailwind: cache-first
    e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res})));
  }
});
