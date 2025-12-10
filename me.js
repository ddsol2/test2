///`My javascript file`
run();

async function run() {
  // See where we are:
  if (!(await looksLikeARealBrowser())) return;

  // Make sure we are not loading.
  while (isPrimordial) {
    await delay(10); //Go fast
  }
  
  // See if the page is empty
  if (pageIsCurrentlyEmpty()) {
    // My div here:
  } else {
    // Make a div
    overlayUISetup();
  }
}

function error(msg) {
  // Stupid, right? Lol. It's a shim.
  console.log(new Error(msg));
}

function isPrimordial() {
  document.readyState === 'loading';
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms);
}

function pageIsCurrentlyEmpty() {
  // ignore script/style/meta/link/title — the automatic framework bits
  for (const el of document.body.children) {
    if (!['SCRIPT','STYLE','META','LINK'].includes(el.tagName)) {
      return false;
    }
  }
  return true;
}

function looksLikeARealBrowser() {
  try {
    // must have a living document
    if (typeof document !== 'object' || !document.createElement) return false;

    // must be able to breathe an element into existence
    const el = document.createElement('div');
    if (!el || !el.style) return false;

    // must allow insertion into DOM
    document.body.appendChild(el);

    // must support layout engine
    el.style.position = 'absolute';
    el.style.top = '1234px';
    const measured = el.getBoundingClientRect().top;

    // must produce a number that isn't a canned fake
    if (typeof measured !== 'number' || measured === 0) return false;

    // remove our breadcrumb
    el.remove();

    // must have a real window event loop
    if (typeof window.requestAnimationFrame !== 'function') return false;

    // the lockpick: a micro-tick should advance measurable time
    return new Promise((resolve) => {
      const t0 = performance.now();
      requestAnimationFrame(() => {
        const dt = performance.now() - t0;
        resolve(dt > 0.2); // absurdly cheap “is the world moving?”
      });
    });
  } catch {
    return false;
  }
}

function overlayUISetup() {
  const root = document.createElement('div');
  root.id = 'my_skybox_root';
  document.documentElement.appendChild(root);
  const t = n => `<${n}>`;
  const c = n => c('/' + n);
  root.innerHTML = `${t('style')}
      #my_skybox_root {
        all: initial;
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483647;
        font-family: sans-serif;
        transform: none !important;
      }
      #my_skybox_root > .ui {
        all: unset;
        pointer-events: auto;
        position: absolute;
        bottom: 12px;
        left: 12px;
        padding: 8px 14px;
        background: rgba(20,20,20,0.85);
        color: white;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }
      #my_skybox_panel {
        all: unset;
        position: fixed;
        bottom: 50px;
        left: 12px;
        width: 300px;
        padding: 10px;
        background: rgba(20,20,20,0.92);
        color: white;
        border-radius: 6px;
        display: none;
        pointer-events: auto;
        font-size: 14px;
      }
      #my_skybox_panel.open { display: block; }
    ${c('style')}
    ${t('div class="ui" id="sky_button"')}Open${c('div')}
    ${t('div id="my_skybox_panel"')}Hello from your sovereign bubble.${c('div')}
  `;

  document.getElementById('sky_button').onclick = () =>
    document.getElementById('my_skybox_panel').classList.toggle('open');
}