/* Экран 2: все плейлисты */
Screens.playlists = {
  async render(){
    const pls = Store.all();
    const app = $('#app');
    app.innerHTML =
      '<header class="topbar">' +
        '<button class="iconbtn" id="p-back">' + ICONS.back + '</button>' +
        '<div class="h1">Все плейлисты ' + ICONS.caret + '</div>' +
        '<button class="iconbtn" id="p-edit">' + ICONS.pencil + '</button>' +
      '</header>' +
      '<div class="rows">' +
        '<button class="row" id="pl-create"><span class="rico tile">' + ICONS.plus + '</span><span class="rtitle blue">Создать плейлист</span></button>' +
      '</div>' +
      '<div class="tracks" id="pl-list">' +
        (pls.length ? pls.map(p =>
          '<div class="row track" data-pl="' + p.id + '">' +
            '<div class="cover" style="background:' + gradFor(p.name) + '">' + ICONS.note + '</div>' +
            '<div class="meta"><div class="t">' + esc(p.name) + '</div><div class="a">Мой плейлист</div></div>' +
            '<button class="iconbtn sm" data-dots="' + p.id + '">' + ICONS.dots + '</button></div>'
        ).join('') : '<div class="empty">' + ICONS.plist + '<p>Плейлистов пока нет</p></div>') +
      '</div>';

    $('#p-back').onclick = () => App.back();
    $('#p-edit').onclick = () => toast('Редактирование списка плейлистов — скоро');
    $('#pl-create').onclick = () => promptSheet('Новый плейлист', '', 'Создать', name => {
      const p = Store.create(name);
      toast('Плейлист «' + name + '» создан');
      App.go('playlist', { id: p.id });
    });

    app.onclick = e => {
      const d = e.target.closest('[data-dots]');
      if (d) { playlistMenu(Store.get(d.dataset.dots)); return; }
      const r = e.target.closest('[data-pl]');
      if (r) App.go('playlist', { id: r.dataset.pl });
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
