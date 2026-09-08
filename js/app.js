/* Роутер экранов + старт */
const Screens = {};
const App = {
  stack: [],
  start(){
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    this.stack = [{ screen: 'home', params: {} }];
    history.replaceState({ d: 1 }, '');
    this.show();
    window.addEventListener('popstate', () => {
      if (this.stack.length > 1) { this.stack.pop(); this.show(); }
    });
  },
  go(screen, params){
    this.stack.push({ screen, params: params || {} });
    history.pushState({ d: this.stack.length }, '');
    this.show();
  },
  back(){ if (this.stack.length > 1) history.back(); },
  reset(screen, params){
    this.stack = [{ screen, params: params || {} }];
    history.replaceState({ d: 1 }, '');
    this.show();
  },
  cur(){ return this.stack[this.stack.length - 1]; },
  async show(){
    closeSheet();
    const s = this.cur();
    $('#app').innerHTML = '<div class="loading">Загрузка…</div>';
    try {
      if (!Screens[s.screen]) throw new Error('экран "' + s.screen + '" не найден (файл не подключён?)');
      await Screens[s.screen].render(s.params || {});
    } catch (err) {
      $('#app').innerHTML = '<div class="empty"><p>Ошибка на экране «' + s.screen + '»:<br>' + err.message + '</p></div>';
      console.error(err);
    }
    window.scrollTo(0, 0);
  }
};
function refresh(){ App.show(); }

document.addEventListener('DOMContentLoaded', () => {
  $('#sheet-backdrop').onclick = closeSheet;
  App.start();
});
