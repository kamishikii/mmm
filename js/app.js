/* Роутер экранов + старт */
const Screens = {};
const App = {
  stack: [],
  start(){
    this.stack = [{ screen: 'home', params: {} }];
    history.replaceState({ d: 1 }, '');
    this.show();
    window.addEventListener('popstate', () => {   // системная кнопка «назад»
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
    await Screens[s.screen].render(s.params || {});
    window.scrollTo(0, 0);
  }
};
function refresh(){ App.show(); }

document.addEventListener('DOMContentLoaded', () => {
  $('#sheet-backdrop').onclick = closeSheet;
  App.start();
});
