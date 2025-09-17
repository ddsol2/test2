const radix = 10;
const maxLen = 4;

// Runonce, don't pollute
const { isHash, isTwoHashes } = (() => { // This ought to be just { ... }, not (() => { ... })()
    const digits = '0-' + Math.min(9, radix - 1);
    const letters = radix > 10 ? 'a-' + String.fromCharCode(65 + 32 + radix - 10 - 1) : '';
    const makeMatcher = (len, startOnly) => {
      const m = new RegExp(`^[${digits}${letters}]{${len}}${startOnly?'':'$'}`);
      return s => m.test(s);
    };
  return {
    isHash: makeMatcher(maxLen),
    isTwoHashes: makeMatcher(maxLen * 2)
  };
})();

const hashCount = Math.pow(radix, maxLen);

function simpleIntHash(a, b) {
  return ((a << 5) - a + b) % hashCount;
}

function strify(n) {
  const r = n.toString(radix).padStart(maxLen, '0');
  return r;
}

function myHexHash(str) {
  console.log(`Asking for hash of "${str}"`);
  if (hashes[str]) return hashes[str];
  if (!str)
    return 0xafe7;
  if (isHash(str)) return parseInt(str, radix);

  const long = str.length > maxLen;

  const a = myHexHash(str.substr(0, long ? maxLen : -1));
  const b = long ? myHexHash(str.substr(maxLen)) : str.charCodeAt(str.length - 1);

  const res = mix(a, b);
  hashes[res] = str;
  hashes[str] = res;
  return res;
}

// Global proxy object (for global properties)
// That's already there... it's Object, but only for known...


// Global now

// I can add global properties to anything...
Object.prototype

window.now = function now(time) {
  const oldNow = time ?? window.now ?? null;
  return window.now = () => oldNow;
}

// Run function runs a function in the context of now, then merges that context into the previous now
function run(f) {
  const start = now();
  try {
    return f();
  } finally {
    const unappliedNow = now();
    // Collapse the old now onto the new now
    const oldKeys = Object.keys(unappliedNow);
    const newKeys = Object.keys(unappliedNow);
    
    const start2 = now(start) // Continuing from start
    
  }
}

function autoRun(f) {
  return (...a) => run(() => f(...a));
}

function hashAnything(a) {
  run(() => {
    if (typeof a === "string") {
      if (isHash(a)) return a;
      if (a.length < 16) return a;
    }
  });
}


/**************************************************

RETHINK
"HASHES"? They're OBJECTS, not hashes. Everything is an OBJECT. A string, OBJECT.
When we say "Object", we always mean somthing else but different, namely prototype + other stuff.
A string is an Object.

**************************************************/

// String gedoe for obj.__proto__ =new String('iets')
function bindThisOld(proto, recurse = true, target = null) {
  // The idea is to hoist all methods to a new proto that finds this obj proto
  if (!target) target = proto;
  let newProto = Object.create(proto);
  if (recurse && proto.__proto__) bindThis(proto.__proto__, true, newProto);
  const protoFunc = o => o && (o.__proto__ === target ? o : protoFunc(o.__proto__) ?? o);
  let applied = false;

  for (const key of Object.keys(this)) {
    const prop = this[key];
    if (typeof prop === 'function') {
      newProto[key] = (...a) => prop.apply(target, ...a);
      applied = true;
    }
  }
  return applied ? newProto : proto;
}

function makeAutoBindProto(orig, recurse, targetProto, bound) {
  // The idea is to hoist all methods to a new proto that finds this obj proto
  // s='string';bs=new String(s);bss=Object.create(makeAutoBindProto(bs.__proto__, false, null, bs));
  
  bound = bound ?? orig;
  targetProto = targetProto ?? Object.create(orig);
  const origTarget = targetProto;
  if (recurse && orig.__proto__) targetProto = makeAutoBindProto(orig.__proto__, true, targetProto, bound);
  
  // const protoFunc = o => o && (o.__proto__ === target ? o : protoFunc(o.__proto__) ?? o);
  
  let applied = origTarget !== targetProto;

  for (const key of Object.getOwnPropertyNames(orig)) {
    const prop = orig[key];
    if (typeof prop === 'function') {
      targetProto[key] = (...a) => prop.apply(bound, ...a);
      applied = true;
    }
  }
  if (!applied) {
    console.log('Not applied');
  } else {
    console.log('Applied');
  };
  return applied ? targetProto : orig;
}

// np=Object.prototype=Object.create(Object.prototype)

function insertProto(target) { // DOES NOT WORK ON Object.prototype
  // Inserts a proto between target and its proto, effectively making all
  // properties on this object available as "super" properties on all objects
  // descended from target. __proto__ can't be changed on the returned object
  // without breaking the chain.

  const newProto = Object.create(null);
  newProto.__proto__ = target.__proto__;
  target.__proto__ = newProto;
  return newProto;
}

/* JUNK?
  if (this === Object.prototype) {
    console.warn("Can't add proto to Object.prototype");
    return this;
  }
  if (this.__proto__ === proto) return this; // Already there
  if (!this.__proto__) {
    this.__proto__ = proto;
    return this;
  }
  const newProto = Object.create(proto);
  newProto.__proto__ = this.__proto__;
  this.__proto__ = newProto;
  return this;
*/