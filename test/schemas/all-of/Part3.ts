export type Part3 = {a?: 'X', b?: number}

export class Part3Builder<T = Part3> {

  private constructor(private part3: Partial<Part3> = {}){}

  as(part3: Part3): Part3Builder {
    this.part3 = part3;
    return this as any;
  }

  a(a: 'X'): Part3Builder<T & Pick<Part3, 'a'>> {
    this.part3.a = a;
    return this as any;
  }

  b(b: number): Part3Builder<T & Pick<Part3, 'b'>> {
    this.part3.b = b;
    return this as any;
  }

  build(): {[P in keyof Part3 & keyof T]: Part3[P];} {
    return this.part3 as any;
  }

  static create(): Part3Builder<{}> {
    return new Part3Builder<{}>();
  }

}

