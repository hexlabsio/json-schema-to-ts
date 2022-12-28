import { TestAny_Type, TestAny_TypeBuilder } from './TestAny_Type'


export type AnyAsAdditional = {[key: string]: TestAny_Type}

export class AnyAsAdditionalBuilder<T = AnyAsAdditional> {

  private constructor(private anyAsAdditional: Partial<AnyAsAdditional> = {}){}

  as(anyAsAdditional: AnyAsAdditional): AnyAsAdditionalBuilder {
    this.anyAsAdditional = anyAsAdditional;
    return this as any;
  }

  append(property: string, append: TestAny_Type | ((append: ReturnType<typeof TestAny_TypeBuilder.create>) => TestAny_TypeBuilder)): AnyAsAdditionalBuilder<T & Pick<AnyAsAdditional, string>> {
    if (typeof append === 'function'){
      this.anyAsAdditional = { ...this.anyAsAdditional, [property]: append(TestAny_TypeBuilder.create()).build() };
    } else {
      this.anyAsAdditional = { ...this.anyAsAdditional, [property]: append  };
    }
    return this as any;
  }

  build(): {[P in keyof AnyAsAdditional & keyof T]: AnyAsAdditional[P];} {
    return this.anyAsAdditional as any;
  }

  static create(): AnyAsAdditionalBuilder<{}> {
    return new AnyAsAdditionalBuilder<{}>();
  }

}

