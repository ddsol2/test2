const radix = 10;
const maxLen = 4;

// Runonce, don't pollute
const { isHash, isTwoHashes } = (() => { // This ought to be just { ... }, not (() => { ... })()
  const digits = '0-' + Math.min(9, radix - 1);
  const letters = radix > 10 ? 'a-' + String.fromCharCode(65 + 32 + radix - 10 - 1) : '';
  const makeMatcher = (len, startOnly) => {
    const m = new RegExp(`^[${digits}${letters}]{${len}}${startOnly ? '' : '$'}`);
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

// add __proto2__ on all objects where possible
// It uses a proxy to intercept property lookups
// and first checks the added proto, then the original proto chain.
// It can be called multiple times to add multiple protos.
// It does not modify the original proto chain, but creates a new one.
// It does not work on Object.prototype itself.

{
  Object.defineProperty(Object.prototype, '__proto2__', {

    get() {
      if (this.hasOwnProperty('__isProxy__')) return this.__proxy__.__proto2__;
      if (this === Object.prototype) return null; // Can't proxy Object.prototype
      const originalProto = Object.getPrototypeOf(this);

      // Create a new proto object to hold the added properties
      const addedProto = Object.create({
        get __proxy__() { return proxy; },
        set __proxy__(v) { throw new Error('__isProxy__ is read-only'); },
        get __proto2__() { return addedProto; },
      });
      const proxy = new Proxy(this, {
        get(target, prop, receiver) {
          if (prop === '__isProxy__') return proxy;
          if (prop in addedProto) {
            return addedProto[prop];
          }
          return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
          if (prop in addedProto || !(prop in target)) {
            addedProto[prop] = value;
            return true;
          }
          return Reflect.set(target, prop, value, receiver);
        },
        has(target, prop) {
          return prop in addedProto || Reflect.has(target, prop);
        },
        ownKeys(target) {
          return Array.from(new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(addedProto)]));
        },
        getOwnPropertyDescriptor(target, prop) {
          if (prop in addedProto) {
            return Object.getOwnPropertyDescriptor(addedProto, prop);
          }
          return Object.getOwnPropertyDescriptor(target, prop);
        }
      });
      Object.setPrototypeOf(proxy, originalProto);
      return proxy;
    },
    set(value) {
      // This needs to be fixed to allow setting the __proto2__ object for any object except Object.prototype
      // This includes the proxy itself for fun effects!

      // Was: throw new Error('__proto2__ is read-only');

      // A fix would look like:
      if (this === Object.prototype) return; // Can't set on Object.prototype
      if (this.hasOwnProperty('__isProxy__')) {
        const proxy = this.__isProxy__;
        if (typeof value === 'object' && value !== null) {
          for (const key of Object.keys(value)) {
            proxy[key] = value[key];
          }
        } else {
          throw new Error('__proto2__ can only be set to a descendant of object');
        }
        return;
      }
      if (this === Object.prototype) {
        throw new Error('__proto2__ cannot be set on Object.prototype');
      }
      throw new Error('__proto2__ can only be set on proxied objects');
    },
    configurable: true,
    enumerable: false
  });
}
// Example usage:
// const obj = { a: 1 };
// obj.__proto2__.b = 2;
// console.log(obj.b); // 2
// console.log(obj.a); // 1
// const obj2 = Object.create(obj);
// console.log(obj2.b); // 2
// obj2.__proto2__.c = 3;
// console.log(obj2.c); // 3
// console.log(obj.c); // undefined


// Starting over because this is so broken
// I want __proto2__ to modify __proto__ if needed
// So I have o = Object.create(null);
// 
// Then I want to do o.__proto2__ = { a: 1 }; but this o doesn't support __proto2__
// because it doesn't inherit from Object.prototype
// So I need to add __proto2__ to Object.prototype says the AI, but the AI is stupid
// So I don't add __proto2__ to Object.prototype because I'm not stupid like the AI
// I add __proto2__ to all objects that don't have it, except Object.prototype
// I do this by magically overriding Object.create. The AI didn't see that coming. lol.
// Let's see what it says now:
// "So I do Object.create = (proto) => { const o = oldCreate(proto); if (!o.hasOwnProperty('__proto2__')) { addProto2(o); } return o; }"
// Seriously? That's what you got?
// LOL the AI is still stupid
// No, proto2 is only enabled on objects that have my special proxy somewhere in their proto chain
// What it does, is it intercepts everything meant for __proto__ but splits it over the target's __proto__ and the added __proto2__
//
// Now, let's get this jumble of thoughts into something we can understand in English:
//
// I want to be able to add a second prototype chain to any object, without modifying the original prototype chain.
// This second prototype chain should be accessible via __proto2__
// I want to be able to set properties on __proto2__ and have them be accessible on the object and its descendants
// I want to be able to get properties from its original prototype chain if they are not found on the object or __proto2__ (precedence
// goes to the object, then __proto2__, then original prototype chain)

// We define Object.prototype.__proto2__, which will modify the prototype chain of the object it's called on
// if needed, by creating a proxy that intercepts property lookups

Object.defineProperty(Object.prototype, '__proto2__', {
  // We do not want a getter that creates a proxy, because that would create a new proxy every time we access __proto2__
  // We only support the setter at the level of Object.prototype. When we set __proto2__, we create a proxy that intercepts
  // property lookups and first checks the added proto, then the original proto chain.
  // It can be called multiple times to add multiple protos.
  // It does not modify the original proto chain, but creates a new one.
  // It does not work on Object.prototype itself.
  set(value) {
    let currentProto2 = null;
    if (this === Object.prototype) {
      throw new Error('__proto2__ cannot be set on Object.prototype');
    }
    if ('__proto2__' in this) {
      // Already proxied, just add to the existing __proto2__
      currentProto2 = value;
    } else {
      // Not proxied yet, create a new proxy
      const originalProto = Object.getPrototypeOf(this);
      currentProto2 = value;
      const proxy = new Proxy(this, {
        get(target, prop, receiver) {
          if (prop in currentProto2) {
            return currentProto2[prop];
          }
          return Reflect.get(target, prop, receiver);
        },
        set(target, prop, value, receiver) {
          if (prop in currentProto2 || !(prop in target)) {
            currentProto2[prop] = value;
            return true;
          }
          return Reflect.set(target, prop, value, receiver);
        },
        has(target, prop) {
          return prop in currentProto2 || Reflect.has(target, prop);
        },
        ownKeys(target) {
          return Array.from(new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(currentProto2)]));
        },
        getOwnPropertyDescriptor(target, prop) {
          if (prop in currentProto2) {
            return Object.getOwnPropertyDescriptor(currentProto2, prop);
          }
          return Object.getOwnPropertyDescriptor(target, prop);
        }
      });
      Object.setPrototypeOf(proxy, originalProto);
      Object.setPrototypeOf(this, proxy);
    } // end else not proxied yet

    // Now we have set up the proxy, we can add properties to currentProto2
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        currentProto2[key] = value[key];
      }
    } else {
      throw new Error('__proto2__ can only be set to a descendant of object');
    }
  },
  configurable: true,
  enumerable: false
});

