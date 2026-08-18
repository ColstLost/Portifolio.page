/* ==========================================================================
   PORTFÓLIO PROFISSIONAL — SCRIPT PRINCIPAL
   Sumário:
   1. Cabeçalho com fundo ao rolar a página
   2. Menu mobile (hambúrguer)
   3. Destaque do link de navegação ativo conforme a seção visível
   4. Animações de entrada (reveal) ao rolar a página
   5. Barras de habilidades animadas
   6. Efeito de digitação na janela de código do Hero
   7. Botão "voltar ao topo"
   8. Formulário de contato (integração com o backend Python/Flask)
   9. Ano atual no rodapé
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initActiveNavOnScroll();
  initRevealAnimations();
  initSkillBars();
  initTypingEffect();
  initBackToTop();
  initContactForm();
  initFooterYear();
  initSmoothScroll();
});

/* Detecta se o usuário prefere movimento reduzido (acessibilidade) */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   0. ROLAGEM SUAVE PERSONALIZADA (ao clicar em qualquer link com "#")
   Substitui o clique padrão do navegador (que pula direto) por uma
   animação própria com easing, garantindo o efeito suave em qualquer
   navegador e permitindo compensar a altura do cabeçalho fixo.
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const header = document.getElementById('header');
  const links = document.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const scrollToTarget = (target) => {
    const headerHeight = header ? header.offsetHeight : 0;
    const startY = window.pageYOffset;
    const targetY = target.getBoundingClientRect().top + startY - headerHeight + 1;
    const distance = targetY - startY;
    const duration = prefersReducedMotion ? 0 : Math.min(900, Math.max(400, Math.abs(distance) * 0.6));

    if (duration === 0) {
      window.scrollTo(0, targetY);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      return;
    }

    let startTime = null;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Move o foco para o destino ao final, mantendo a página acessível
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    };

    window.requestAnimationFrame(step);
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target);

      // Atualiza a URL sem forçar um novo salto do navegador
      history.pushState(null, '', href);
    });
  });
}

/* --------------------------------------------------------------------------
   1. CABEÇALHO COM FUNDO AO ROLAR A PÁGINA
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const toggle = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* --------------------------------------------------------------------------
   2. MENU MOBILE (HAMBÚRGUER)
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (!navToggle || !navMenu) return;

  // Centraliza o travamento/liberação do scroll do body em uma única função,
  // usada tanto ao abrir/fechar pelo hambúrguer quanto ao fechar por um link.
  const setBodyScrollLock = (locked) => {
    document.body.style.overflow = locked ? 'hidden' : '';
  };

  const closeMenu = () => {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    setBodyScrollLock(false); // <- BUGFIX: antes o scroll ficava travado ao fechar por um link
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');

    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));

    setBodyScrollLock(isOpen);
  });

  // Fecha o menu automaticamente ao clicar em um link (experiência mobile melhor)
  navMenu.querySelectorAll('.nav-link, .nav-menu-cta a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

/* --------------------------------------------------------------------------
   3. LINK DE NAVEGAÇÃO ATIVO CONFORME A SEÇÃO VISÍVEL
   -------------------------------------------------------------------------- */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------------------
   4. ANIMAÇÕES DE ENTRADA (REVEAL) AO ROLAR A PÁGINA
   -------------------------------------------------------------------------- */
function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal, .project-card, .skills-group, .timeline-item');
  if (!elements.length) return;

  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Pequeno atraso escalonado para dar sensação de sequência natural
          setTimeout(() => entry.target.classList.add('in-view'), index * 40);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. BARRAS DE HABILIDADES ANIMADAS
   -------------------------------------------------------------------------- */
