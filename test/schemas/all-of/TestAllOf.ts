import { Part1, Part1Builder } from './Part1'
import { Part2, Part2Builder } from './Part2'


export type TestAllOf = {parent: Part1 & Part2}

export class TestAllOfBuilder<T = TestAllOf> {

  private constructor(private testAllOf: Partial<TestAllOf> = {}){}

  parentPart1(parentPart1: Part1 | ((parentPart1: ReturnType<typeof Part1Builder.create>) => Part1Builder)): TestAllOfBuilder<T & Pick<TestAllOf, 'parent'>> {
    if (typeof parentPart1 === 'function'){
      this.testAllOf.parent = parentPart1(Part1Builder.create()).build();
    } else {
      this.testAllOf.parent = parentPart1;
    }
    return this as any;
  }

  parentPart2(parentPart2: Part2 | ((parentPart2: ReturnType<typeof Part2Builder.create>) => Part2Builder)): TestAllOfBuilder<T & Pick<TestAllOf, 'parent'>> {
    if (typeof parentPart2 === 'function'){
      this.testAllOf.parent = parentPart2(Part2Builder.create()).build();
    } else {
      this.testAllOf.parent = parentPart2;
    }
    return this as any;
  }

  build(): {[P in keyof TestAllOf & keyof T]: TestAllOf[P];} {
    return this.testAllOf as TestAllOf;
  }

  static create(): TestAllOfBuilder<{}> {
    return new TestAllOfBuilder<{}>();
  }

}

