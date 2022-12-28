export type Combined = {a?: 'X', b?: number}

export class CombinedBuilder<T = Combined> {

  private constructor(private combined: Partial<Combined> = {}){}

  as(combined: Combined): CombinedBuilder {
    this.combined = combined;
    return this as any;
  }

  a(a: 'X'): CombinedBuilder<T & Pick<Combined, 'a'>> {
    this.combined.a = a;
    return this as any;
  }

  b(b: number): CombinedBuilder<T & Pick<Combined, 'b'>> {
    this.combined.b = b;
    return this as any;
  }

  build(): {[P in keyof Combined & keyof T]: Combined[P];} {
    return this.combined as any;
  }

  static create(): CombinedBuilder<{}> {
    return new CombinedBuilder<{}>();
  }

}

