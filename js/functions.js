/****
 * 
 *  Adds magic to functions
 * 
 ****/

// Acorn: https://cdn.jsdelivr.net/npm/acorn@8.15.0/dist/acorn.min.js

async function loadScript(url) { // async just to indicate it is returning a Promise
  const newScript = document.createElement('script');
  newScript.setAttribute('src', url);
  newScript.setAttribute('type', 'text/javascript');
  newScript.setAttribute('async', 'true');

  const result = new Promise((resolve, reject) => {
    newScript.onload = resolve;
    newScript.onerror = reject;
  });
  
  document.head.appendChild(newScript);
  return result;
}

async function init() {
  await loadScript('https://cdn.jsdelivr.net/npm/acorn@8.15.0/dist/acorn.min.js');
  // We also need hashes3.js, using a relative path here, of course
  await loadScript('./hashes3.js');
}

init();
