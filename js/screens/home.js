/* Экран 1: главная («Моя музыка») */
Screens.home = {
  async render(){
    const tracks = withCovers(await dbAll())
      .concat(typeof remoteTracks === 'function' ? await remoteTracks() : []);

    /* сортировка: сохранённый порядок, а новинки (без позиции) — сверху */
    const order = getOrder();
    const pos = {}; order.forEach((id, i) => { pos[String(id)] = i; });
    const sorted = tracks.slice().sort((a, b) => {
      const ia = pos[String(a.id)], ib = pos[String(b.id)];
      const ha = ia === undefined, hb = ib === undefined;
      if (ha && hb) return (b.added || (typeof b.id === 'number' ? b.id : 0)) - (a.added || (typeof a.id === 'number' ? a.id : 0));
      if (ha) return -1;
      if (hb) return 1;
      return ia - ib;
    });

    const app = $('#app');
    app.innerHTML =
      '<header class="topbar">' +
        '<button class="iconbtn" id="h-back">' + ICONS.back + '</button>' +
        '<div class="search">' + ICONS.search + '<input id="h-search" placeholder="Поиск">' + ICONS.mic + '</div>' +
        '<button class="iconbtn" id="h-dl">' + ICONS.download + '</button>' +
      '</header>' +
      '<div class="rows">' +
        '<button class="row" data-go="playlists"><span class="rico">' + ICONS.plist + '</span><span class="rtitle">Плейлисты</span><span class="chev">' + ICONS.chevron + '</span></button>' +
        '<button class="row" data-go="add_music"><span class="rico">' + ICONS.plist + '</span><span class="rtitle">Добавить аудиозапись</span><span class="chev">' + ICONS.chevron + '</span></button>' +
      '</div>' +
      '<div id="h-list" class="tracks"></div>';

    const list = $('#h-list');
    let current = sorted.slice();
    let filtered = false;
    const draw = arr => {
      current = arr.slice();
      list.innerHTML = current.length
        ? current.map(trackRowHTML).join('')
        : '<div class="empty">' + ICONS.note + '<p>В вашей музыке пока пусто</p><button class="btn-primary small" id="h-add">Добавить аудиозапись</button></div>';
      const b = $('#h-add'); if (b) b.onclick = () => App.go('add_music');
    };
    draw(sorted);

    /* перетаскивание: только когда поиск не включён */
    makeDraggable(list, {
      enabled: () => !filtered,
      onCommit: ids => {
        setOrder(ids);
        sorted.sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)));
        current = sorted.slice();
        toast('Порядок сохранён');
      }
    });

    $('#h-back').onclick = () => App.back();
    $('#h-dl').onclick = () => sheetList('Резервная копия', [
  { label: 'Экспорт копии (файл .zip)', onClick: () => exportBackup() },
  { label: 'Импорт копии из файла', onClick: () => {
      const i = document.createElement('input');
      i.type = 'file'; i.accept = '.zip,application/zip';
      i.onchange = () => { if (i.files[0]) importBackup(i.files[0]); };
      i.click();
    } }
]);
      } else {
        toast('Скачивание появится позже');
      }
    };
    $('#h-search').oninput = e => {
      const q = e.target.value.toLowerCase().trim();
      filtered = !!q;
      draw(q ? sorted.filter(t => (t.title + ' ' + t.artist).toLowerCase().includes(q)) : sorted);
    };

    app.onclick = e => {
      if (suppressClick) return;
      const go = e.target.closest('[data-go]');
      if (go) { App.go(go.dataset.go); return; }
      const dots = e.target.closest('[data-dots]');
      if (dots) {
        const sid = dots.dataset.dots;
        const i = current.findIndex(t => String(t.id) === sid);
        if (i > -1) { Player.play(current, i); App.go('player'); }
        return;
      }
      const row = e.target.closest('.track');
      if (row) {
        const sid = row.dataset.id;
        Player.play(current, current.findIndex(t => String(t.id) === sid));
      }
    };

/* меню «добавить в плейлист» (вызывается из экрана плеера) */
function addToPlaylistSheet(trackId){
  const pls = Store.all();
  sheetList('Добавить в плейлист',
    pls.map(p => ({ label: p.name, onClick: () => {
        const pl = Store.get(p.id);
        if (!pl.trackIds.map(String).includes(String(trackId))) { pl.trackIds.push(trackId); Store.update(p.id, { trackIds: pl.trackIds }); }
        toast('Добавлено в «' + p.name + '»');
      } }))
    .concat([{ label: 'Создать плейлист…', onClick: () => {
        promptSheet('Новый плейлист', '', 'Создать', name => {
          const p = Store.create(name);
          p.trackIds.push(trackId);
          Store.update(p.id, { trackIds: p.trackIds });
          toast('Плейлист создан');
        });
      } }])
  );
}
