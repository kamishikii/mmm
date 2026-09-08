# Моя музыка (клон ВК-музыки)

Веб-приложение, готовое к конвертации в APK. Все данные хранятся локально
(IndexedDB — аудиофайлы, localStorage — плейлисты), на сервер ничего не грузится.

## Запуск локально
python -m http.server 8000   (или npx serve) → открыть http://localhost:8000

## GitHub Pages
Залей папку как есть → Settings → Pages → ветка main / root.

## Сборка APK (Capacitor)
1. npm init -y
2. npm i @capacitor/core @capacitor/cli @capacitor/android
3. npx cap init "MyMusic" com.example.mymusic --web-dir=.
4. npx cap add android
5. npx cap copy
6. npx cap open android  → Build → Build APK в Android Studio

Опционально (системная кнопка «назад» в APK):
npm i @capacitor/app и в app.js:
if (window.Capacitor) {
  Capacitor.Plugins.App.addListener('backButton', () => history.back());
}
