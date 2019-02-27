const {responser, mapResponse} = require('../../../helpers/utils');

const registerUser = async req => {
  const user = req.swagger.params.user.value;
  return mapResponse(
    'docs',
    {docs: user}
  );
};

const loginUser = async req => {
  const user = req.swagger.params.user.value;
  return mapResponse(
    'docs',
    {docs: user}
  );
};

module.exports = {
  registerUser: responser(registerUser),
  loginUser: responser(loginUser)
};
