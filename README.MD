*** Raketa Project

Сторонние скрипты:
    additional-methods.js - дополнительные методы для валидации форм
    jquery.creditCardValidator.js - валидация кредитных карт с возможностью определения типа карты
    jquery.datetimepicker.full.js - используется в виджете выбора даты заказа
    jquery.easing.js - дополнительные плавности переходов от одного состояния к другому
    jquery.kladr.js - доступ по API к kladr (базе данных адресов и т.п.)
    jquery.magnific-popup.js - Модальные окна
    jquery.maskedinput.js - Текстовые поля с маской ввода
    jquery.spinner.js -  добавляет к полям "Количество" управляемые + и -
    jquery.tooltipster.js - высплывающие подсказки
    jquery.touchSwipe.js - поддержка тач жестов для устройств
    jquery.transit.js  - реализация transition с коллбэками
    jquery.validate.js - валидация форм
    jRate.js - рейтинг
    js.cookie.js - работа с cookie
    moment.js - библиотека времени
    owl.carousel.js - слайдер
    selectize.js - кастомизированный select
    tmpl.js - шаблоны для js
Некоторые из скриптов поставляются со своими стилями(css), которые также используются в приложении (стили изменены)
В вендорных скриптах изменения не отмечались или отмечались комментарием //Raketa


Три режима отображения desktop приложения Object device:
    Пример: {orientation: "landscape", type: "desktop", subtype: "hd", windowHeight: 979, windowWidth: 1338}
    subtype сообщает о текущем типе экрана в зависимости от разрешения
        hd - разрешение экрана от 1281 до 1440 в ширину
        fullhd - разрешение экрана более 1441 в ширину
        small - разрешение экрана от 1024 до 1280 в ширину
    отдельно, без опознования в объекте device, прописаны css media queries для разрешения выше 1921

Проверены следующие разрешения экранов:
    1024x768
    1280x720
    1440x900
    1920x1080
    2560x1440 (режим эмуляции)

...



