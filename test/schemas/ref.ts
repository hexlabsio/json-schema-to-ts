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