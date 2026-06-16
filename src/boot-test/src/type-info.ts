type TTypeType = "string" | "number" | "boolean" | "symbol" | "bigint" | "undefined" | "null" | "object" | "array" | "tuple" | "function" | "class" | "interface" | "enum" | "type-alias" | undefined;
class TType {
  typeName: string;
  typeType: TTypeType = undefined;
  moduleID: string; //Can be anything, from a path, url, etc, but it should be machine processable somehow, at least in the future, hard links

  constructor(typeName: string, moduleID: string) {
    this.typeName = typeName;
    this.moduleID = moduleID;
  }

  isReferenceType(): boolean {
    return this.typeType === "object" || this.typeType === "array" || this.typeType === "function" || this.typeType === "class" || this.typeType === "interface" || this.typeType === "enum" || this.typeType === "type-alias";
  }

  isPrimitiveType(): boolean {
    return this.typeType === "string" || this.typeType === "number" || this.typeType === "boolean" || this.typeType === "symbol" || this.typeType === "bigint" || this.typeType === "undefined" || this.typeType === "null";
  }
}

declare global {
  interface Object {
    _?: unknown;
  }
}

const objectUnderscoreStore = new WeakMap<object, Record<string, unknown>>();

function getOrCreateObjectUnderscore(target: object): Record<string, unknown> {
  let record = objectUnderscoreStore.get(target);
  if (!record) {
    record = {};
    objectUnderscoreStore.set(target, record);
  }
  return record;
}

function installGlobalUnderscore(): void {
  if (Object.prototype.hasOwnProperty("_")) {
    return;
  }

  Object.defineProperty(Object.prototype, "_", {
    get(this: object) {
      if (this === Object.prototype || this === null || this === undefined) {
        return undefined;
      }
      return getOrCreateObjectUnderscore(this);
    },
    enumerable: false,
    configurable: true
  });
}

installGlobalUnderscore();

class TStringType extends TType {
  constructor(moduleID: string) {
    super("string", moduleID);
    this.typeType = "string";
  }
}

class TNumberType extends TType {
  constructor(moduleID: string) {
    super("number", moduleID);
    this.typeType = "number";
  }
}

class TBooleanType extends TType {
  constructor(moduleID: string) {
    super("boolean", moduleID);
    this.typeType = "boolean";
  }
}

class TSymbolType extends TType {
  constructor(moduleID: string) {
    super("symbol", moduleID);
    this.typeType = "symbol";
  }
}

class TBigIntType extends TType {
  constructor(moduleID: string) {
    super("bigint", moduleID);
    this.typeType = "bigint";
  }
}

class TUndefinedType extends TType {
  constructor(moduleID: string) {
    super("undefined", moduleID);
    this.typeType = "undefined";
  }
}

class TNullType extends TType {
  constructor(moduleID: string) {
    super("null", moduleID);
    this.typeType = "null";
  }
}

interface TPropertyDescriptor {
  name: string;
  type: TType;
  optional?: boolean;
  readonly?: boolean;
}

class TObjectType extends TType {
  properties: TPropertyDescriptor[];

  constructor(typeName: string, moduleID: string, properties: TPropertyDescriptor[] = []) {
    super(typeName, moduleID);
    this.typeType = "object";
    this.properties = properties;
  }

  getProperty(name: string): TPropertyDescriptor | undefined {
    return this.properties.find(property => property.name === name);
  }

  addProperty(property: TPropertyDescriptor): void {
    this.properties.push(property);
  }
}

class TArrayType extends TType {
  elementType: TType;

  constructor(elementType: TType, moduleID: string, typeName?: string) {
    super(typeName ?? `${elementType.typeName}[]`, moduleID);
    this.typeType = "array";
    this.elementType = elementType;
  }
}

class TTupleType extends TType {
  elementTypes: TType[];

  constructor(elementTypes: TType[], moduleID: string, typeName?: string) {
    super(typeName ?? `[${elementTypes.map(member => member.typeName).join(", ")}]`, moduleID);
    this.typeType = "tuple";
    this.elementTypes = elementTypes;
  }
}

class TUnionType extends TType {
  memberTypes: TType[];

  constructor(memberTypes: TType[], moduleID: string) {
    super(memberTypes.map(member => member.typeName).join(" | "), moduleID);
    this.typeType = "type-alias";
    this.memberTypes = memberTypes;
  }
}

class TTypedValue<T> {
  type: TType;
  value: T;
  constructor(type: TType, val: T) {
    this.type = type;
    this.value = val;
  }
}

// Returns a boxed version of the primitive value, or the object itself if it's already an object, or undefined if it's null or undefined
function boxedPrimitives(v: any): undefined | object {
  if (typeof v === "object" && v) {
    return v;
  } else if (typeof v === "string") {
    return new String(v);
  } else if (typeof v === "number") {
    return new Number(v);
  } else if (typeof v === "boolean") {
    return new Boolean(v);
  } else if (typeof v === "symbol") {
    return Object(v);
  } else if (typeof v === "bigint") {
    return Object(v);
  } else {
    return undefined;
  }
}

function asBoxed<T>(type: TType, val: T): [T, TTypedValue<T>] {
  const baseObject = new TTypedValue<T>(type, val);
  const newVal = boxedPrimitives(val);
  if (newVal) {
    Object.defineProperty(newVal, "_", {
      value: baseObject,
      writable: false,
      enumerable: false,
      configurable: false
    });
  }
  return [newVal as T ?? val, baseObject];
}

