(function () {
  const DEFAULT_LANGUAGE = 'de';
  const SUPPORTED_LANGUAGES = ['de', 'en'];
  const LANGUAGE_STORAGE_KEY = 'preferredLanguage';
  const languageCache = {};
  const languagePromises = {};
  const languageChangeHandlers = [];
  let currentLanguage = DEFAULT_LANGUAGE;
  let translations = {};

  function isSupportedLanguage(lang) {
    return SUPPORTED_LANGUAGES.indexOf(lang) !== -1;
  }

  function getStoredLanguage() {
    try {
      return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveLanguage(lang) {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      // Ignored: storage may be unavailable.
    }
  }

  function loadLanguageData(lang) {
    if (languageCache[lang]) {
      return Promise.resolve(languageCache[lang]);
    }

    if (!languagePromises[lang]) {
      languagePromises[lang] = fetch('assets/lang/' + lang + '.json')
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Failed to load translations for ' + lang + ' (' + response.status + ')');
          }
          return response.json();
        })
        .then(function (data) {
          languageCache[lang] = data;
          delete languagePromises[lang];
          return data;
        })
        .catch(function (error) {
          delete languagePromises[lang];
          throw error;
        });
    }

    return languagePromises[lang];
  }

  function t(key, fallback) {
    if (!key) {
      return typeof fallback === 'string' ? fallback : '';
    }

    const segments = key.split('.');
    let value = translations;

    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
        value = value[segment];
      } else {
        return typeof fallback === 'undefined' ? key : fallback;
      }
    }

    if (typeof value === 'string') {
      return value;
    }

    return typeof fallback === 'undefined' ? key : fallback;
  }

  function applyTranslationToElement(element) {
    if (element.hasAttribute('data-i18n')) {
      const key = element.getAttribute('data-i18n');
      const fallback = element.textContent;
      const translated = t(key, fallback);
      if (typeof translated === 'string') {
        element.textContent = translated;
      }
    }

    if (element.hasAttribute('data-i18n-attr')) {
      const mappings = element.getAttribute('data-i18n-attr').split(';');
      for (let i = 0; i < mappings.length; i += 1) {
        const pair = mappings[i].trim();
        if (!pair) {
          continue;
        }

        const parts = pair.split(':');
        if (parts.length !== 2) {
          continue;
        }

        const attr = parts[0].trim();
        const attrKey = parts[1].trim();
        if (!attr || !attrKey) {
          continue;
        }

        const fallbackAttr = element.getAttribute(attr) || '';
        const translatedAttr = t(attrKey, fallbackAttr);
        if (typeof translatedAttr === 'string') {
          element.setAttribute(attr, translatedAttr);
        }
      }
    }
  }

  function applyTranslations(root) {
    const scope = root || document;
    const elements = scope.querySelectorAll('[data-i18n], [data-i18n-attr]');
    elements.forEach(applyTranslationToElement);
  }

  function updateLanguageToggleValue(lang) {
    const toggles = document.querySelectorAll('[data-language-toggle]');
    toggles.forEach(function (toggle) {
      if (toggle.value !== lang) {
        toggle.value = lang;
      }
    });
  }

  function notifyLanguageChange(lang) {
    languageChangeHandlers.forEach(function (handler) {
      handler(lang);
    });
  }

  function setLanguage(lang) {
    if (!isSupportedLanguage(lang)) {
      return Promise.reject(new Error('Unsupported language: ' + lang));
    }

    if (lang === currentLanguage && Object.keys(translations).length) {
      updateLanguageToggleValue(lang);
      return Promise.resolve(translations);
    }

    return loadLanguageData(lang).then(function (messages) {
      translations = messages || {};
      currentLanguage = lang;
      document.documentElement.lang = lang;
      applyTranslations(document);
      updateLanguageToggleValue(lang);
      saveLanguage(lang);
      notifyLanguageChange(lang);
      return messages;
    });
  }

  function initLocalization() {
    const stored = getStoredLanguage();
    const initial = isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
    updateLanguageToggleValue(initial);
    return setLanguage(initial).catch(function (error) {
      if (initial !== DEFAULT_LANGUAGE) {
        console.error('Falling back to default language after error:', error);
        return setLanguage(DEFAULT_LANGUAGE);
      }
      throw error;
    });
  }

  function onLanguageChange(handler) {
    if (typeof handler === 'function') {
      languageChangeHandlers.push(handler);
    }
  }

  function initLanguageToggle() {
    const toggles = document.querySelectorAll('[data-language-toggle]');
    if (!toggles.length) {
      return;
    }

    toggles.forEach(function (toggle) {
      toggle.addEventListener('change', function (event) {
        const selected = event.target.value;
        if (!isSupportedLanguage(selected) || selected === currentLanguage) {
          event.target.value = currentLanguage;
          return;
        }

        setLanguage(selected).catch(function () {
          event.target.value = currentLanguage;
        });
      });
    });

    updateLanguageToggleValue(currentLanguage);
  }

  function initNavigation() {
    const body = document.body;
    const activePage = body.dataset.page;
    if (!activePage) {
      return;
    }

    const links = document.querySelectorAll('[data-nav-link]');
    links.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const isHome =
        activePage === 'home' && (href === 'index.html' || href === './' || href === '/');
      const isProjects = activePage === 'projects' && href.indexOf('projects') !== -1;
      if (isHome || isProjects) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });
  }

  function parseProjects(markdown) {
    const projects = [];
    const lines = markdown.split(/\r?\n/);
    let current = null;
    let collectingMedia = '';

    lines.forEach(function (line) {
      if (line.startsWith('## ')) {
        if (current) {
          current.description = current.description.trim();
          projects.push(current);
        }
        current = {
          title: line.replace(/^##\s*/, '').trim(),
          description: '',
          link: '',
          images: [],
          videos: []
        };
        collectingMedia = '';
        return;
      }

      if (!current) {
        return;
      }

      const trimmed = line.trim();

      if (trimmed.length === 0) {
        collectingMedia = '';
        return;
      }

      if (trimmed.toLowerCase().startsWith('description:')) {
        current.description = trimmed.slice('description:'.length).trim();
        collectingMedia = '';
        return;
      }

      if (trimmed.toLowerCase().startsWith('link:')) {
        current.link = trimmed.slice('link:'.length).trim();
        collectingMedia = '';
        return;
      }

      if (trimmed.toLowerCase().startsWith('images:')) {
        collectingMedia = 'images';
        return;
      }

      if (trimmed.toLowerCase().startsWith('videos:')) {
        collectingMedia = 'videos';
        return;
      }

      if (collectingMedia) {
        if (trimmed.startsWith('- ')) {
          const path = trimmed.slice(2).trim();
          if (path) {
            if (collectingMedia === 'images') {
              current.images.push(path);
            }
            if (collectingMedia === 'videos') {
              current.videos.push(path);
            }
          }
        }
        return;
      }

      current.description = current.description ? current.description + ' ' + trimmed : trimmed;
    });

    if (current) {
      current.description = current.description.trim();
      projects.push(current);
    }

    return projects.filter(function (project) {
      return project.title;
    });
  }

  function isVideoSource(src) {
    return typeof src === 'string' && /\.(mp4|webm|ogg)(?:$|[?#])/i.test(src);
  }

  function collectProjectMedia(project) {
    const media = [];
    if (Array.isArray(project.images)) {
      project.images.forEach(function (src) {
        if (!src) {
          return;
        }
        media.push({
          type: isVideoSource(src) ? 'video' : 'image',
          src: src
        });
      });
    }

    if (Array.isArray(project.videos)) {
      project.videos.forEach(function (src) {
        if (!src) {
          return;
        }
        media.push({
          type: 'video',
          src: src
        });
      });
    }

    return media;
  }

  function teardownProjectMasonry(container) {
    if (!container || !container.__projectMasonryCleanup) {
      return;
    }
    container.__projectMasonryCleanup();
    delete container.__projectMasonryCleanup;
  }

  function applyProjectMasonry(container) {
    if (!container) {
      return;
    }

    teardownProjectMasonry(container);

    const cards = container.querySelectorAll('.project-card');
    if (!cards.length) {
      return;
    }

    container.dataset.masonryReady = 'true';

    function parseGapValue(value) {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    let rowGap = 0;
    let rowHeight = 4;
    let spacing = 0;
    let spacingHalf = 0;

    function refreshMeasurements() {
      const styles = window.getComputedStyle(container);
      rowGap = parseGapValue(styles.getPropertyValue('row-gap'));
      rowHeight = parseFloat(styles.getPropertyValue('grid-auto-rows')) || 4;
      const columnGapValue = parseGapValue(styles.getPropertyValue('column-gap'));
      const gapValue = parseGapValue(styles.getPropertyValue('gap'));
      const fallbackRowGap = parseGapValue(styles.getPropertyValue('row-gap'));
      spacing = columnGapValue || gapValue || fallbackRowGap || 0;
      spacingHalf = spacing / 2;
    }

    function applyCardSpacing() {
      cards.forEach(function (card) {
        if (spacingHalf) {
          card.style.marginTop = spacingHalf + 'px';
          card.style.marginBottom = spacingHalf + 'px';
        } else {
          card.style.removeProperty('margin-top');
          card.style.removeProperty('margin-bottom');
        }
      });

      if (spacingHalf) {
        container.style.paddingTop = spacingHalf + 'px';
        container.style.paddingBottom = spacingHalf + 'px';
      } else {
        container.style.removeProperty('padding-top');
        container.style.removeProperty('padding-bottom');
      }
    }

    function setCardSpan(card, measuredHeight) {
      const heightValue = typeof measuredHeight === 'number' ? measuredHeight : card.offsetHeight;
      const divisor = rowHeight + rowGap;
      const span = divisor ? Math.max(1, Math.ceil((heightValue + rowGap) / divisor)) : 1;
      card.style.gridRowEnd = 'span ' + span;
    }

    function updateLayout() {
      refreshMeasurements();
      cards.forEach(function (card) {
        setCardSpan(card);
      });
      applyCardSpacing();
    }

    updateLayout();

    const resizeObserver =
      typeof window.ResizeObserver === 'function'
        ? new window.ResizeObserver(function (entries) {
            entries.forEach(function (entry) {
              setCardSpan(entry.target, entry.contentRect && entry.contentRect.height);
            });
          })
        : null;

    if (resizeObserver) {
      cards.forEach(function (card) {
        resizeObserver.observe(card);
      });
    }

    const handleResize = function () {
      updateLayout();
    };
    window.addEventListener('resize', handleResize);

    container.__projectMasonryCleanup = function () {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      cards.forEach(function (card) {
        card.style.removeProperty('grid-row-end');
        card.style.removeProperty('margin-top');
        card.style.removeProperty('margin-bottom');
      });
      container.style.removeProperty('padding-top');
      container.style.removeProperty('padding-bottom');
      delete container.dataset.masonryReady;
    };
  }

  function requestVideoFullscreen(video) {
    let request = null;
    if (video.requestFullscreen) {
      request = video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    } else if (video.webkitRequestFullscreen) {
      request = video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      request = video.msRequestFullscreen();
    }

    if (request && typeof request.catch === 'function') {
      request.catch(function (error) {
        console.warn('Unable to enter fullscreen mode:', error);
      });
    }
  }

  function createVideoFullscreenButton(video) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-video-button';
    const label = t('projects.fullscreen', 'Vollbild');
    button.setAttribute('aria-label', label);
    button.textContent = label;
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      requestVideoFullscreen(video);
    });
    return button;
  }

  function createMediaFigure(entry, projectTitle) {
    const figure = document.createElement('figure');
    figure.className = 'project-image';

    if (entry.type === 'video') {
      figure.classList.add('project-image--video');
      const video = document.createElement('video');
      video.src = entry.src;
      video.controls = true;
      video.setAttribute('controls', '');
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('aria-label', projectTitle + ' video');
      const fullscreenButton = createVideoFullscreenButton(video);
      figure.appendChild(video);
      figure.appendChild(fullscreenButton);
      return figure;
    }

    const img = document.createElement('img');
    img.src = entry.src;
    img.alt = projectTitle + ' preview';
    img.loading = 'lazy';
    figure.appendChild(img);
    return figure;
  }

  function createProjectCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card card';

    const title = document.createElement('h2');
    title.textContent = project.title;
    card.appendChild(title);

    if (project.description) {
      const description = document.createElement('p');
      description.className = 'project-description';
      description.textContent = project.description;
      card.appendChild(description);
    }

    if (project.link) {
      const actions = document.createElement('div');
      actions.className = 'project-actions';

      const viewLink = document.createElement('a');
      viewLink.className = 'button button-primary';
      viewLink.href = project.link;
      viewLink.textContent = t('projects.viewProject', 'Projekt ansehen');
      if (/^https?:/i.test(project.link)) {
        viewLink.target = '_blank';
        viewLink.rel = 'noreferrer';
      }

      actions.appendChild(viewLink);
      card.appendChild(actions);
    }

    const media = collectProjectMedia(project);
    if (media.length > 0) {
      const gallery = document.createElement('div');
      gallery.className = 'project-images';
      media.forEach(function (entry) {
        const figure = createMediaFigure(entry, project.title);
        gallery.appendChild(figure);
      });
      card.appendChild(gallery);
    }

    return card;
  }

  function renderProjects(projects, container) {
    teardownProjectMasonry(container);
    container.innerHTML = '';

    if (!projects.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = t('projects.empty', 'Projekte folgen bald.');
      container.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    projects.forEach(function (project) {
      const card = createProjectCard(project);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
    applyProjectMasonry(container);
  }

  function initProjects() {
    const container = document.querySelector('[data-project-list]');
    if (!container) {
      return;
    }

    let projectsData = null;
    let hasError = false;

    function showLoading() {
      teardownProjectMasonry(container);
      container.innerHTML = '';
      const loadingMessage = document.createElement('p');
      loadingMessage.className = 'note';
      loadingMessage.textContent = t('projects.loading', 'Projekte werden geladen…');
      container.appendChild(loadingMessage);
    }

    function showError() {
      teardownProjectMasonry(container);
      container.innerHTML = '';
      const message = document.createElement('p');
      message.className = 'empty-state';
      message.textContent = t(
        'projects.error',
        'Projekte können derzeit nicht geladen werden. Bitte versuche es später erneut.'
      );
      container.appendChild(message);
    }

    showLoading();

    onLanguageChange(function () {
      if (hasError) {
        showError();
        return;
      }
      if (!projectsData) {
        showLoading();
        return;
      }
      renderProjects(projectsData, container);
    });

    fetch('assets/projects.md')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status);
        }
        return response.text();
      })
      .then(function (text) {
        projectsData = parseProjects(text);
        hasError = false;
        renderProjects(projectsData, container);
      })
      .catch(function (error) {
        hasError = true;
        console.error('Unable to load projects:', error);
        showError();
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLanguageToggle();
    initLocalization()
      .catch(function (error) {
        console.error('Localization failed:', error);
      })
      .then(function () {
        initNavigation();
        initProjects();
      });
  });
})();
