export type TestObject2 = {a: string}

export class TestObject2Builder<T = TestObject2> {

  private constructor(private testObject2: Partial<TestObject2> = {}){}

  as(testObject2: TestObject2): TestObject2Builder {
    this.testObject2 = testObject2;
    return this as any;
  }

  a(a: string): TestObject2Builder<T & Pick<TestObject2, 'a'>> {
    this.testObject2.a = a;
    return this as any;
  }

  build(): {[P in keyof TestObject2 & keyof T]: TestObject2[P];} {
    return this.testObject2 as any;
  }

  static create(): TestObject2Builder<{}> {
    return new TestObject2Builder<{}>();
  }

}

