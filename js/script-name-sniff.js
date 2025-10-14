/** 
 * Just some cobbled code to sniff file names of current script.
 * For diffferent envs it'll be differentm surely.
 * - Browser
 * - Web Worker
 * - Node.js
 * - Deno
 * - Bun
 * - Other JS runtimes?
 */
function browserCurScript() {
  // In browsers, document.currentScript gives the currently executing script, sometimes
  const name = document.currentScript?.src;
  if (name) return name;

  // If that fails, we can try to get the last script in the document
  var scripts = document.getElementsByTagName('script');
  var lastScript = scripts[scripts.length - 1];
  var scriptName = lastScript.src;
  if (scriptName) return scriptName;

  // If that fails, we can try to get the error stack trace
  try {
    throw new Error();
  } catch (e) {
    if (e.stack) {
      var stackLines = e.stack.split('\n');
      for (var i = 0; i < stackLines.length; i++) {
        var match = stackLines[i].match(/(https?:\/\/[^\s]+\.js)/);
        if (match) {
          return match[1];
        }
      }
    }
  }

  // Or not
  return null;
}

function workerCurScript() {
  // In Web Workers, we can use self.location
  return self.location?.href || null;
}

function nodeCurScript() {
  // In Node.js, we can use __filename
  return typeof __filename !== 'undefined' ? __filename : null;
}

function denoCurScript() {
  // In Deno, we can use import.meta.url
  // First get the "import" variable in a way that doesn't break in other envs
  const importVar = eval('typeof import !== "undefined" ? import : undefined');
  return importVar && importVar.meta && importVar.meta.url ? importVar.meta.url : null;
}

function bunCurScript() {
  // In Bun, we can use import.meta.url as well
  const importVar = eval('typeof import !== "undefined" ? import : undefined');
  return importVar && importVar.meta && importVar.meta.url ? importVar.meta.url : null;
}

function getCurrentScript() {
  // Try each method in turn, returning the first non-null result
  return browserCurScript() || workerCurScript() || nodeCurScript() || denoCurScript() || bunCurScript() || null;
}
