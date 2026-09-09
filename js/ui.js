/ иконки и прочее дерьмо /
const ICONS = {
  back:'<svg viewBox="0 0 24 24"><path d="M19 12H5m7-7-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  download:'<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  upload:'<svg viewBox="0 0 24 24"><path d="M12 15V4m0 0-4 4m4-4 4 4M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plist:'<svg viewBox="0 0 24 24"><path d="M4 7h8M4 12h8M4 17h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><g transform="translate(11,8) scale(0.55)"><path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2.6"/></g></svg>',
  note:'<svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  chevron:'<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  caret:'<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dots:'<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="19" r="1.8" fill="currentColor"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M5 8h11M5 13h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 12v7M13.5 15.5h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  pencil:'<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',
  prev:'<svg viewBox="0 0 24 24"><path d="M19 5v14L8 12l11-7z" fill="currentColor"/><rect x="5" y="5" width="2.5" height="14" rx="1" fill="currentColor"/></svg>',
  next:'<svg viewBox="0 0 24 24"><path d="M5 5v14l11-7L5 5z" fill="currentColor"/><rect x="16.5" y="5" width="2.5" height="14" rx="1" fill="currentColor"/></svg>',
  shuffle:'<svg viewBox="0 0 24 24"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  repeat:'<svg viewBox="0 0 24 24"><path d="m17 1 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  queue:'<svg viewBox="0 0 24 24"><path d="M4 6h16M4 11h16M4 16h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m16 14 6 3.5-6 3.5v-7z" fill="currentColor"/></svg>'
};

function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.from((r || document).querySelectorAll(s)); }
function esc(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function gradFor(str){
  let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) | 0;
  const h1 = Math.abs(h) % 360, h2 = (h1 + 45) % 360;
  return 'linear-gradient(135deg, hsl(' + h1 + ',55%,45%), hsl(' + h2 + ',65%,28%))';
}
/ обложка /
function coverHTML(t, cls){
  const isObj = typeof t === 'object';
  const name = isObj ? (t.title || '') : String(t);
  const url = isObj ? t.coverUrl : null;
  const bg = url
    ? 'background-image:url(' + url + ');background-size:cover;background-position:center'
    : 'background:' + gradFor(name);
  return '<div class="cover ' + (cls || '') + '" style="' + bg + '">' + (url ? '' : ICONS.note) + '</div>';
}
/ обложка /
function withCovers(tracks){
  tracks.forEach(t => {
    if (t.coverUrl) return;
    if (t.coverSrc) { t.coverUrl = t.coverSrc; return; }
    if (t.cover) { try { t.coverUrl = URL.createObjectURL(t.cover); } catch(e){} }
  });
  return tracks;
}
function fmtTime(s){ s = Math.round(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function plural(n, f){ const a = n % 10, b = n % 100; if (a === 1 && b !== 11) return f[0]; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return f[1]; return f[2]; }
function relTime(ts){
  const d = Date.now() - ts, min = Math.floor(d / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return min + ' ' + plural(min, ['минуту','минуты','минут']) + ' назад';
  const h = Math.floor(min / 60);
  if (h < 24) return h + ' ' + plural(h, ['час','часа','часов']) + ' назад';
  const days = Math.floor(h / 24);
  if (days < 7) return days + ' ' + plural(days, ['день','дня','дней']) + ' назад';
  const w = Math.floor(days / 7);
  if (w < 5) return w + ' ' + plural(w, ['неделю','недели','недель']) + ' назад';
  const mo = Math.floor(days / 30);
  return mo + ' ' + plural(mo, ['месяц','месяца','месяцев']) + ' назад';
}

function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2500);
}

/ штора /
let _sheetToken = 0;
function openSheet(html){
  _sheetToken++;
  const s = $('#sheet'); s.innerHTML = html;
  requestAnimationFrame(() => s.classList.add('open'));
  $('#sheet-backdrop').classList.add('open');
}
function closeSheet(){
  const tok = _sheetToken;
  $('#sheet').classList.remove('open');
  $('#sheet-backdrop').classList.remove('open');
  setTimeout(() => { if (tok === _sheetToken) $('#sheet').innerHTML = ''; }, 300);
}
function sheetList(title, items){
  openSheet('<div class="sheet-title">' + esc(title) + '</div>' +
    items.map((it, i) => '<button class="sheet-item' + (it.danger ? ' danger' : '') + '" data-i="' + i + '">' + esc(it.label) + '</button>').join('') +
    '<button class="sheet-item cancel" data-i="-1">Отмена</button>');
  $$('#sheet .sheet-item').forEach(btn => btn.onclick = () => {
    const i = +btn.dataset.i; closeSheet();
    if (i >= 0 && items[i].onClick) items[i].onClick();
  });
}
function promptSheet(title, initial, okLabel, onOk){
  openSheet('<div class="sheet-title">' + esc(title) + '</div><div class="sheet-pad">' +
    '<input id="sheet-input" class="text-input" value="' + esc(initial || '') + '" placeholder="Название">' +
    '<button class="btn-primary" id="sheet-ok">' + esc(okLabel || 'Сохранить') + '</button></div>');
  setTimeout(() => { const i = $('#sheet-input'); i && i.focus(); }, 150);
  const ok = () => { const v = $('#sheet-input').value.trim(); if (!v) { toast('Введите название'); return; } closeSheet(); onOk(v); };
  $('#sheet-ok').onclick = ok;
  $('#sheet-input').onkeydown = e => { if (e.key === 'Enter') ok(); };
}
function confirmSheet(text, onYes){ sheetList(text, [{ label: 'Да, удалить', danger: true, onClick: onYes }]); }

/ редакт трека /
function openEditSheet(t, onSaved){
  let newCover = null;
  openSheet('<div class="sheet-title">Информация о треке</div><div class="sheet-pad">' +
    '<input id="ed-title" class="text-input" value="' + esc(t.title) + '" placeholder="Название">' +
    '<input id="ed-artist" class="text-input" value="' + esc(t.artist) + '" placeholder="Исполнитель">' +
    '<img id="ed-preview" class="ed-preview' + (t.coverUrl ? '' : ' hidden') + '" src="' + (t.coverUrl || '') + '">' +
    '<button class="btn-primary small" id="ed-cover">Выбрать обложку</button>' +
    '<button class="btn-primary" id="ed-save">Сохранить</button></div>');
  $('#ed-cover').onclick = () => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = 'image/*';
    i.onchange = () => {
      const f = i.files[0]; if (!f) return;
      newCover = f;
      const p = $('#ed-preview');
      p.src = URL.createObjectURL(f);
      p.classList.remove('hidden');
    };
    i.click();
  };
  $('#ed-save').onclick = async () => {
    const rec = Object.assign({}, t, {
      title: $('#ed-title').value.trim() || t.title,
      artist: $('#ed-artist').value.trim() || t.artist
    });
    if (newCover) {
      rec.cover = newCover;
      rec.coverUrl = URL.createObjectURL(newCover);
    }
    await dbPut(rec);
    Object.assign(t, rec);   // обновляем объект в памяти
    closeSheet();
    toast('Сохранено');
    onSaved && onSaved(rec);
  };
}

