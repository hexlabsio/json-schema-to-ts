import { TestAny, TestAnyBuilder } from './TestAny'


export type TestAny_Type = TestAny | string | null

export class TestAny_TypeBuilder<T = TestAny_Type> {

  private constructor(private testAny_Type: TestAny_Type | undefined = undefined){}

  as(testAny_Type: TestAny_Type): TestAny_TypeBuilder {
    this.testAny_Type = testAny_Type;
    return this as any;
  }

  testAny(testAny: TestAny | ((testAny: ReturnType<typeof TestAnyBuilder.create>) => TestAnyBuilder)): TestAny_TypeBuilder {
    if (typeof testAny === 'function'){
      this.testAny_Type = testAny(TestAnyBuilder.create()).build();
    } else {
      this.testAny_Type = testAny;
    }
    return this as any;
  }

  build(): T {
    return this.testAny_Type as any;
  }

  static create(): TestAny_TypeBuilder<{}> {
    return new TestAny_TypeBuilder();
  }

}

