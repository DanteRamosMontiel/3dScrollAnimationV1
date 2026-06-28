(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scrollContainer = document.querySelector('.scroll-container');
  const progressFill = document.getElementById('progressFill');
  const overlay = document.querySelector(".overlay");
  const body = document.querySelector(".body");
  const callouts = Array.from(document.querySelectorAll('.callout')).map((el) => ({
    el,
    range: el.dataset.range.split(',').map(Number),
  }));

  window.addEventListener("load", () => {
    overlay.style.display = "none";
    body.style.overflow = "auto";
  });

  const FRAME_COUNT = 121;
  const FRAME_PATH = (i) => `media/frames/frame_${String(i).padStart(4, '0')}.jpg`;

  const images = new Array(FRAME_COUNT);
  let currentFrame = -1;
  let firstImageReady = false;

  function resizeCanvas() {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    if (firstImageReady) drawFrame(currentFrame === -1 ? 0 : currentFrame);
  }
  window.addEventListener('resize', resizeCanvas);

  function preloadImages() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i + 1);
      if (i === 0) {
        img.onload = () => {
          firstImageReady = true;
          resizeCanvas();
          drawFrame(0);
        };
      }
      images[i] = img;
    }
  }

  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // contain: escala la imagen para que entre completa, centrada
    const scale = Math.min(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
  }

  function getProgress() {
    const rect = scrollContainer.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    const scrolled = -rect.top;
    return Math.min(Math.max(scrolled / total, 0), 1);
  }

  function updateCallouts(progress) {
    callouts.forEach(({ el, range }) => {
      const active = progress >= range[0] && progress <= range[1];
      el.classList.toggle('is-active', active);
    });
  }

  function loop() {
    const progress = getProgress();

    if (firstImageReady) {
      const targetFrame = Math.round(progress * (FRAME_COUNT - 1));
      if (targetFrame !== currentFrame) {
        currentFrame = targetFrame;
        drawFrame(currentFrame);
      }
    }

    updateCallouts(progress);
    progressFill.style.width = `${progress * 100}%`;

    requestAnimationFrame(loop);
  }

  resizeCanvas();
  preloadImages();
  loop();
})();
