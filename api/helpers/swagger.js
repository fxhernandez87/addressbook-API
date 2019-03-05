const responseDescriptions = {
  '200': 'Success',
  '201': 'Created',
  '400': 'Bad request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Item not found'
};
const responseDefaultRefs = {
  '200': '#/definitions/SuccessResponse',
  '201': '#/definitions/SuccessResponse',
  '400': '#/definitions/Error',
  '401': '#/definitions/Error',
  '403': '#/definitions/Error',
  '404': '#/definitions/Error'
};
const responseMaker = (_code, ref, obj) => {
  const code = _code.toString();
  const description = responseDescriptions[code] || 'Description not found';
  const $ref = ref || responseDefaultRefs[_code];
  return {
    [code]: {
      description,
      schema: obj || {$ref}
    }
  };
};

const jwtSecurity = [{jwtAuth: []}];

module.exports = {
  responseMaker,
  jwtSecurity
};
