/* Экран 4: «Добавить музыку» — галочки + сохранение */
Screens.playlist_edit = {
  async render(params){
    const pl = Store.get(params.id);
    const app = $('#app');
    if (!pl) { app.innerHTML = '<div class="empty">Плейлист не найден</div>'; return; }

    const tracks = await dbAll();
    const sel = new Set(pl.trackIds);

    app.innerHTML =
      '<header class="topbar">' +
        '<button class="iconbtn" id="e-close">' + ICONS.x + '</button>' +
        '<div class="h1">Добавить музыку</div>' +
        '<button class="iconbtn" id="e-save-top">' + ICONS.check + '</button>' +
      '</header>' +
      '<div class="sect">Моя музыка <span>' + tracks.length + '</span></div>' +
      '<div class="tracks" id="e-list">' +
        (tracks.length ? tracks.map(t =>
          '<div class="row track" data-id="' + t.id + '">' +
            coverHTML(t.title) +
            '<div class="meta"><div class="t">' + esc(t.title) + '</div><div class="a">' + esc(t.artist) + '</div></div>' +
            '<span class="cbx' + (sel.has(t.id) ? ' on' : '') + '">' + ICONS.check + '</span></div>'
        ).join('') : '<div class="empty">' + ICONS.note + '<p>Сначала добавьте музыку с устройства</p><button class="btn-primary small" id="e-go-add">Добавить аудиозапись</button></div>') +
      '</div>' +
      '<div class="bottombar"><button class="btn-primary block" id="e-save">Сохранить</button></div>';

    const ga = $('#e-go-add'); if (ga) ga.onclick = () => App.go('add_music');
    $('#e-close').onclick = () => App.back();

    $('#e-list').onclick = e => {
      const r = e.target.closest('.track'); if (!r) return;
      const id = +r.dataset.id, c = r.querySelector('.cbx');
      if (sel.has(id)) { sel.delete(id); c.classList.remove('on'); }
      else { sel.add(id); c.classList.add('on'); }
    };

    const save = () => {
      Store.update(pl.id, { trackIds: tracks.filter(t => sel.has(t.id)).map(t => t.id) });
      toast('Плейлист «' + pl.name + '» обновлён');
      App.back();
    };
    $('#e-save').onclick = save;
    $('#e-save-top').onclick = save;
  }
};
