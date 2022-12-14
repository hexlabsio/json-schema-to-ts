import { Dir, Printer, TsClass, TsFile } from '@hexlabs/typescript-generator';
import path from 'path';
import { SchemaToTsBuilder } from '../src/schema-to-ts-builder';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import prettier from 'prettier';

function writeDir(location: string, dir: Dir) {
  const {name, dirs, files} = dir.get();
  const directory = path.join(location, name).normalize();
  mkdirSync(directory, { recursive: true });
  dirs.forEach(it => writeDir(directory, it));
  files.forEach(it => {
    writeFileSync(path.join(directory, it.name), prettier.format((it as TsFile).print(), { parser: 'typescript', semi: false}));
  });
}

describe('test', () => {
  it('should', async () => {
    const builder = SchemaToTsBuilder.create(JSON.parse(readFileSync('./test/example.basic.json').toString()));
    const file = builder.modelFile('index.ts');
    builder.builderFile().forEach(it => file.append(`export ${(it as TsClass).print(Printer.create())}`));
    await writeDir('generated-tests', Dir.create('models').add(file));
  })
})