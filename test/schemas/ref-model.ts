export type TestRef = {a: string}

export class TestRefBuilder<T = TestRef> {

  private constructor(private testRef: Partial<TestRef> = {}){}

  a(a: string): TestRefBuilder<T & Pick<TestRef, 'a'>> {
    this.testRef.a = a;
    return this as any;
  }

  build(): {[P in keyof TestRef & keyof T]: TestRef[P];} {
    return this.testRef as TestRef;
  }

  static create(): TestRefBuilder<{}> {
    return new TestRefBuilder<{}>();
  }

}

