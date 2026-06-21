(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scrollContainer = document.querySelector('.scroll-container');
  const progressFill = document.getElementById('progressFill');
  const callouts = Array.from(document.querySelectorAll('.callout')).map((el) => ({
    el,
    range: el.dataset.range.split(',').map(Number),
  }));

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

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let sx, sy, sw, sh;
    if (imgRatio > canvasRatio) {
      sh = img.naturalHeight;
      sw = sh * canvasRatio;
      sx = (img.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = img.naturalWidth;
      sh = sw / canvasRatio;
      sx = 0;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
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
