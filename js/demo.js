(function () {
  'use strict';

  var DEMO_TEMPLATE =
    '<div class="demo-page">' +
    '<header class="demo-hero">' +
    '<p class="demo-eyebrow">Concept atlas</p>' +
    '<h1>One page, three moods</h1>' +
    '<p>' +
    'Explore how the same content can stretch from editorial calm to neon-heavy motion cues. Buttons,' +
    'typography and spacing adapt per theme.' +
    '</p>' +
    '<div class="demo-actions">' +
    '<button class="demo-button demo-button-primary">Launch explorer</button>' +
    '<button class="demo-button demo-button-ghost">Share a creative brief</button>' +
    '</div>' +
    '</header>' +
    '<section class="demo-stats">' +
    '<article class="demo-stat">' +
    '<span class="demo-stat-label">Prototype time</span>' +
    '<strong class="demo-stat-value">48 min</strong>' +
    '</article>' +
    '<article class="demo-stat">' +
    '<span class="demo-stat-label">Figma frames</span>' +
    '<strong class="demo-stat-value">32</strong>' +
    '</article>' +
    '<article class="demo-stat">' +
    '<span class="demo-stat-label">Interaction ideas</span>' +
    '<strong class="demo-stat-value">12</strong>' +
    '</article>' +
    '</section>' +
    '<section class="demo-grid">' +
    '<article class="demo-card">' +
    '<h3 class="demo-card-title">Layered hero sections</h3>' +
    '<p class="demo-card-text">' +
    'Combine bento cards, gradients and playful typography to set the tone for product stories.' +
    '</p>' +
    '</article>' +
    '<article class="demo-card">' +
    '<h3 class="demo-card-title">Audience stories</h3>' +
    '<p class="demo-card-text">' +
    'Mix testimonials with KPIs so stakeholders see both the narrative and the measurable impact.' +
    '</p>' +
    '</article>' +
    '<article class="demo-card">' +
    '<h3 class="demo-card-title">Micro-grid gallery</h3>' +
    '<p class="demo-card-text">' +
    'Tile mockups, device frames and UI snippets in a masonry-inspired collage for quick scanning.' +
    '</p>' +
    '</article>' +
    '</section>' +
    '<section class="demo-gallery">' +
    '<figure>' +
    '<strong>Signal gradients</strong>' +
    '<figcaption>Soft glows and spotlight accents that frame the content without overpowering it.</figcaption>' +
    '</figure>' +
    '<figure>' +
    '<strong>Product rituals</strong>' +
    '<figcaption>Step cards highlight onboarding journeys, toolchains and collaborative reviews.</figcaption>' +
    '</figure>' +
    '<figure>' +
    '<strong>System grid</strong>' +
    '<figcaption>Baseline grid locked to 4px rhythm keeps cards, charts and copy aligned.</figcaption>' +
    '</figure>' +
    '</section>' +
    '<section class="demo-process">' +
    '<header class="demo-process-header">' +
    '<p class="demo-process-kicker">Flow</p>' +
    '<h3>Concept to hand-off</h3>' +
    '<p>' +
    'A linear narrative that keeps research, co-creation and delivery in one space so feedback loops remain short.' +
    '</p>' +
    '</header>' +
    '<div class="demo-process-steps">' +
    '<article class="demo-process-step">' +
    '<span class="demo-process-number">01</span>' +
    '<h4>Discovery</h4>' +
    '<p>Lightweight research boards and journey maps align the team on goals within two days.</p>' +
    '</article>' +
    '<article class="demo-process-step">' +
    '<span class="demo-process-number">02</span>' +
    '<h4>Sprint</h4>' +
    '<p>Bento boards track hypotheses, layout tests and voice explorations with async comments.</p>' +
    '</article>' +
    '<article class="demo-process-step">' +
    '<span class="demo-process-number">03</span>' +
    '<h4>Systems pass</h4>' +
    '<p>Component tokens and motion cues ship in a portable kit for dev-ready documentation.</p>' +
    '</article>' +
    '</div>' +
    '</section>' +
    '<section class="demo-pricing">' +
    '<article class="demo-pricing-card">' +
    '<p class="demo-pricing-kicker">Rapid lab</p>' +
    '<h3>48h pulse</h3>' +
    '<p class="demo-pricing-copy">Perfect for one hero route, three alternates and a micro-interaction pack.</p>' +
    '<ul>' +
    '<li>1 narrative deck</li>' +
    '<li>Interactive prototype</li>' +
    '<li>License-ready assets</li>' +
    '</ul>' +
    '<button class="demo-button demo-button-primary">Reserve slot</button>' +
    '</article>' +
    '<article class="demo-pricing-card">' +
    '<p class="demo-pricing-kicker">Studio partner</p>' +
    '<h3>Sprint+ kit</h3>' +
    '<p class="demo-pricing-copy">Layered explorations, research synthesis and polish across 2 sprints.</p>' +
    '<ul>' +
    '<li>Strategy workshop</li>' +
    '<li>Design ops checklist</li>' +
    '<li>Motion briefs & specs</li>' +
    '</ul>' +
    '<button class="demo-button demo-button-ghost">Plan review</button>' +
    '</article>' +
    '</section>' +
    '<section class="demo-contact">' +
    '<div class="demo-contact-copy">' +
    '<p class="demo-contact-kicker">Next steps</p>' +
    '<h3>Ship the look you previewed</h3>' +
    '<p>Send a short note about your team, the deadline and any tech constraints. I will reply with a tailored kit.</p>' +
    '</div>' +
    '<form class="demo-contact-form">' +
    '<label>' +
    '<span>Project name</span>' +
    '<input type="text" placeholder="New brand film microsite" required />' +
    '</label>' +
    '<label>' +
    '<span>Timeline</span>' +
    '<input type="text" placeholder="Week of 24 June" required />' +
    '</label>' +
    '<label>' +
    '<span>Context</span>' +
    '<textarea rows="3" placeholder="Launch assets, hero animations, copy refresh" required></textarea>' +
    '</label>' +
    '<button class="demo-button demo-button-primary" type="submit">Send briefing</button>' +
    '</form>' +
    '</section>' +
    '<section class="demo-testimonial">' +
    '<p>' +
    '“These explorations save our team hours each week. Stakeholders instantly understand how the same' +
    'narrative feels in different art directions.”' +
    '</p>' +
    '<strong>Ina Varga — Creative Lead, Northwind Labs</strong>' +
    '</section>' +
    '<section class="demo-footer">' +
    '<h3>Need this direction?</h3>' +
    '<p>Drop the design kit into your next sprint. I will adapt the palette, components and motion cues.</p>' +
    '</section>' +
    '</div>';

  function hydrateDemo(stage, cssPath) {
    if (!stage || !cssPath) {
      return;
    }

    var lang = document.documentElement && document.documentElement.lang ? document.documentElement.lang : 'en';
    var markup =
      '<!DOCTYPE html><html lang="' +
      lang +
      '"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />' +
      '<link rel="stylesheet" href="' +
      cssPath +
      '" /></head><body>' +
      DEMO_TEMPLATE +
      '</body></html>';
    stage.setAttribute('srcdoc', markup);
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

    window.addEventListener('site-language-change', render);

    render();
  }

  document.addEventListener('DOMContentLoaded', initDemoLab);
})();