/ строка трека /
function trackRowHTML(t){
  return '<div class="row track" data-id="' + t.id + '">' +
    coverHTML(t) +
    '<div class="meta"><div class="t">' + esc(t.title) + '</div><div class="a">' + esc(t.artist) + '</div></div>' +
    '<div class="dur">' + fmtTime(t.duration) + '</div>' +
    '<button class="iconbtn sm" data-dots="' + t.id + '">' + ICONS.dots + '</button></div>';
}
/ смена порядка треков /
let suppressClick = false;
function makeDraggable(container, opts){
  opts = opts || {};
  let timer = null, active = false, row = null, pid = null, sx = 0, sy = 0, moved = false;
  const rows = () => Array.from(container.querySelectorAll('.track'));
  function stop(){
    clearTimeout(timer); timer = null;
    if (active && row) {
      row.classList.remove('dragging');
      const ids = rows().map(r => r.dataset.id);
      const wasMoved = moved;
      active = false; row = null; moved = false;
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 350);
      if (wasMoved && opts.onCommit) opts.onCommit(ids);
    } else { active = false; row = null; }
  }
  container.addEventListener('pointerdown', e => {
    if (opts.enabled && !opts.enabled()) return;
    if (e.target.closest('[data-dots]') || e.target.closest('.cbx')) return;
    const r = e.target.closest('.track');
    if (!r) return;
    pid = e.pointerId; sx = e.clientX; sy = e.clientY; row = r;
    timer = setTimeout(() => {
      active = true;
      row.classList.add('dragging');
      if (navigator.vibrate) navigator.vibrate(30);
    }, 400);
  });
  container.addEventListener('pointermove', e => {
    if (timer && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) { clearTimeout(timer); timer = null; }
    if (!active || e.pointerId !== pid) return;
    moved = true;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const over = el && el.closest ? el.closest('.track') : null;
    if (over && over !== row && container.contains(over)) {
      const rect = over.getBoundingClientRect();
      const before = (e.clientY - rect.top) < rect.height / 2;
      container.insertBefore(row, before ? over : over.nextSibling);
    }
  });
  container.addEventListener('touchmove', e => { if (active) e.preventDefault(); }, { passive: false });
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
}
