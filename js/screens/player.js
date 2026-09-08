/* Полноэкранный плеер */
Screens.player = {
  async render(){
    if (!Player.cur()) { App.back(); return; }
    if (window._pIv) clearInterval(window._pIv);
    const app = $('#app');
    app.innerHTML =
      '<header class="topbar" style="justify-content:center"><button class="iconbtn gray" id="pp-close">' + ICONS.caret + '</button></header>' +
      '<div class="pcover-wrap"><div class="pcover" id="pp-cover"></div></div>' +
      '<div class="pseek">' +
        '<input type="range" id="pp-seek" min="0" max="1000" value="0">' +
        '<div class="ptime"><span id="pp-cur">0:00</span><span id="pp-left">-0:00</span></div>' +
      '</div>' +
      '<div class="ptitle-row"><div class="ptitle"><h2 id="pp-title"></h2><div class="partist" id="pp-artist"></div></div>' +
        '<button class="iconbtn gray edit" id="pp-edit">' + ICONS.pencil + '</button></div>' +
      '<div class="pctrls">' +
        '<button class="iconbtn dark" id="pp-dl">' + ICONS.download + '</button>' +
        '<button class="iconbtn dark big" id="pp-prev">' + ICONS.prev + '</button>' +
        '<button class="iconbtn dark huge" id="pp-play">' + ICONS.play + '</button>' +
        '<button class="iconbtn dark big" id="pp-next">' + ICONS.next + '</button>' +
        '<button class="iconbtn dark" id="pp-menu">' + ICONS.dots + '</button>' +
      '</div>' +
      '<div class="pbottom">' +
        '<button class="iconbtn gray' + (Player.shuffle ? ' active' : '') + '" id="pp-shuffle">' + ICONS.shuffle + '</button>' +
        '<button class="iconbtn gray" id="pp-queue">' + ICONS.queue + '</button>' +
        '<button class="iconbtn gray' + (Player.repeat ? ' active' : '') + '" id="pp-repeat">' + ICONS.repeat + '</button>' +
      '</div>';

    const el = {
      cover: $('#pp-cover'), title: $('#pp-title'), artist: $('#pp-artist'),
      cur: $('#pp-cur'), left: $('#pp-left'), seek: $('#pp-seek'), play: $('#pp-play'), shownId: null
    };

    const paint = () => {
      const t = Player.cur(); if (!t) return;
      if (el.shownId !== t.id) {
        el.shownId = t.id;
        el.title.textContent = t.title;
        el.artist.textContent = t.artist;
        if (t.coverUrl) { el.cover.style.backgroundImage = 'url(' + t.coverUrl + ')'; el.cover.innerHTML = ''; }
        else { el.cover.style.backgroundImage = ''; el.cover.style.background = gradFor(t.title); el.cover.innerHTML = ICONS.note; }
      }
      const d = Player.audio.duration || t.duration || 0, c = Player.audio.currentTime || 0;
      el.cur.textContent = fmtTime(c);
      el.left.textContent = '-' + fmtTime(Math.max(0, d - c));
      if (!el.seek.matches(':active')) el.seek.value = d ? Math.round(c / d * 1000) : 0;
      el.play.innerHTML = Player.audio.paused ? ICONS.play : ICONS.pause;
    };
    paint();
    window._pIv = setInterval(paint, 400);

    $('#pp-close').onclick = () => App.back();
    el.seek.addEventListener('input', e => {
      const d = Player.audio.duration || 0;
      if (d) Player.audio.currentTime = (e.target.value / 1000) * d;
    });
    $('#pp-play').onclick = () => Player.toggle();
    $('#pp-next').onclick = () => Player.next(false);
    $('#pp-prev').onclick = () => Player.prev();
    $('#pp-dl').onclick = () => toast('Скачивание появится в APK-версии');
    $('#pp-shuffle').onclick = e => { Player.shuffle = !Player.shuffle; e.currentTarget.classList.toggle('active', Player.shuffle); };
    $('#pp-repeat').onclick = e => { Player.repeat = !Player.repeat; e.currentTarget.classList.toggle('active', Player.repeat); };
    $('#pp-queue').onclick = () => sheetList('Очередь', Player.queue.map((q, i) => ({ label: q.title, onClick: () => Player.play(Player.queue, i) })));
    $('#pp-edit').onclick = () => openEditSheet(Player.cur(), () => { el.shownId = null; paint(); Player.render(); });
    $('#pp-menu').onclick = () => {
      const t = Player.cur();
      sheetList(t.title, [
        { label: 'Добавить в плейлист', onClick: () => addToPlaylistSheet(t.id) },
        { label: 'Изменить информацию', onClick: () => openEditSheet(t, () => { el.shownId = null; paint(); Player.render(); }) },
        { label: 'Удалить из моей музыки', danger: true, onClick: async () => {
            await dbDel(t.id);
            const pls = Store.all(); let ch = false;
            pls.forEach(p => { const i = p.trackIds.indexOf(t.id); if (i > -1) { p.trackIds.splice(i, 1); ch = true; } });
            if (ch) Store.save(pls);
            Player.audio.pause(); Player.queue = []; Player.index = -1; Player.render();
            toast('Аудиозапись удалена');
            App.back(); refresh();
          } }
      ]);
    };
  }
};
