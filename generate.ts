import { SchemaToTsBuilder } from './src/schema-to-ts-builder';

(() => {
  SchemaToTsBuilder.create(require('../src/json-schema-draft-07.json'), 'generated-tests').modelFiles().write();
})();