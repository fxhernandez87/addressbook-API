const responseDescriptions = {
  '200': 'Success',
  '400': 'Bad request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Item not found',
  '422': 'Invalid Schema'
};
const responseDefaultRefs = {
  '200': '#/definitions/SuccessResponse',
  '400': '#/definitions/ErrorResponse',
  '401': '#/definitions/ErrorResponse',
  '403': '#/definitions/ErrorResponse',
  '404': '#/definitions/ErrorResponse',
  '422': '#/definitions/ErrorResponse'
};
const responseMaker = (_code, ref) => {
  const code = _code.toString();
  const description = responseDescriptions[code] || 'Description not found';
  const $ref = ref || responseDefaultRefs[_code];
  return {
    [code]: {
      description,
      schema: {$ref}
    }
  };
};

const jwtSecurity = [{jwtAuth: []}];

module.exports = {
  responseMaker,
  jwtSecurity,
};
