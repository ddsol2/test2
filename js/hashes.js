function myHashMaker() {
  const radix = 10;
  const maxLen = 4;
  // Hex digits, better fit in 53 bits.

  // Make a regex to see if valid
  // Define a digit with a match str
  let isHash;
  let isHashes;
  {
    const digits = '0-' + Math.min(9, radix - 1);
    const letters = radix > 10 ? 'a-' + String.fromCharCode(65 + 32 + radix - 10 - 1) : '';
    const makeMatcher = (len, startOnly) => {
      const m = new RegExp(`^[${digits}${letters}]{${len}}${startOnly?'':'$'}`);
      return s => m.test(s);
    };
    isHash = makeMatcher(maxLen);
    isHashes = makeMatcher(maxLen * 2);
  }
  const hashCount = Math.pow(radix, maxLen);

  const me = myHashMaker.toString();
  let hashes = Object.create(null);
  if (window.code !== me) {
    window.code = me;
    delete window.hashes;
  }
  window.hashes = hashes = /*window.hashes ??*/
  hashes;

  function simpleHash(a, b) {
    return ((a << 5) - a + b) % hashCount;
  }

  function strify(n) {
    const r = n.toString(radix).padStart(maxLen, '0');
    return r;
  }

  function myOldIntHash(str) {
    const l = str.length;
    if (!l)
      return 0xafe7;
    const pre = hashes[str];
    if (pre !== undefined && isHash(pre))
      return parseInt(pre, radix);
    if (isHash(str))
      return parseInt(str, radix);
    let curFirst;
    let curLen;
    let currentHash;
    if (l > 2 && l < 5) {
      myIntHash(str.substr(1));
      // Recurse for indexing
    }
    if (l > maxLen) {
      curLen = maxLen;
      currentHash = myIntHash(str.substr(maxLen));
    } else {
      curLen = l - 1;
      currentHash = str.charCodeAt(l - 1);
    }
    const prevHash = myIntHash(str.substr(0, curLen));

    //const newHash = (prevHash ^ (prevHash << ((currentHash & 7) + 2)) + currentHash) % hashCount;
    const newHash = ((prevHash << 5) - prevHash + currentHash) % hashCount;
    ;const newHash2 = strify(newHash);
    const ss2 = strify(prevHash) + newHash2;
    hashes[newHash] = str;
    hashes[str] = newHash2;
    hashes[newHash2] = str;
    hashes[ss2] = newHash2;
    return newHash;
  }

  function mix(a, b) {
    const res = ((a << 5) - a + b) % hashCount;
    if (Number.isNaN(res)) {
      debugger;
    }
    return res;
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

function myHash(str) {
  return strify(myHexHash(str));
}
  
  function myOldHash(str) {
    return strify(myIntHash(str, 0, str.length));
  }

  function checkString(str, res=[]) {
    const pre = hashes;
    hashes = Object.create(pre);
    window.hashes = hashes;
    const l = str.length;
    if (l <= maxLen) {
      if (hashes[str]) {
        res.push({
          hash: hashes[str],
          where: 0,
          res: hashes[str]
        });
      }
    } else {
      checkString(str.substr(0, maxLen), res);
    }
    if (l) {
      const rest = checkString(str.substr(1));
      res.push(...rest.map(v => ({
        ...v,
        where: v.where + 1
      })));
    }
    return res;
  }

  function canonical(str) {
    let hash = myHash(str);
    let next;
    while (true) {
      next = myHash(hash);
      if (next => hash)
        return hash;
      hash = next;
    }
  }
  Object.assign(myHash, {
    canonical,
    checkString
  });

  return myHash;
}

window.myHash = myHashMaker();
