/* Хранилище: в APK — файлы в приватной папке приложения,
   на сайте — IndexedDB. Плюс повтор при ошибке "connection is closing". */

let _db;   /* объявляем первым, чтобы никакая ошибка на старте не ломала остальное */

const FS = (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Filesystem) ? Capacitor.Plugins.Filesystem : null;
let DIR = null;
if (FS) {
  try {
    DIR = (FS.Directory && FS.Directory.Documents) ? FS.Directory.Documents : 'DOCUMENTS';
  } catch (e) {
    DIR = 'DOCUMENTS';
  }
}

/* метаданные для файлового режима */
function metaAll(){ try { return JSON.parse(localStorage.getItem('vkm_meta')) || []; } catch(e){ return []; } }
function metaSave(list){ localStorage.setItem('vkm_meta', JSON.stringify(list)); }

function blobToBase64(blob){
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}
function base64ToBlob(b64, type){
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: type || 'audio/mpeg' });
}
async function fileSrc(path){
  const u = await FS.getUri({ directory: DIR, path });
  return Capacitor.convertFileSrc(u.uri);
}

/* ---------- IndexedDB (режим сайта) ---------- */
function dbOpen(){
  if (_db) return Promise.resolve(_db);
  return new Promise((res, rej) => {
    const rq = indexedDB.open('vkm-db', 1);
    rq.onupgradeneeded = () => {
      const db = rq.result;
      if (!db.objectStoreNames.contains('tracks'))
        db.createObjectStore('tracks', { keyPath: 'id', autoIncrement: true });
    };
    rq.onsuccess = () => { _db = rq.result; res(_db); };
    rq.onerror = () => rej(rq.error);
  });
}
function idbReq(db, mode, run){
  return new Promise((res, rej) => {
    const tx = db.transaction('tracks', mode);
    const rq = run(tx.objectStore('tracks'));
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
  });
}
async function idb(fn){
  for (let attempt = 0; ; attempt++) {
    try { const db = await dbOpen(); return await fn(db); }
    catch (e) {
      if (attempt === 0 && /closing|closed/i.test((e && e.message) || '')) { _db = null; continue; }
      throw e;
    }
  }
}

/* ---------- общий интерфейс ---------- */
async function dbAll(){
  if (FS) return metaAll().map(m => Object.assign({}, m));
  return idb(db => idbReq(db, 'readonly', st => st.getAll()));
}
async function dbGet(id){
  if (FS) return metaAll().find(m => String(m.id) === String(id)) || null;
  return idb(db => idbReq(db, 'readonly', st => st.get(+id)));
}
async function dbAdd(rec){
  if (FS) {
    const id = rec.id || Date.now();
    const m = { id, title: rec.title, artist: rec.artist, duration: rec.duration || 0,
                type: (rec.blob && rec.blob.type) || 'audio/mpeg' };
    await FS.writeFile({ directory: DIR, path: 'tracks/' + id + '.bin', data: await blobToBase64(rec.blob) });
    m.fileSrc = await fileSrc('tracks/' + id + '.bin');
    if (rec.cover) {
      await FS.writeFile({ directory: DIR, path: 'covers/' + id + '.bin', data: await blobToBase64(rec.cover) });
      m.coverSrc = await fileSrc('covers/' + id + '.bin');
    }
    const list = metaAll(); list.push(m); metaSave(list);
    return id;
  }
  return idb(db => idbReq(db, 'readwrite', st => st.add(rec)));
}
async function dbPut(rec){
  if (FS) {
    const list = metaAll();
    const i = list.findIndex(m => String(m.id) === String(rec.id));
    if (i < 0) return dbAdd(rec);
    const m = list[i];
    m.title = rec.title; m.artist = rec.artist;
    if (rec.duration) m.duration = rec.duration;
    if (rec.cover) {
      await FS.writeFile({ directory: DIR, path: 'covers/' + m.id + '.bin', data: await blobToBase64(rec.cover) });
      m.coverSrc = await fileSrc('covers/' + m.id + '.bin');
    }
    metaSave(list);
    return rec.id;
  }
  return idb(db => idbReq(db, 'readwrite', st => st.put(rec)));
}
async function dbDel(id){
  if (FS) {
    const list = metaAll();
    const m = list.find(x => String(x.id) === String(id));
    if (m) {
      try { await FS.deleteFile({ directory: DIR, path: 'tracks/' + m.id + '.bin' }); } catch(e){}
      try { await FS.deleteFile({ directory: DIR, path: 'covers/' + m.id + '.bin' }); } catch(e){}
    }
    metaSave(list.filter(x => String(x.id) !== String(id)));
    return;
  }
  return idb(db => idbReq(db, 'readwrite', st => st.delete(+id)));
}
async function dbGetBlob(id){
  if (FS) {
    const m = metaAll().find(x => String(x.id) === String(id));
    if (!m) return null;
    const r = await FS.readFile({ directory: DIR, path: 'tracks/' + m.id + '.bin' });
    return base64ToBlob(r.data, m.type);
  }
  const t = await dbGet(id);
  return t ? t.blob : null;
}
async function dbGetCoverBlob(id){
  if (FS) {
    const m = metaAll().find(x => String(x.id) === String(id));
    if (!m || !m.coverSrc) return null;
    const r = await FS.readFile({ directory: DIR, path: 'covers/' + m.id + '.bin' });
    return base64ToBlob(r.data, 'image/jpeg');
  }
  const t = await dbGet(id);
  return t ? (t.cover || null) : null;
}
/* запасной путь: добавить напрямую в IndexedDB (если файловый режим сбоит) */
async function dbAddIDB(rec){
  return idb(db => idbReq(db, 'readwrite', st => st.add(rec)));
}

/* ссылка для воспроизведения */
const _urls = new Map();
async function trackUrl(id){
  const t = await dbGet(id);
  if (!t) return '';
  if (t.fileSrc) return t.fileSrc;
  if (_urls.has(id)) return _urls.get(id);
  const u = URL.createObjectURL(t.blob);
  _urls.set(id, u);
  return u;
}
