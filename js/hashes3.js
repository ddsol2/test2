/**
 * This file adds support for a second prototype chain via __proto2__
 */

function init() {
  /**
   * addProto2 adds support for a second prototype chain via __proto2__
   * to any object that doesn't already have it.
   * It does this by creating a Proxy that intercepts get, set, has, ownKeys, and getOwnPropertyDescriptor
   * to handle the __proto2__ property and delegate other operations to the original object or the __proto2__ object as needed.
   * The Proxy is then set as the new prototype of the original object, effectively adding the __proto2__ property.
   */
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

  // Modify Object.prototype to add a __proto2__ property that uses the addProto2 function
  // to set up the proxy when first accessed, from where everything else is handled.
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
  Object.create = function (proto, propertiesObject) {
    const obj = oldCreate(proto, propertiesObject);
    if (proto !== null && !obj.hasOwnProperty('__proto2__')) {
      addProto2(obj);
    }
    return obj;
  }

  // Object.setPrototypeOf can be modified to automatically add __proto2__ to the object if needed
  const oldSetPrototypeOf = Object.setPrototypeOf;
  Object.setPrototypeOf = function (obj, proto) {
    const result = oldSetPrototypeOf(obj, proto);
    if (proto !== null && !obj.hasOwnProperty('__proto2__')) {
      addProto2(obj);
    }
    return result;
  }
}

