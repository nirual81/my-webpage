(function () {
  function initNavigation() {
    const body = document.body;
    const activePage = body.dataset.page;
    if (!activePage) {
      return;
    }

    const links = document.querySelectorAll('[data-nav-link]');
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isHome = activePage === 'home' && (href === 'index.html' || href === './' || href === '/');
      const isProjects = activePage === 'projects' && href.indexOf('projects') !== -1;
      if (isHome || isProjects) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function parseProjects(markdown) {
    const projects = [];
    const lines = markdown.split(/\r?\n/);
    let current = null;
    let collectingImages = false;

    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        if (current) {
          current.description = current.description.trim();
          projects.push(current);
        }
        current = {
          title: line.replace(/^##\s*/, '').trim(),
          description: '',
          link: '',
          images: []
        };
        collectingImages = false;
        return;
      }

      if (!current) {
        return;
      }

      const trimmed = line.trim();

      if (trimmed.length === 0) {
        collectingImages = false;
        return;
      }

      if (trimmed.toLowerCase().startsWith('description:')) {
        current.description = trimmed.slice('description:'.length).trim();
        collectingImages = false;
        return;
      }

      if (trimmed.toLowerCase().startsWith('link:')) {
        current.link = trimmed.slice('link:'.length).trim();
        collectingImages = false;
        return;
      }

      if (trimmed.toLowerCase().startsWith('images:')) {
        collectingImages = true;
        return;
      }

      if (collectingImages) {
        if (trimmed.startsWith('- ')) {
          const path = trimmed.slice(2).trim();
          if (path) {
            current.images.push(path);
          }
        }
        return;
      }

      current.description = current.description
        ? current.description + ' ' + trimmed
        : trimmed;
    });

    if (current) {
      current.description = current.description.trim();
      projects.push(current);
    }

    return projects.filter((project) => project.title);
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
      viewLink.textContent = 'View project';
      if (/^https?:/i.test(project.link)) {
        viewLink.target = '_blank';
        viewLink.rel = 'noreferrer';
      }

      actions.appendChild(viewLink);
      card.appendChild(actions);
    }

    if (project.images && project.images.length > 0) {
      const gallery = document.createElement('div');
      gallery.className = 'project-images';
      project.images.forEach((src) => {
        const figure = document.createElement('figure');
        figure.className = 'project-image';

        const img = document.createElement('img');
        img.src = src;
        img.alt = project.title + ' preview';
        img.loading = 'lazy';

        figure.appendChild(img);
        gallery.appendChild(figure);
      });
      card.appendChild(gallery);
    }

    return card;
  }

  function renderProjects(projects, container) {
    container.innerHTML = '';

    if (!projects.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Projects coming soon.';
      container.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    projects.forEach((project) => {
      const card = createProjectCard(project);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  function initProjects() {
    const container = document.querySelector('[data-project-list]');
    if (!container) {
      return;
    }

    container.textContent = 'Loading projects…';

    fetch('assets/projects.md')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status);
        }
        return response.text();
      })
      .then((text) => {
        const projects = parseProjects(text);
        renderProjects(projects, container);
      })
      .catch((error) => {
        console.error('Unable to load projects:', error);
        container.innerHTML = '';
        const message = document.createElement('p');
        message.className = 'empty-state';
        message.textContent = 'Unable to load projects right now. Please try again later.';
        container.appendChild(message);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initProjects();
  });
})();
