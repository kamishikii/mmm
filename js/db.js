/* Хранилище аудиофайлов в IndexedDB (локально на устройстве) */
let _db;
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
async function dbAdd(rec){
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const rq = db.transaction('tracks','readwrite').objectStore('tracks').add(rec);
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
  });
}
async function dbAll(){
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const rq = db.transaction('tracks','readonly').objectStore('tracks').getAll();
    rq.onsuccess = () => res(rq.result || []); rq.onerror = () => rej(rq.error);
  });
}
async function dbGet(id){
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const rq = db.transaction('tracks','readonly').objectStore('tracks').get(+id);
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
  });
}
async function dbDel(id){
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const rq = db.transaction('tracks','readwrite').objectStore('tracks').delete(+id);
    rq.onsuccess = () => res(); rq.onerror = () => rej(rq.error);
  });
}
/* object URL для воспроизведения (кэш) */
const _urls = new Map();
async function trackUrl(id){
  if (_urls.has(id)) return _urls.get(id);
  const t = await dbGet(id);
  if (!t) return '';
  const u = URL.createObjectURL(t.blob);
  _urls.set(id, u);
  return u;
}
async function dbPut(rec){
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const rq = db.transaction('tracks','readwrite').objectStore('tracks').put(rec);
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
  });
}
