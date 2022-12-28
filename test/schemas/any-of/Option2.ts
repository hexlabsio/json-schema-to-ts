export type Option2 = {b?: string}

export class Option2Builder<T = Option2> {

  private constructor(private option2: Partial<Option2> = {}){}

  as(option2: Option2): Option2Builder {
    this.option2 = option2;
    return this as any;
  }

  b(b: string): Option2Builder<T & Pick<Option2, 'b'>> {
    this.option2.b = b;
    return this as any;
  }

  build(): {[P in keyof Option2 & keyof T]: Option2[P];} {
    return this.option2 as any;
  }

  static create(): Option2Builder<{}> {
    return new Option2Builder<{}>();
  }

}