function initSkillBars() {
  const skills = document.querySelectorAll('.skill');
  if (!skills.length) return;

  const animate = (skillEl) => {
    const level = skillEl.dataset.level || 0;
    const fill = skillEl.querySelector('.skill-fill');
    if (fill) fill.style.width = `${level}%`;
  };

  if (prefersReducedMotion) {
    skills.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  skills.forEach((skill) => observer.observe(skill));
}

/* --------------------------------------------------------------------------
   6. EFEITO DE DIGITAÇÃO NA JANELA DE CÓDIGO DO HERO
   -------------------------------------------------------------------------- */
function initTypingEffect() {
  const target = document.getElementById('typedCode');
  if (!target) return;

  // Cada linha é uma lista de "pedaços" de texto com sua classe de destaque de sintaxe
  const lines = [
    [{ t: 'const ', c: 'kw' }, { t: 'perfil', c: 'prop' }, { t: ' = {', c: 'punc' }],
    [{ t: '  nome: ', c: 'punc' }, { t: '"Lucas Limoli"', c: 'str' }, { t: ',', c: 'punc' }],
    [{ t: '  cargo: ', c: 'punc' }, { t: '"Full Stack Developer"', c: 'str' }, { t: ',', c: 'punc' }],
    [
      { t: '  stack: [', c: 'punc' },
      { t: '"HTML"', c: 'str' }, { t: ', ', c: 'punc' },
      { t: '"CSS"', c: 'str' }, { t: ', ', c: 'punc' },
      { t: '"JavaScript"', c: 'str' }, { t: ', ', c: 'punc' },
      { t: '"Python"', c: 'str' }, { t: ', ', c: 'punc' },
      { t: '"Java"', c: 'str' }, { t: ', ', c: 'punc' },
      { t: '"MySQL"', c: 'str' }, { t: '],', c: 'punc' },
    ],
    [{ t: '  status: ', c: 'punc' }, { t: '"Disponível para estágio"', c: 'str' }],
    [{ t: '};', c: 'punc' }],
    [],
    [{ t: 'perfil', c: 'prop' }, { t: '.', c: 'punc' }, { t: 'conectar', c: 'kw' }, { t: '();', c: 'punc' }],
    [{ t: '// Obrigado por visitar o meu portfólio 🚀', c: 'punc' }],
  ];

  // Se o usuário preferir menos animação, exibe o código já pronto
  if (prefersReducedMotion) {
    target.innerHTML = lines
      .map((line) => line.map((chunk) => `<span class="${chunk.c}">${chunk.t}</span>`).join(''))
      .join('\n');
    return;
  }

  // Achata as linhas em uma fila de caracteres, marcando quebras de linha
  const queue = [];
  lines.forEach((line, lineIndex) => {
    line.forEach((chunk) => {
      chunk.t.split('').forEach((char) => queue.push({ char, cls: chunk.c }));
    });
    if (lineIndex < lines.length - 1) queue.push({ char: '\n', cls: null });
  });

  let currentSpan = null;
  let currentClass = null;
  let i = 0;

  const typeNext = () => {
    if (i >= queue.length) return; // digitação concluída

    const { char, cls } = queue[i];

    if (char === '\n') {
      target.appendChild(document.createElement('br'));
      currentSpan = null;
      currentClass = null;
    } else {
      if (cls !== currentClass || !currentSpan) {
        currentSpan = document.createElement('span');
        currentSpan.className = cls || '';
        target.appendChild(currentSpan);
        currentClass = cls;
      }
      currentSpan.textContent += char;
    }

    i += 1;
    // Velocidade levemente variável para simular digitação humana
    const delay = char === '\n' ? 120 : 16 + Math.random() * 28;
    setTimeout(typeNext, delay);
  };

  // Pequeno atraso inicial antes de começar a digitar
  setTimeout(typeNext, 500);
}

/* --------------------------------------------------------------------------
   7. BOTÃO "VOLTAR AO TOPO"
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  };

  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   8. FORMULÁRIO DE CONTATO
   Envia os dados para o backend Python (Flask), que grava a mensagem no MySQL.
   Endpoint esperado: POST /api/contato  (ver app.py)
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmitBtn');
  if (!form || !statusEl || !submitBtn) return;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setStatus = (message, type) => {
    statusEl.textContent = message;
    statusEl.className = `form-status ${type || ''}`.trim();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const assunto = form.assunto.value.trim();
    const mensagem = form.mensagem.value.trim();

    // Validação simples no lado do cliente
    if (!nome || !email || !assunto || !mensagem) {
      setStatus('Por favor, preencha todos os campos antes de enviar.', 'error');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setStatus('Informe um e-mail válido.', 'error');
      return;
    }

    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    setStatus('', '');

    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, assunto, mensagem }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus(data.mensagem || 'Mensagem enviada com sucesso! Em breve entrarei em contato.', 'success');
        form.reset();
      } else {
        setStatus(data.mensagem || 'Não foi possível enviar sua mensagem. Tente novamente.', 'error');
      }
    } catch (error) {
      // Ocorre, por exemplo, quando o backend Flask (app.py) não está em execução
      setStatus(
        'Não foi possível conectar ao servidor. Verifique se o backend está em execução ou me envie um e-mail diretamente.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
    }
  });
}

/* --------------------------------------------------------------------------
   9. ANO ATUAL NO RODAPÉ
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
