/* Резервные копии библиотеки: экспорт/импорт zip. Файл только у тебя. */
async function exportBackup(){
  if (!window.JSZip) { toast('JSZip не загрузился (нужен интернет)'); return; }
  const tracks = await dbAll();
  if (!tracks.length) { toast('Пока нечего резервировать'); return; }
  toast('Готовим архив…');
  try {
    const zip = new JSZip();
    const metas = [];
    for (const t of tracks) {
      const blob = t.blob || await dbGetBlob(t.id);
      if (!blob) continue;
      zip.file('tracks/' + t.id + '.bin', blob);
      const m = { id: t.id, title: t.title, artist: t.artist, duration: t.duration,
                  type: blob.type || t.type || 'audio/mpeg', cover: null };
      const cover = t.cover || (t.coverSrc ? await dbGetCoverBlob(t.id) : null);
      if (cover) { zip.file('covers/' + t.id + '.bin', cover); m.cover = cover.type || 'image/jpeg'; }
      metas.push(m);
    }
    zip.file('meta.json', JSON.stringify(metas));
    zip.file('playlists.json', JSON.stringify(Store.all()));
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-music-backup-' + new Date().toISOString().slice(0, 10) + '.zip';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('Архив в загрузках — спрячь его в приватное место');
  } catch (e) { console.error(e); toast('Не удалось создать архив'); }
}

async function importBackup(file){
  if (!window.JSZip) { toast('JSZip не загрузился (нужен интернет)'); return; }
  try {
    const zip = await JSZip.loadAsync(file);
    const metaFile = zip.file('meta.json');
    if (!metaFile) { toast('Это не резервная копия библиотеки'); return; }
    const metas = JSON.parse(await metaFile.async('string'));
    let added = 0, skipped = 0;
    for (const m of metas) {
      if (await dbGet(m.id)) { skipped++; continue; }
      const f = zip.file('tracks/' + m.id + '.bin');
      if (!f) { skipped++; continue; }
      const raw = await f.async('blob');
      const rec = { id: m.id, title: m.title, artist: m.artist, duration: m.duration,
                    blob: new Blob([raw], { type: m.type || 'audio/mpeg' }) };
      const c = m.cover && zip.file('covers/' + m.id + '.bin');
      if (c) rec.cover = new Blob([await c.async('blob')], { type: m.cover });
      await dbPut(rec);
      added++;
    }
    let plAdded = 0;
    const plFile = zip.file('playlists.json');
    if (plFile) {
      const backupPls = JSON.parse(await plFile.async('string'));
      const cur = Store.all();
      const have = new Set(cur.map(p => String(p.id)));
      backupPls.forEach(p => { if (!have.has(String(p.id))) { cur.push(p); plAdded++; } });
      Store.save(cur);
    }
    toast('Восстановлено: треков ' + added + ', плейлистов ' + plAdded +
          (skipped ? ' (пропущено: ' + skipped + ')' : ''));
    refresh();
  } catch (e) { console.error(e); toast('Не удалось прочитать файл копии'); }
}