// Example usage:
// const obj = { a: 1 };
// obj.__proto2__ = { b: 2 };
// console.log(obj.b); // 2
// console.log(obj.a); // 1
// const obj2 = Object.create(obj);
// console.log(obj2.b); // 2
// obj2.__proto2__ = { c: 3 };
// console.log(obj2.c); // 3
// console.log(obj.c); // undefined

// The above works, but has some issues:
// 1. It does not work on objects created with Object.create(null) because they don't inherit from Object.prototype
// 2. It does not allow multiple __proto2__ chains
// 3. It does not allow accessing the __proto2__ object directly

// Let's address these issues one by one:

// 1. To make it work on objects created with Object.create(null), we can define a function that adds __proto2__ to any object
// We can simply snip the function that adds __proto2__ to Object.prototype and make it a standalone function

function addProto2(obj) {
  if (obj.hasOwnProperty('__proto2__')) return obj; // Already has __proto2__
  if (obj === Object.prototype) return obj; // Can't add to Object.prototype
  const originalProto = Object.getPrototypeOf(obj);
  let __proto2__ = null; // Default value when read without writing after installation of the proxy as the new real __proto__
  const addedProto = new Proxy(this, {
    get(target, prop, receiver) {
      if (prop === '__proto2__') return __proto2__;
      if (prop in __proto2__) {
        return Reflect.get(__proto2__, prop, receiver);
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      if (prop === '__proto2__') {
        __proto2__ = value;
        return true;
      }
      if (prop in __proto2__ || !(prop in target)) {
        return Reflect.set(__proto2__, prop, value, receiver);
      }
      return Reflect.set(target, prop, value, receiver);
    },
    has(target, prop) {
      if (prop === '__proto2__') return true;
      return Reflect.has(__proto2__, prop) || Reflect.has(target, prop);
    },
    ownKeys(target) {
      return Array.from(new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(__proto2__)]));
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop === '__proto2__') {
        return {
          configurable: true,
          enumerable: false,
          value: __proto2__,
          writable: true
        };
      }
      if (prop in __proto2__) {
        return Object.getOwnPropertyDescriptor(__proto2__, prop);
      }
      return Object.getOwnPropertyDescriptor(target, prop);
    }
  });
  Object.setPrototypeOf(addedProto, originalProto);
  Object.setPrototypeOf(obj, addedProto);
  return obj;
}

// Now we can use addProto2 to add __proto2__ to any object, including those inherited from Object.prototype

// We simply run Object.DefineProperty on Object.prototype to add the __proto2__ property
// but we make it a no-op that throws an error if someone tries to set it on Object.prototype itself

Object.defineProperty(Object.prototype, '__proto2__', {
  set(value) {
    if (this === Object.prototype) {
      throw new Error('__proto2__ cannot be set on Object.prototype');
    }
    if (!this.hasOwnProperty('__proto2__')) {
      addProto2(this);
    }
  },
  get() {
    return null; // If we're not proxied, always return null. addProto2 will set up the proxy if needed
  },
  configurable: true,
  enumerable: false
});

// Now we also edit some other things on Object.prototype
// Object.create can be modified to automatically add __proto2__ to created objects unless the prototype is null
const oldCreate = Object.create;
Object.create = function(proto, propertiesObject) {
  const obj = oldCreate(proto, propertiesObject);
  if (proto !== null && !obj.hasOwnProperty('__proto2__')) {
    addProto2(obj);
  }
  return obj;
}

// Object.setPrototypeOf can be modified to automatically add __proto2__ to the object if needed
const oldSetPrototypeOf = Object.setPrototypeOf;
Object.setPrototypeOf = function(obj, proto) {
  const result = oldSetPrototypeOf(obj, proto);
  if (proto !== null && !obj.hasOwnProperty('__proto2__')) {
    addProto2(obj);
  }
  return result;
}

