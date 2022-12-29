export type Xyz = Array<string>

export class XyzBuilder {

  private constructor(private xyz: any[] = [] as any){}

  as(xyz: Xyz): XyzBuilder {
    this.xyz = xyz;
    return this as any;
  }

  append(append: string): this {
    this.xyz = [ ...this.xyz, append  ];
    return this as any;
  }

  build(): Xyz {
    return this.xyz as any;
  }

  static create(): XyzBuilder {
    return new XyzBuilder();
  }

}

