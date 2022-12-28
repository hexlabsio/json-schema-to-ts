export type TestAny = {test: string}

export class TestAnyBuilder<T = TestAny> {

  private constructor(private testAny: Partial<TestAny> = {}){}

   as(testAny: TestAny): TestAnyBuilder {
     this.testAny = testAny;
     return this as any;
   }

  test(test: string): TestAnyBuilder<T & Pick<TestAny, 'test'>> {
    this.testAny.test = test;
    return this as any;
  }

  build(): {[P in keyof TestAny & keyof T]: TestAny[P];} {
    return this.testAny as any;
  }

  static create(): TestAnyBuilder<{}> {
    return new TestAnyBuilder<{}>();
  }

}

