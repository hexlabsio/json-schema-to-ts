import { FilePart, TsFile } from '@hexlabs/typescript-generator';
import { SchemaToTsBuilder } from '../src';
import { AnyAsAdditionalBuilder } from './schemas/any-of/AnyAsAdditional';
import { AnyWrappedBuilder } from './schemas/any-of/AnyWrapped';
import { TestAny_TypeBuilder } from './schemas/any-of/TestAny_Type';
import { TestAnyOptionsBuilder } from './schemas/any-of/TestAnyOptions';
import { TestRefBuilder } from './schemas/ref-model';
import { simple } from './schemas/simple';
import { simpleRequired } from './schemas/simple-required';
import { ref, refObject, refArray } from './schemas/ref';
import { allOf, primitiveAllOf } from './schemas/all-of/allOf';
import { dualType } from './schemas/dual-type/dual-type';
import { anyOf, anyOfWrapped, anyOfWrappedAdditional, anyOfRef } from './schemas/any-of/anyOf';
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
    const outputDir = SchemaToTsBuilder.create(simple, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(1);
    compare(files[0], 'simple-model');
    expect(TestObject1Builder.create().a('test').build()).toEqual({a: 'test'})
  });

  it('should model single required property object schema', () => {
    const outputDir = SchemaToTsBuilder.create(simpleRequired, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(1);
    compare(files[0], 'simple-required-model');
    expect(TestObject2Builder.create().a('test').build()).toEqual({a: 'test'})
  });

  it('should model ref', () => {
    const outputDir = SchemaToTsBuilder.create(ref, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(1);
    compare(files[0], 'ref-model');
    expect(TestRefBuilder.create().a('test').build()).toEqual({a: 'test'})
  });

  it('should model ref object', () => {
    const outputDir = SchemaToTsBuilder.create(refObject, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(2);
    compare(files[0], 'ref-object-model');
  });

  it('should model ref array', () => {
    const outputDir = SchemaToTsBuilder.create(refArray, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(2);
    compare(files[1], 'ref-array-model');
  });

  it('should model allOf', () => {
    const outputDir = SchemaToTsBuilder.create(allOf, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(5);
    compare(files[0], 'all-of/TestAllOf');
    compare(files[1], 'all-of/Part1');
    compare(files[2], 'all-of/Part2');
    compare(files[3], 'all-of/Part3');
    compare(files[4], 'all-of/Combined');
  });

  it('should model primitive allOf', () => {
    const outputDir = SchemaToTsBuilder.create(primitiveAllOf, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(1);
    compare(files[0], 'all-of/PrimitiveAllOf');
  });


  it('should model dual type', () => {
    const outputDir = SchemaToTsBuilder.create(dualType, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(2);
    compare(files[0], 'any-of/TestAny_Type');
    compare(files[1], 'any-of/TestAny');
  });

  it('should model anyOf', () => {
    const outputDir = SchemaToTsBuilder.create(anyOf, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(2);
    compare(files[0], 'any-of/TestAny_Type');
    compare(files[1], 'any-of/TestAny');
    expect(TestAny_TypeBuilder.create().testAny(builder => builder.test('123')).build()).toEqual({ test: '123' });
    expect(TestAny_TypeBuilder.create().as(null).build()).toEqual(null);
    expect(TestAny_TypeBuilder.create().as('xyz').build()).toEqual('xyz');
  });

  it('should model wrapped anyOf', () => {
    const outputDir = SchemaToTsBuilder.create(anyOfWrapped, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(3);
    compare(files[0], 'any-of/AnyWrapped');
    compare(files[1], 'any-of/TestAny_Type');
    compare(files[2], 'any-of/TestAny');
    expect(AnyWrappedBuilder.create().myProperty({ test: 'a' }).build()).toEqual({ myProperty: { test: 'a' } });
    expect(AnyWrappedBuilder.create().myProperty(myProperty => myProperty.testAny(testAny => testAny.test('a'))).build()).toEqual({ myProperty: { test: 'a' } });
    expect(AnyWrappedBuilder.create().myProperty(myProperty => myProperty.as(null)).build()).toEqual({ myProperty: null });
    expect(AnyWrappedBuilder.create().myProperty(myProperty => myProperty.as('123')).build()).toEqual({ myProperty: '123' });
  });

  it('should model wrapped anyOf when additional properties', () => {
    const outputDir = SchemaToTsBuilder.create(anyOfWrappedAdditional, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(3);
    compare(files[0], 'any-of/AnyAsAdditional');
    compare(files[1], 'any-of/TestAny_Type');
    compare(files[2], 'any-of/TestAny');
    expect(AnyAsAdditionalBuilder.create().append('a', t => t.as('123')).build()).toEqual({a: '123'});
  });

  it('should model anyOf when additional properties are all refs', () => {
    const outputDir = SchemaToTsBuilder.create(anyOfRef, testOutput).modelFiles(true);
    const files = outputDir.get().files;
    expect(files.length).toEqual(4);
    compare(files[0], 'any-of/TestAnyOptions');
    compare(files[1], 'any-of/Option1');
    compare(files[2], 'any-of/Option2');
    compare(files[3], 'any-of/TestAnyOptionsProperties');
    expect(TestAnyOptionsBuilder.create().append('abc', abc => abc.option1({a: 'abc'})).build()).toEqual({ abc: { a: 'abc' } });
    expect(TestAnyOptionsBuilder.create().append('abc', abc => abc.option2({b: 'def'})).build()).toEqual({ abc: { b: 'def' } });
    expect(TestAnyOptionsBuilder.create().append('abc', abc => abc.option1(option1 => option1.a('abc'))).build()).toEqual({ abc: { a: 'abc' } });
  });
});