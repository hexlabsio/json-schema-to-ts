import { JSONSchema7 } from '../../../src';

export const anyOf: JSONSchema7 = {
  title: 'TestAny_Type',
  anyOf: [
    { type: 'object', title: 'TestAny', required: ['test'], properties: { test: { type: 'string' } } },
    { type: 'string' },
    { type: 'null' },
  ]
}

export const anyOfWrapped: JSONSchema7 = {
  definitions: {
    'TestAny': anyOf
  },
  title: 'AnyWrapped',
  type: 'object',
  properties: {
    myProperty: { '$ref': '#/definitions/TestAny' }
  }
}

export const anyOfWrappedAdditional: JSONSchema7 = {
  definitions: {
    'TestAny': anyOf
  },
  title: 'AnyAsAdditional',
  type: 'object',
  additionalProperties: { '$ref': '#/definitions/TestAny' }
}

export const anyOfRef: JSONSchema7 = {
  definitions: {
    'Option1': { type: 'object', properties: { a: { type: 'string' } } },
    'Option2': { type: 'object', properties: { b: { type: 'string' } } },
  },
  title: 'TestAnyOptions',
  type: 'object',
  additionalProperties: { anyOf: [ { '$ref': '#/definitions/Option1' }, { '$ref': '#/definitions/Option2' } ] }
}