import { TestAnyOptionsProperties, TestAnyOptionsPropertiesBuilder } from './TestAnyOptionsProperties'


export type TestAnyOptions = {[key: string]: TestAnyOptionsProperties}

export class TestAnyOptionsBuilder<T = TestAnyOptions> {

  private constructor(private testAnyOptions: Partial<TestAnyOptions> = {}){}

  as(testAnyOptions: TestAnyOptions): TestAnyOptionsBuilder {
    this.testAnyOptions = testAnyOptions;
    return this as any;
  }

  append(property: string, append: TestAnyOptionsProperties | ((append: ReturnType<typeof TestAnyOptionsPropertiesBuilder.create>) => TestAnyOptionsPropertiesBuilder)): TestAnyOptionsBuilder<T & Pick<TestAnyOptions, string>> {
    if (typeof append === 'function'){
      this.testAnyOptions = { ...this.testAnyOptions, [property]: append(TestAnyOptionsPropertiesBuilder.create()).build() };
    } else {
      this.testAnyOptions = { ...this.testAnyOptions, [property]: append  };
    }
    return this as any;
  }

  build(): {[P in keyof TestAnyOptions & keyof T]: TestAnyOptions[P];} {
    return this.testAnyOptions as any;
  }

  static create(): TestAnyOptionsBuilder<{}> {
    return new TestAnyOptionsBuilder<{}>();
  }

}

