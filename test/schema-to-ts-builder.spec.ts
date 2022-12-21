import { Dir, Printer } from '@hexlabs/typescript-generator';
import { JSONSchema7, SchemaToTsBuilder } from '../src';

describe('Builder', () => {
  describe('methods', () => {
    it('should type parameter as named type', () => {
      const schema: JSONSchema7 = {
        title: 'testObject',
        type: 'object',
        properties: {
          enum: {
            type: 'object',
            properties: {
              part2: { type: 'boolean' }
            }
          }
        }
      };
      const builders = SchemaToTsBuilder.create(schema).builderFile();
      const method = builders[0].parts().methods.find(it => it.parts().name === 'enumeration')!;
      expect(method.print(Printer.create())).toEqual(
        'enumeration(enumeration: TestObjectEnum | ((enumeration: TestObjectEnumBuilder) => TestObjectEnumBuilder)): this {\n' +
        '  if (typeof enumeration === \'function\'){ this.TestObject.enum = enumeration(TestObjectEnumBuilder.create()).build(); }\n' +
        '  else { this.TestObject.enum = enumeration; }\n' +
        '  return this;\n' +
        '}\n\n');
    });

    it('should create simple object builder', () => {
      const schema: JSONSchema7 = {
        title: 'TESTER',
        definitions: {
          'testObject': { type: 'object', properties: { a: {type: 'string'}, b: { type: 'boolean'}}},
        }
      };
      const builders = SchemaToTsBuilder.create(schema).builderFile();
      expect(builders.length).toEqual(2);
      const builderClass = builders[1];
      const methods = builderClass.parts().methods
      expect(methods.length).toEqual(4);
      expect(methods[0].print(Printer.create())).toEqual('a(a: string): TESTERTestObjectBuilder<T & Pick<TESTERTestObject, \'a\'>> {\n' +
        '  this.TESTERTestObject.a = a;\n' +
        '  return this as any;\n' +
        '}\n\n')
      expect(methods[1].print(Printer.create())).toEqual('b(b: boolean): TESTERTestObjectBuilder<T & Pick<TESTERTestObject, \'b\'>> {\n' +
        '  this.TESTERTestObject.b = b;\n' +
        '  return this as any;\n' +
        '}\n\n')
    })
  });

  it('should create additional properties object builder', () => {
    const schema: JSONSchema7 = {
      title: 'TESTER',
      definitions: {
        'testObject': { type: 'object', additionalProperties: true },
      }
    };
    const builders = SchemaToTsBuilder.create(schema).builderFile();
    expect(builders.length).toEqual(2);
    const builderClass = builders[1];
    const methods = builderClass.parts().methods
    expect(methods.length).toEqual(3);
    expect(methods[0].print(Printer.create())).toEqual('x');
  });

})

describe('temp', () => {
  it('go', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const builder = SchemaToTsBuilder.create(require('./schema2.json'), undefined, name => {
      if(name === 'AsyncAPI300schema') return 'AsyncApi';
      if(name === 'Message') return 'MessageType';
      if(name === 'MessageType_1_1') return 'Message';
      if(name === 'MessageType_1_0') return 'OneOfMessages';
      return name;
    });
    const modelFile = builder.modelFile('index.ts');
    builder.builderFile().forEach(it => modelFile.append(it, {exported: true}));
    Dir.create('models').add(modelFile).write('generated-tests')
  })
})