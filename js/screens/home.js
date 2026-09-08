/* Экран 1: главная («Моя музыка») */
Screens.home = {
  async render(){
    const tracks = await dbAll();
    const app = $('#app');
    app.innerHTML =
      '<header class="topbar">' +
        '<button class="iconbtn" id="h-back">' + ICONS.back + '</button>' +
        '<div class="search">' + ICONS.search + '<input id="h-search" placeholder="Поиск">' + ICONS.mic + '</div>' +
        '<button class="iconbtn" id="h-dl">' + ICONS.download + '</button>' +
      '</header>' +
      '<nav class="tabs" id="h-tabs">' +
        ['Главная','Моя музыка','Книги и шоу','Обзор','Радио'].map(t =>
          '<button class="tab' + (t === 'Моя музыка' ? ' active' : '') + '" data-tab="' + t + '">' + t + '</button>').join('') +
      '</nav>' +
      '<div class="rows">' +
        '<button class="row" data-go="playlists"><span class="rico">' + ICONS.plist + '</span><span class="rtitle">Плейлисты</span><span class="chev">' + ICONS.chevron + '</span></button>' +
        '<button class="row" data-go="add_music"><span class="rico">' + ICONS.plist + '</span><span class="rtitle">Добавить аудиозапись</span><span class="chev">' + ICONS.chevron + '</span></button>' +
      '</div>' +
      '<div id="h-list" class="tracks"></div>';

    const list = $('#h-list');
    const draw = arr => {
      list.innerHTML = arr.length
        ? arr.map(trackRowHTML).join('')
        : '<div class="empty">' + ICONS.note + '<p>В вашей музыке пока пусто</p><button class="btn-primary small" id="h-add">Добавить аудиозапись</button></div>';
      const b = $('#h-add'); if (b) b.onclick = () => App.go('add_music');
    };
    draw(tracks);

    $('#h-back').onclick = () => App.back();
    $('#h-dl').onclick = () => toast('Скачивание появится в APK-версии');
    $('#h-search').oninput = e => {
      const q = e.target.value.toLowerCase().trim();
      draw(tracks.filter(t => (t.title + ' ' + t.artist).toLowerCase().includes(q)));
    };
    $$('#h-tabs .tab').forEach(b => b.onclick = () => {
      if (!b.classList.contains('active')) toast('Раздел «' + b.dataset.tab + '» скоро появится');
    });

    app.onclick = e => {
      const go = e.target.closest('[data-go]');
      if (go) { App.go(go.dataset.go); return; }
      const dots = e.target.closest('[data-dots]');
      if (dots) { trackMenu(+dots.dataset.dots, tracks); return; }
      const row = e.target.closest('.track');
      if (row) {
        const id = +row.dataset.id;
        Player.play(tracks, tracks.findIndex(t => t.id === id));
      }
    };
  }
};

/* меню трека (три точки) */
function trackMenu(id, all){
  const t = all.find(x => x.id === id); if (!t) return;
  sheetList(t.title, [
    { label: 'Добавить в плейлист', onClick: () => addToPlaylistSheet(id) },
    { label: 'Удалить из моей музыки', danger: true, onClick: async () => {
        await dbDel(id);
        const pls = Store.all(); let ch = false;
        pls.forEach(p => { const i = p.trackIds.indexOf(id); if (i > -1) { p.trackIds.splice(i, 1); ch = true; } });
        if (ch) Store.save(pls);
        toast('Аудиозапись удалена'); refresh();
      } }
  ]);
}
function addToPlaylistSheet(trackId){
  const pls = Store.all();
  sheetList('Добавить в плейлист',
    pls.map(p => ({ label: p.name, onClick: () => {
        const pl = Store.get(p.id);
        if (!pl.trackIds.includes(trackId)) { pl.trackIds.push(trackId); Store.update(p.id, { trackIds: pl.trackIds }); }
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
