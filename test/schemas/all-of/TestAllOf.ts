import { Combined, CombinedBuilder } from './Combined'


export type TestAllOf = {parent: Combined}

export class TestAllOfBuilder<T = TestAllOf> {

  private constructor(private testAllOf: Partial<TestAllOf> = {}){}

  as(testAllOf: TestAllOf): TestAllOfBuilder {
    this.testAllOf = testAllOf;
    return this as any;
  }

  parent(parent: Combined | ((parent: ReturnType<typeof CombinedBuilder.create>) => CombinedBuilder)): TestAllOfBuilder<T & Pick<TestAllOf, 'parent'>> {
    if (typeof parent === 'function'){
      this.testAllOf.parent = parent(CombinedBuilder.create()).build();
    } else {
      this.testAllOf.parent = parent;
    }
    return this as any;
  }

  build(): {[P in keyof TestAllOf & keyof T]: TestAllOf[P];} {
    return this.testAllOf as any;
  }

  static create(): TestAllOfBuilder<{}> {
    return new TestAllOfBuilder<{}>();
  }

}

