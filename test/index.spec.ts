import { Dir, Printer, TsClass } from '@hexlabs/typescript-generator';
import { SchemaToTsBuilder } from '../src/schema-to-ts-builder';
import { readFileSync } from 'fs';


describe('test', () => {
  it('should', async () => {
    const builder = SchemaToTsBuilder.create(JSON.parse(readFileSync('./test/schema.json').toString()))
      .transformNames(ref => ref.name === 'JSONSchema7' ? {...ref, name: 'JSONSchema7Type'} : ref.name === 'JSONSchema7Type_0' ? {...ref, name: 'JSONSchema7'} : ref);
    const file = builder.modelFile('index.ts');
    builder.builderFile().forEach(it => file.append(`export ${(it as TsClass).print(Printer.create())}`));
    Dir.create('models').add(file).write('generated-tests');
  })
})