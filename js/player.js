/ плеер + логика/
const Player = {
  audio: new Audio(),
  queue: [], index: -1, pct: 0,
  shuffle: false, repeat: false,
  cur(){ return this.queue[this.index]; },
  
  async play(tracks, i){
    this.queue = tracks.slice(); this.index = i;
    await this.load();
    await this.audio.play().catch(() => toast('Не удалось воспроизвести'));
    this.updateMediaSession();
    this.render();
  },
  
  async load(){ 
    const t = this.cur(); 
    if (t) this.audio.src = t.remote ? t.remote : await trackUrl(t.id); 
  },
  
  toggle(){ 
    if (!this.cur()) return; 
    this.audio.paused ? this.audio.play() : this.audio.pause(); 
  },
  
  async next(auto){
    if (!this.queue.length) return;
    if (auto && this.repeat && !this.shuffle && this.index === this.queue.length - 1) this.index = 0;
    else if (this.shuffle && this.queue.length > 1) {
      let r; do { r = Math.floor(Math.random() * this.queue.length); } while (r === this.index);
      this.index = r;
    }
    else if (this.index < this.queue.length - 1) this.index++;
    else { if (auto) { this.audio.pause(); this.render(); } return; }
    await this.load(); 
    await this.audio.play(); 
    this.updateMediaSession();
    this.render();
  },
  
  async prev(){
    if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; }
    if (this.index > 0) { 
      this.index--; 
      await this.load(); 
      await this.audio.play(); 
      this.updateMediaSession();
      this.render(); 
    }
    else this.audio.currentTime = 0;
  },
  
  / обновление /
  updateMediaSession(){
    const t = this.cur();
    if (!t || !navigator.mediaSession) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: t.artist,
      album: 'Моя музыка',
      artwork: [
        { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect fill="%234472c4" width="512" height="512"/><text x="50%" y="50%" font-size="200" text-anchor="middle" dy=".3em" fill="white"></text></svg>', sizes: '512x512', type: 'image/svg+xml' }
      ]
    });
    
    navigator.mediaSession.setActionHandler('play', () => this.toggle());
    navigator.mediaSession.setActionHandler('pause', () => this.toggle());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next(false));
  },
  
  render(){
    const bar = $('#player'), t = this.cur();
    document.body.classList.toggle('playing', !!t);
    if (!t) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    bar.classList.remove('hidden');
    bar.innerHTML =
      '<div class="pprog"><i style="width:' + this.pct + '%"></i></div>' +
      '<div class="pmain">' + coverHTML(t, 'sm') +
      '<div class="pmeta"><div class="t">' + esc(t.title) + '</div><div class="a">' + esc(t.artist) + '</div></div>' +
      '<button class="iconbtn" id="p-toggle">' + (this.audio.paused ? ICONS.play : ICONS.pause) + '</button></div>';
    bar.onclick = () => App.go('player');
    $('#p-toggle').onclick = e => { e.stopPropagation(); this.toggle(); };
  }
};

Player.audio.addEventListener('timeupdate', () => {
  if (Player.audio.duration) Player.pct = Player.audio.currentTime / Player.audio.duration * 100;
  const i = $('#player .pprog i'); if (i) i.style.width = Player.pct + '%';
  if (navigator.mediaSession) {
    navigator.mediaSession.setPositionState({
      duration: Player.audio.duration || 0,
      playbackRate: 1.0,
      position: Player.audio.currentTime || 0
    });
  }
});
Player.audio.addEventListener('play', () => { Player.render(); if (navigator.mediaSession) navigator.mediaSession.playbackState = 'playing'; });
Player.audio.addEventListener('pause', () => { Player.render(); if (navigator.mediaSession) navigator.mediaSession.playbackState = 'paused'; });
Player.audio.addEventListener('ended', () => Player.next(true));
