export const greeting: string = "Hello from the Fluid Universe!";
export const add = (a: number, b: number): number => a + b;

// Test junk:
type TTypeType = "string" | "number" | "boolean" | "symbol" | "bigint" | "undefined" | "null" | "object" | "array" | "tuple" | "function" | "class" | "interface" | "enum" | "type-alias" | undefined;
export class TType {
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
