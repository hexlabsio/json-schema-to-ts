import { Option1, Option1Builder } from './Option1'
import { Option2, Option2Builder } from './Option2'


export type TestAnyOptionsProperties = Option1 | Option2

export class TestAnyOptionsPropertiesBuilder<T = TestAnyOptionsProperties> {

  private constructor(private testAnyOptionsProperties: TestAnyOptionsProperties | undefined = undefined){}

  as(testAnyOptionsProperties: TestAnyOptionsProperties): TestAnyOptionsPropertiesBuilder {
    this.testAnyOptionsProperties = testAnyOptionsProperties;
    return this as any;
  }

  option1(option1: Option1 | ((option1: ReturnType<typeof Option1Builder.create>) => Option1Builder)): TestAnyOptionsPropertiesBuilder {
    if (typeof option1 === 'function'){
      this.testAnyOptionsProperties = option1(Option1Builder.create()).build();
    } else {
      this.testAnyOptionsProperties = option1;
    }
    return this as any;
  }

  option2(option2: Option2 | ((option2: ReturnType<typeof Option2Builder.create>) => Option2Builder)): TestAnyOptionsPropertiesBuilder {
    if (typeof option2 === 'function'){
      this.testAnyOptionsProperties = option2(Option2Builder.create()).build();
    } else {
      this.testAnyOptionsProperties = option2;
    }
    return this as any;
  }

  build(): T {
    return this.testAnyOptionsProperties as any;
  }

  static create(): TestAnyOptionsPropertiesBuilder<{}> {
    return new TestAnyOptionsPropertiesBuilder();
  }

}

