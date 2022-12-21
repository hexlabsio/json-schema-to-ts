export type Part2 = {a?: string, b?: number}

export class Part2Builder<T = Part2> {

  private constructor(private part2: Partial<Part2> = {}){}

  a(a: string): Part2Builder<T & Pick<Part2, 'a'>> {
    this.part2.a = a;
    return this as any;
  }

  b(b: number): Part2Builder<T & Pick<Part2, 'b'>> {
    this.part2.b = b;
    return this as any;
  }

  build(): {[P in keyof Part2 & keyof T]: Part2[P];} {
    return this.part2 as Part2;
  }

  static create(): Part2Builder<{}> {
    return new Part2Builder<{}>();
  }

}

