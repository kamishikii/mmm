/* Экран 5: загрузка музыки с устройства */
Screens.add_music = {
  async render(){
    const app = $('#app');
    let pending = [];
    app.innerHTML =
      '<header class="topbar">' +
        '<button class="iconbtn" id="a-back">' + ICONS.back + '</button>' +
        '<div class="h1">Добавить аудиозапись</div>' +
        '<div class="iconbtn"></div>' +
      '</header>' +
      '<div class="dropzone" id="a-drop">' +
        '<div class="dz-ico">' + ICONS.upload + '</div>' +
        '<div class="dz-t">Музыка с устройства</div>' +
        '<div class="dz-s">Выберите аудиофайлы — название и исполнитель подтянутся из имени файла (формат «Исполнитель - Название»)</div>' +
        '<button class="btn-primary small" id="a-pick">Выбрать файлы</button>' +
      '</div>' +
      '<div class="tracks" id="a-list"></div>' +
      '<div class="bottombar hidden" id="a-bar"><button class="btn-primary block" id="a-save">Добавить в мою музыку</button></div>';

    const fi = $('#file-input');
    const draw = () => {
      $('#a-list').innerHTML = pending.map((p, i) =>
        '<div class="row track">' + coverHTML(p.title) +
        '<div class="meta"><div class="t">' + esc(p.title) + '</div><div class="a">' + esc(p.artist) + ' · ' + fmtSize(p.file.size) + '</div></div>' +
        '<button class="iconbtn sm" data-rm="' + i + '">' + ICONS.x + '</button></div>').join('');
      $('#a-bar').classList.toggle('hidden', !pending.length);
      $('#a-save').textContent = 'Добавить в мою музыку' + (pending.length ? ' (' + pending.length + ')' : '');
      $$('#a-list [data-rm]').forEach(b => b.onclick = () => { pending.splice(+b.dataset.rm, 1); draw(); });
    };

    const addFiles = files => {
      [...files].forEach(f => {
        if (!f.type.startsWith('audio') && !/\.(mp3|ogg|wav|flac|m4a|aac)$/i.test(f.name)) return;
        const m = parseFileName(f.name);
        pending.push({ file: f, title: m.title, artist: m.artist });
      });
      draw();
    };

    $('#a-pick').onclick = () => fi.click();
    fi.onchange = () => { addFiles(fi.files); fi.value = ''; };
    const dz = $('#a-drop');
    dz.ondragover = e => { e.preventDefault(); dz.classList.add('over'); };
    dz.ondragleave = () => dz.classList.remove('over');
    dz.ondrop = e => { e.preventDefault(); dz.classList.remove('over'); addFiles(e.dataTransfer.files); };
    $('#a-back').onclick = () => App.back();

    $('#a-save').onclick = async () => {
      if (!pending.length) return;
      $('#a-save').disabled = true; $('#a-save').textContent = 'Добавляем…';
      for (const p of pending) {
        const duration = await readDuration(p.file);
        await dbAdd({ title: p.title, artist: p.artist, duration, blob: p.file, added: Date.now() });
      }
      toast('Добавлено аудиозаписей: ' + pending.length);
      pending = [];
      App.reset('home');   // названия сразу видны на главной
    };
  }
};

function readDuration(blob){
  return new Promise(res => {
    const a = document.createElement('audio');
    const u = URL.createObjectURL(blob);
    a.preload = 'metadata';
    a.onloadedmetadata = () => { const d = a.duration || 0; URL.revokeObjectURL(u); res(d); };
    a.onerror = () => { URL.revokeObjectURL(u); res(0); };
    a.src = u;
  });
}
function fmtSize(b){ return b > 1048576 ? (b / 1048576).toFixed(1) + ' МБ' : Math.max(1, Math.round(b / 1024)) + ' КБ'; }
