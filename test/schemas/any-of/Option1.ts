export type Option1 = {a?: string}

export class Option1Builder<T = Option1> {

  private constructor(private option1: Partial<Option1> = {}){}

  as(option1: Option1): Option1Builder {
    this.option1 = option1;
    return this as any;
  }

  a(a: string): Option1Builder<T & Pick<Option1, 'a'>> {
    this.option1.a = a;
    return this as any;
  }

  build(): {[P in keyof Option1 & keyof T]: Option1[P];} {
    return this.option1 as any;
  }

  static create(): Option1Builder<{}> {
    return new Option1Builder<{}>();
  }

}

