(function () {
  'use strict';

  function hydrateDemo(stage, cssPath) {
    if (!stage || !cssPath) {
      return;
    }

    var styleLink = stage.contentDocument.querySelector('link[rel="stylesheet"]');
    if (styleLink) {
      styleLink.setAttribute('href', cssPath);
    }
  }

  function getCssPathFromButton(button) {
    if (!button) {
      return null;
    }
    return button.getAttribute('data-style-css');
  }

  function initDemoLab() {
    var stage = document.querySelector('[data-demo-stage]');
    var buttons = document.querySelectorAll('[data-style-button]');

    if (!stage || !buttons.length) {
      return;
    }

    var activeButton = null;
    for (var i = 0; i < buttons.length; i += 1) {
      if (buttons[i].classList.contains('is-active')) {
        activeButton = buttons[i];
        break;
      }
    }
    if (!activeButton) {
      activeButton = buttons[0];
      activeButton.classList.add('is-active');
    }

    var render = function () {
      var cssPath = getCssPathFromButton(activeButton);
      if (cssPath) {
        hydrateDemo(stage, cssPath);
      }
    };

    var setActiveButton = function (button) {
      if (!button || button === activeButton) {
        render();
        return;
      }
      activeButton = button;
      for (var j = 0; j < buttons.length; j += 1) {
        var item = buttons[j];
        item.classList.toggle('is-active', item === activeButton);
      }
      render();
    };

    for (var k = 0; k < buttons.length; k += 1) {
      buttons[k].addEventListener('click', function (event) {
        setActiveButton(event.currentTarget);
      });
    }

    stage.addEventListener('load', function() {
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', initDemoLab);
})();
