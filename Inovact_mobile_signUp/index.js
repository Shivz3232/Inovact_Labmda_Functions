const { signUp } = require('./utils/cognito');
const { query: Hasura } = require('./utils/hasura');
const { getUser } = require('./queries/queries');

exports.handler = async (events, context, callback) => {
  const response = await Hasura(getUser, { email: events.email });

  if (!response.success)
    return callback(null, {
      success: false,
      errorCode: 'InternalServerError',
      errorMessage: 'Failed to check if email exists',
    });

  if (response.result.data.user.length != 0)
    return callback(null, {
      success: false,
      errorCode: 'EmailExistsException',
      errorMessage: 'Account with this email already exists',
    });

  const result = await signUp(
    events.username,
    events.email,
    events.password
  ).catch(err => {
    return err;
  });

  callback(null, result);
};
