import { JSONSchema7 } from '../../src';

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