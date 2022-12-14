export type TestObject1 = {a?: string}

export class TestObject1Builder<T = TestObject1> {

  private constructor(private testObject1: Partial<TestObject1> = {}){}

  as(testObject1: TestObject1): TestObject1Builder {
    this.testObject1 = testObject1;
    return this as any;
  }

  a(a: string): TestObject1Builder<T & Pick<TestObject1, 'a'>> {
    this.testObject1.a = a;
    return this as any;
  }

  build(): {[P in keyof TestObject1 & keyof T]: TestObject1[P];} {
    return this.testObject1 as any;
  }

  static create(): TestObject1Builder<{}> {
    return new TestObject1Builder<{}>();
  }

}

