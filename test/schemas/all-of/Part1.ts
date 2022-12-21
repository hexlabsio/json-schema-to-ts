export type Part1 = {a?: string}

export class Part1Builder<T = Part1> {

  private constructor(private part1: Partial<Part1> = {}){}

  a(a: string): Part1Builder<T & Pick<Part1, 'a'>> {
    this.part1.a = a;
    return this as any;
  }

  build(): {[P in keyof Part1 & keyof T]: Part1[P];} {
    return this.part1 as Part1;
  }

  static create(): Part1Builder<{}> {
    return new Part1Builder<{}>();
  }

}

