/* Мини-плеер внизу экрана */
const Player = {
  audio: new Audio(),
  queue: [], index: -1, pct: 0,
  cur(){ return this.queue[this.index]; },
  async play(tracks, i){
    this.queue = tracks.slice(); this.index = i;
    await this.load();
    this.audio.play().catch(() => toast('Не удалось воспроизвести'));
    this.render();
  },
  async load(){ const t = this.cur(); if (t) this.audio.src = await trackUrl(t.id); },
  toggle(){
    if (!this.cur()) return;
    this.audio.paused ? this.audio.play() : this.audio.pause();
  },
  async next(){
    if (this.index < this.queue.length - 1) {
      this.index++; await this.load(); this.audio.play(); this.render();
    }
  },
  render(){
    const bar = $('#player'), t = this.cur();
    document.body.classList.toggle('playing', !!t);
    if (!t) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    bar.classList.remove('hidden');
    bar.innerHTML =
      '<div class="pprog"><i style="width:' + this.pct + '%"></i></div>' +
      '<div class="pmain">' + coverHTML(t.title, 'sm') +
      '<div class="pmeta"><div class="t">' + esc(t.title) + '</div><div class="a">' + esc(t.artist) + '</div></div>' +
      '<button class="iconbtn" id="p-toggle">' + (this.audio.paused ? ICONS.play : ICONS.pause) + '</button></div>';
    $('#p-toggle').onclick = () => this.toggle();
  }
};
Player.audio.addEventListener('timeupdate', () => {
  if (Player.audio.duration) Player.pct = Player.audio.currentTime / Player.audio.duration * 100;
  const i = $('#player .pprog i'); if (i) i.style.width = Player.pct + '%';
});
Player.audio.addEventListener('play',  () => Player.render());
Player.audio.addEventListener('pause', () => Player.render());
Player.audio.addEventListener('ended', () => Player.next());
