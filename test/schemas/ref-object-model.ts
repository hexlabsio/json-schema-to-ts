import { Xyz, XyzBuilder } from './Xyz'


export type TestRefObject = {a: Xyz}

export class TestRefObjectBuilder<T = TestRefObject> {

  private constructor(private testRefObject: Partial<TestRefObject> = {}){}

  as(testRefObject: TestRefObject): TestRefObjectBuilder {
    this.testRefObject = testRefObject;
    return this as any;
  }

  a(a: Xyz | ((a: ReturnType<typeof XyzBuilder.create>) => XyzBuilder)): TestRefObjectBuilder<T & Pick<TestRefObject, 'a'>> {
    if (typeof a === 'function'){
      this.testRefObject.a = a(XyzBuilder.create()).build();
    } else {
      this.testRefObject.a = a;
    }
    return this as any;
  }

  build(): {[P in keyof TestRefObject & keyof T]: TestRefObject[P];} {
    return this.testRefObject as any;
  }

  static create(): TestRefObjectBuilder<{}> {
    return new TestRefObjectBuilder<{}>();
  }

}

