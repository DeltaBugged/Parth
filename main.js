(function () {
  if (!window.matchMedia('(pointer:fine)').matches) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function lerp() {
    rx += (mx - rx) * .15;
    ry += (my - ry) * .15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(lerp);
  })();

  document.querySelectorAll('a, button, .skill-tag, .service-item, .contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = '14px';
      dot.style.height = '14px';
      ring.style.width = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'rgba(0,229,255,.8)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width = '8px';
      dot.style.height = '8px';
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(0,229,255,.6)';
    });
  });
})();


(function () {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const mouse = { x: -9999, y: -9999 };
  const isMobile = window.innerWidth < 600;
  const NUM = isMobile ? 60 : 120;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  }, { passive: true });

  class Particle {
    constructor() { this.reset(true); }

    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - .5) * .3;
      this.vy = -(Math.random() * .4 + .1);
      this.size = Math.random() * 1.8 + .4;
      this.alpha = Math.random() * .5 + .1;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    }

    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const f = .015 * (1 - dist / 120);
        this.vx += dx * f;
        this.vy += dy * f;
      }
      this.vx *= .99;
      this.vy *= .99;
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > W + 10) {
        this.reset(false);
      }
    }

    draw() {
      const progress = this.life / this.maxLife;
      const a = progress < .1 ? progress / .1 : progress > .9 ? (1 - progress) / .1 : 1;
      ctx.globalAlpha = this.alpha * a;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < NUM; i++) particles.push(new Particle());

  function drawConnections() {
    ctx.globalAlpha = 1;
    const connDist = isMobile ? 70 : 90;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < connDist) {
          ctx.globalAlpha = (1 - d / connDist) * .12;
          ctx.strokeStyle = '#00E5FF';
          ctx.lineWidth = .6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      const dx = particles[i].x - mouse.x;
      const dy = particles[i].y - mouse.y;
      const dm = Math.sqrt(dx * dx + dy * dy);
      if (dm < 150) {
        ctx.globalAlpha = (1 - dm / 150) * .25;
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }

  function drawFloatingShapes() {
    const t = Date.now() * .0005;
    const hexagons = [
      { x: W * .15, y: H * .3, r: 80, rot: t * .7 },
      { x: W * .82, y: H * .6, r: 50, rot: -t * .5 },
      { x: W * .5, y: H * .15, r: 35, rot: t },
      { x: W * .7, y: H * .2, r: 60, rot: -t * .3 },
      { x: W * .25, y: H * .75, r: 45, rot: t * .6 },
    ];

    hexagons.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = .03;
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        const b = (i + 1) / 6 * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * s.r, Math.sin(a) * s.r);
        ctx.lineTo(Math.cos(b) * s.r, Math.sin(b) * s.r);
      }
      ctx.stroke();
      ctx.restore();
    });

    const t2 = Date.now() * .0003;
    const rings = [
      { cx: W * .1, cy: H * .5, r: 120 },
      { cx: W * .9, cy: H * .4, r: 90 },
      { cx: W * .5, cy: H * .9, r: 100 },
    ];

    rings.forEach((c, i) => {
      const pulse = Math.sin(t2 + i * 2) * 20;
      ctx.globalAlpha = .02;
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, c.r + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = .01;
      ctx.beginPath();
      ctx.arc(c.cx, c.cy, (c.r + pulse) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawFloatingShapes();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  loop();
})();


(function () {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
})();


(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .1 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();


(function () {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const close = document.getElementById('menuClose');

  hamburger.addEventListener('click', () => menu.classList.add('open'));
  close.addEventListener('click', () => menu.classList.remove('open'));
  menu.querySelectorAll('.menu-link').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
})();


(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
