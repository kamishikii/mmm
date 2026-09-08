/* Экран 3: открытый плейлист (без кнопок «Слушать» и «Перемешать все») */
Screens.playlist = {
  async render(params){
    const pl = Store.get(params.id);
    const app = $('#app');
    if (!pl) { app.innerHTML = '<div class="empty">Плейлист не найден</div>'; return; }

    const tracks = await dbAll();
    const byId = Object.fromEntries(tracks.map(t => [t.id, t]));
    const list = pl.trackIds.map(id => byId[id]).filter(Boolean);

    app.innerHTML =
      '<header class="topbar">' +
        '<button class="iconbtn" id="b-back">' + ICONS.back + '</button>' +
        '<div class="spacer"></div>' +
        '<button class="iconbtn" id="b-menu">' + ICONS.dots + '</button>' +
      '</header>' +
      '<div class="hero">' +
        '<div class="hero-cover" style="background:' + gradFor(pl.name) + '">' + ICONS.note + '</div>' +
        '<h2>' + esc(pl.name) + '</h2>' +
        '<div class="sub">Мой плейлист</div>' +
        '<div class="sub2">обновлён ' + relTime(pl.updatedAt) + '</div>' +
        '<div class="hero-actions">' +
          '<button class="sqbtn" id="b-edit">' + ICONS.pencil + '</button>' +
          '<button class="sqbtn" id="b-dl">' + ICONS.download + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="tracks" id="t-list">' +
        (list.length ? list.map(trackRowHTML).join('')
          : '<div class="empty">' + ICONS.note + '<p>В плейлисте пока пусто</p><button class="btn-primary small" id="b-add">Добавить музыку</button></div>') +
      '</div>';

    $('#b-back').onclick = () => App.back();
    $('#b-edit').onclick = () => App.go('playlist_edit', { id: pl.id });
    $('#b-dl').onclick = () => toast('Скачивание плейлиста — скоро');
    $('#b-menu').onclick = () => playlistMenu(pl);
    const ba = $('#b-add'); if (ba) ba.onclick = () => App.go('playlist_edit', { id: pl.id });

    app.onclick = e => {
      const d = e.target.closest('[data-dots]');
      if (d) {
        const id = +d.dataset.dots;
        sheetList(byId[id].title, [{ label: 'Удалить из плейлиста', danger: true, onClick: () => {
          pl.trackIds = pl.trackIds.filter(x => x !== id);
          Store.update(pl.id, { trackIds: pl.trackIds });
          toast('Удалено из плейлиста'); refresh();
        } }]);
        return;
      }
      const r = e.target.closest('.track');
      if (r) {
        const id = +r.dataset.id;
        Player.play(list, list.findIndex(t => t.id === id));
      }
    };
  }
};
