/* Плейлисты в localStorage + утилиты имён/времени */
const Store = {
  key: 'vkm_playlists',
  all(){ try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch(e){ return []; } },
  save(l){ localStorage.setItem(this.key, JSON.stringify(l)); },
  get(id){ return this.all().find(p => String(p.id) === String(id)); },
  create(name){
    const l = this.all();
    const p = { id: Date.now(), name, trackIds: [], updatedAt: Date.now() };
    l.push(p); this.save(l); return p;
  },
  update(id, patch){
    const l = this.all();
    const i = l.findIndex(p => String(p.id) === String(id));
    if (i > -1) { Object.assign(l[i], patch, { updatedAt: Date.now() }); this.save(l); }
    return l[i];
  },
  remove(id){ this.save(this.all().filter(p => String(p.id) !== String(id))); }
};

/* "Artist - Title.mp3" -> {artist, title}; иначе title = имя файла */
function parseFileName(name){
  let base = name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
  const m = base.split(/\s+-\s+/);
  if (m.length >= 2) return { artist: m[0].trim(), title: m.slice(1).join(' - ').trim() };
  return { artist: 'Неизвестный исполнитель', title: base || name };
}
/* Порядок песен на главной (сохраняется) */
function getOrder(){ try { return JSON.parse(localStorage.getItem('vkm_order')) || []; } catch(e){ return []; } }
function setOrder(ids){ localStorage.setItem('vkm_order', JSON.stringify(ids)); }
