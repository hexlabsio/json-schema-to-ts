import { TestAny_Type, TestAny_TypeBuilder } from './TestAny_Type'


export type AnyWrapped = {myProperty?: TestAny_Type}

export class AnyWrappedBuilder<T = AnyWrapped> {

  private constructor(private anyWrapped: Partial<AnyWrapped> = {}){}

   as(anyWrapped: AnyWrapped): AnyWrappedBuilder {
     this.anyWrapped = anyWrapped;
     return this as any;
   }

  myProperty(myProperty: TestAny_Type | ((myProperty: ReturnType<typeof TestAny_TypeBuilder.create>) => TestAny_TypeBuilder)): AnyWrappedBuilder<T & Pick<AnyWrapped, 'myProperty'>> {
    if (typeof myProperty === 'function'){
      this.anyWrapped.myProperty = myProperty(TestAny_TypeBuilder.create()).build();
    } else {
      this.anyWrapped.myProperty = myProperty;
    }
    return this as any;
  }

  build(): {[P in keyof AnyWrapped & keyof T]: AnyWrapped[P];} {
    return this.anyWrapped as any;
  }

  static create(): AnyWrappedBuilder<{}> {
    return new AnyWrappedBuilder<{}>();
  }

}

