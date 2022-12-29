import { JSONSchema7 } from '../../src';

export const ref: JSONSchema7 = {
  title: 'TestRef',
  definitions: {
    xyz: { type: 'string' }
  },
  type: 'object',
  required: ['a'],
  properties: {
    a: { $ref: '#/definitions/xyz' }
  }
}

export const refObject: JSONSchema7 = {
  title: 'TestRefObject',
  definitions: {
    xyz: { type: 'object', properties: { x: { type: 'string' }} }
  },
  type: 'object',
  required: ['a'],
  properties: {
    a: { $ref: '#/definitions/xyz' }
  }
}

export const refArray: JSONSchema7 = {
  title: 'TestRefArray',
  definitions: {
    xyz: { type: 'array', items: { type: 'string' } }
  },
  type: 'object',
  required: ['a'],
  properties: {
    a: { $ref: '#/definitions/xyz' }
  }
}