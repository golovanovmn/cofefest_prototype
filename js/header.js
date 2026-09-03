(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var burger = document.querySelector('.header__burger');
    var menu = document.querySelector('.header__burger-menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.classList.toggle('lock');
      });
    }

    var searchBtn = document.getElementById('header-search');
    var searchBlock = document.querySelector('.header__search-block');
    var topList = document.querySelector('.header__top-list');
    if (searchBtn && searchBlock) {
      searchBtn.addEventListener('click', function () {
        searchBlock.classList.add('active');
        if (topList) topList.classList.add('active');
      });
    }
    var searchClose = document.querySelector('.header__search-close-icon');
    if (searchClose && searchBlock) {
      searchClose.addEventListener('click', function (e) {
        e.preventDefault();
        searchBlock.classList.remove('active');
        if (topList) topList.classList.remove('active');
      });
    }

    document.querySelectorAll('.header .acc-head').forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.closest('.acc-item');
        var content = item.querySelector('.acc-content');
        var open = item.classList.contains('active');
        document.querySelectorAll('.header .acc-item').forEach(function (other) {
          other.classList.remove('active');
          var c = other.querySelector('.acc-content');
          if (c) c.style.maxHeight = '0px';
        });
        if (!open) {
          item.classList.add('active');
          if (content) content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });

    document.querySelectorAll('.footer__top-block__heading').forEach(function (head) {
      head.addEventListener('click', function () {
        if (!window.matchMedia('(max-width: 48em)').matches) return;
        var block = head.closest('.footer__top-block');
        if (block) block.classList.toggle('open');
      });
    });
  });
})();
