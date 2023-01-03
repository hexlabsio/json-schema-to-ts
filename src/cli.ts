#!usr/bin/env node

import { Command } from 'commander';
import { mkdirSync } from 'fs';
import path from 'path';
import { SchemaToTsBuilder } from './schema-to-ts-builder';

function relativePathFor(location: string): [string, string] {
  const sourcePath = path.parse(location);
  const pathLocation = sourcePath.root ? path.normalize(location) : path.join(__dirname, location).normalize();
  return [sourcePath.name, pathLocation];
}

const program = new Command('generate');
program.argument('<schemas...>', 'One or more locations to schemas to generate from. The first will be the primary schema')
  .option('-i, --inline-builders', 'Create builders inside model files')
  .option('-o, --output <output>', 'Output Directory')
  .action((schemas, {inlineBuilders, output}) => {
    const schemaJson = (schemas as string[]).map(it => relativePathFor(it));
    const others = schemaJson.slice(1);
    const outputDir = output ?? 'output';
    mkdirSync(outputDir, { recursive: true });
    if(others) {
      const named = others.reduce((prev, [name, location]) => ({...prev, [name]: require(location)}), {});
      const builder = SchemaToTsBuilder.createWithOthers(named, require(schemaJson[0][1]), outputDir);
      builder.modelFiles(inlineBuilders).write();
    } else {
      const builder = SchemaToTsBuilder.create(require(schemaJson[0][1]), outputDir);
      builder.modelFiles(inlineBuilders).write();
    }
  })
  .parse(process.argv);

