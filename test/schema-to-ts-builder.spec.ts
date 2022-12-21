import { FilePart, TsFile } from '@hexlabs/typescript-generator';
import { SchemaToTsBuilder } from '../src';
import { TestRefBuilder } from './schemas/ref-model';
import { simple } from './schemas/simple';
import { simpleRequired } from './schemas/simple-required';
import { ref } from './schemas/ref';
import { refObject } from './schemas/ref-object';
import { allOf } from './schemas/all-of/allOf';
import { readFileSync } from 'fs';
import { TestObject1Builder } from './schemas/simple-model';
import { TestObject2Builder } from './schemas/simple-required-model';

const testOutput = 'test-output';

function compare(file: FilePart, name: string) {
  const filePrinted = (file as TsFile).print();
  console.log(filePrinted)
  expect(filePrinted.split('\n').map(it => it.trim()).join('\n')).toEqual(readFileSync(`test/schemas/${name}.ts`).toString().split('\n').map(it => it.trim()).join('\n'));
}

describe('Simple Schemas', () => {
  it('should model single property object schema', () => {
    const outputDir = SchemaToTsBuilder.create(simple, testOutput).modelFiles();
    const files = outputDir.get().files;
    expect(files.length).toEqual(1);
    compare(files[0], 'simple-model');
    expect(TestObject1Builder.create().a('test').build()).toEqual({a: 'test'})
  });

  it('should model single required property object schema', () => {
    const outputDir = SchemaToTsBuilder.create(simpleRequired, testOutput).modelFiles();
    const files = outputDir.get().files;
    expect(files.length).toEqual(1);
    compare(files[0], 'simple-required-model');
    expect(TestObject2Builder.create().a('test').build()).toEqual({a: 'test'})
  });

  it('should model ref', () => {
    const outputDir = SchemaToTsBuilder.create(ref, testOutput).modelFiles();
    const files = outputDir.get().files;
    expect(files.length).toEqual(1);
    compare(files[0], 'ref-model');
    expect(TestRefBuilder.create().a('test').build()).toEqual({a: 'test'})
  });

  it('should model ref object', () => {
    const outputDir = SchemaToTsBuilder.create(refObject, testOutput).modelFiles();
    const files = outputDir.get().files;
    expect(files.length).toEqual(2);
    compare(files[0], 'ref-object-model');
  });

  it('should model allOf', () => {
    const outputDir = SchemaToTsBuilder.create(allOf, testOutput).modelFiles();
    const files = outputDir.get().files;
    expect(files.length).toEqual(3);
    compare(files[0], 'all-of/TestAllOf');
    compare(files[1], 'all-of/Part1');
    compare(files[2], 'all-of/Part2');
  });
});

describe('temp', () => {
  it('go', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const builder = SchemaToTsBuilder.createWithOthers({['http://json-schema.org/draft-07/schema#']: require('../src/json-schema-draft-07.json')}, require('./schema2.json'), 'models', (name, location) => {
      if(name === 'AsyncAPI300schema') return {name: 'AsyncApi', location};
      if(name === 'Message') return {name: 'MessageType', location};
      if(name === 'MessageType_1_1') return {name: 'Message', location};
      if(name === 'MessageType_1_0') return {name: 'OneOfMessages', location};
      return {name, location};
    });
    const modelFile = builder.modelFiles();
    modelFile.write('generated-tests');
  })
})