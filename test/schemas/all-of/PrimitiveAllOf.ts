export type PrimitiveAllOf = {parent: number}

export class PrimitiveAllOfBuilder<T = PrimitiveAllOf> {

  private constructor(private primitiveAllOf: Partial<PrimitiveAllOf> = {}){}

  as(primitiveAllOf: PrimitiveAllOf): PrimitiveAllOfBuilder {
    this.primitiveAllOf = primitiveAllOf;
    return this as any;
  }

  parent(parent: number): PrimitiveAllOfBuilder<T & Pick<PrimitiveAllOf, 'parent'>> {
    this.primitiveAllOf.parent = parent;
    return this as any;
  }

  build(): {[P in keyof PrimitiveAllOf & keyof T]: PrimitiveAllOf[P];} {
    return this.primitiveAllOf as any;
  }

  static create(): PrimitiveAllOfBuilder<{}> {
    return new PrimitiveAllOfBuilder<{}>();
  }

}

