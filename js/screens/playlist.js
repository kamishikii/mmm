/ плейлист /
Screens.playlist = {
  async render(params){
    const pl = Store.get(params.id);
    const app = $('#app');
    if (!pl) { app.innerHTML = '<div class="empty">Плейлист не найден</div>'; return; }

    const editMode = !!params.edit;
    const tracks = withCovers(await dbAll())
      .concat(typeof remoteTracks === 'function' ? await remoteTracks() : []);
    const byId = {}; tracks.forEach(t => byId[String(t.id)] = t);
    const list = pl.trackIds.map(id => byId[String(id)]).filter(Boolean);

    app.innerHTML =
      '<header class="topbar">' +
        '<button class="iconbtn" id="b-back">' + ICONS.back + '</button>' +
        (editMode
          ? '<div class="h1">Редактирование</div><button class="iconbtn" id="b-done">' + ICONS.check + '</button>'
          : '<div class="spacer"></div><button class="iconbtn" id="b-menu">' + ICONS.dots + '</button>') +
      '</header>' +
      (editMode
        ? '<div class="sect">♡ ︎</div>' +
          '<div class="rows"><button class="row" id="b-add2"><span class="rico tile">' + ICONS.plus + '</span><span class="rtitle blue">Добавить музыку</span></button></div>'
        : '<div class="hero">' +
            '<div class="hero-cover" style="background:' + gradFor(pl.name) + '">' + ICONS.note + '</div>' +
            '<h2>' + esc(pl.name) + '</h2>' +
            '<div class="sub">Мой плейлист</div>' +
            '<div class="sub2">обновлён ' + relTime(pl.updatedAt) + '</div>' +
            '<div class="hero-actions">' +
              '<button class="sqbtn" id="b-edit">' + ICONS.pencil + '</button>' +
              '<button class="sqbtn" id="b-dl">' + ICONS.download + '</button>' +
            '</div>' +
          '</div>') +
      '<div class="tracks" id="t-list">' +
        (list.length ? list.map(trackRowHTML).join('')
          : '<div class="empty">' + ICONS.note + '<p>В плейлисте пока пусто</p><button class="btn-primary small" id="b-add">Добавить музыку</button></div>') +
      '</div>';

    $('#b-back').onclick = () => App.back();

    if (editMode) {
      $('#b-done').onclick = () => App.back();
      const ba2 = $('#b-add2'); if (ba2) ba2.onclick = () => App.go('playlist_edit', { id: pl.id });
      makeDraggable($('#t-list'), {
        enabled: () => true,
        onCommit: ids => {
          pl.trackIds = ids.map(sid => {
            const orig = pl.trackIds.find(x => String(x) === sid);
            return orig !== undefined ? orig : sid;
          });
          Store.update(pl.id, { trackIds: pl.trackIds });
          toast('Порядок сохранён');
        }
      });
    } else {
      $('#b-edit').onclick = () => App.go('playlist', { id: pl.id, edit: 1 });
      $('#b-dl').onclick = () => toast('Скачивание плейлиста — скоро');
      $('#b-menu').onclick = () => playlistMenu(pl);
      const ba = $('#b-add'); if (ba) ba.onclick = () => App.go('playlist_edit', { id: pl.id });
    }

    app.onclick = e => {
      if (suppressClick) return;
      const d = e.target.closest('[data-dots]');
      if (d) {
        const sid = d.dataset.dots;
        const tr = byId[sid];
        sheetList(tr.title, [
          { label: 'Открыть в плеере', onClick: () => { Player.play(list, list.findIndex(t => String(t.id) === sid)); App.go('player'); } },
          { label: 'Удалить из плейлиста', danger: true, onClick: () => {
              pl.trackIds = pl.trackIds.filter(x => String(x) !== sid);
              Store.update(pl.id, { trackIds: pl.trackIds });
              toast('Удалено из плейлиста'); refresh();
            } }
        ]);
        return;
      }
      const r = e.target.closest('.track');
      if (r) {
        if (editMode) return;   // в режиме редактирования тап не запускает песню
        const sid = r.dataset.id;
        Player.play(list, list.findIndex(t => String(t.id) === sid));
      }
    };
  }
};

function playlistMenu(p){
  if (!p) return;
  sheetList(p.name, [
    { label: 'Открыть', onClick: () => App.go('playlist', { id: p.id }) },
    { label: 'Переименовать', onClick: () => promptSheet('Переименовать', p.name, 'Сохранить', name => { Store.update(p.id, { name }); refresh(); }) },
    { label: 'Удалить', danger: true, onClick: () => confirmSheet('Удалить плейлист «' + p.name + '»?', () => { Store.remove(p.id); toast('Плейлист удалён'); refresh(); }) }
  ]);
}
