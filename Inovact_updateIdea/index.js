const axios = require('axios');

exports.handler = (events, context, callback) => {
  const query = `
    mutation updateIdea($id: Int_comparison_exp, $changes: user_set_input) {
      update_idea(where: { id: $id }, _set: $changes) {
        returning {
          id
        }
      }
    }
  `;

  let variables = {
    id: {
      _eq: events.id,
    },
    changes: {},
  };

  if (events.url) variables['changes']['url'] = events.url;
  if (events.caption) variables['changes']['caption'] = events.caption;
  if (events.description)
    variables['changes']['description'] = events.description;
  if (events.title) variables['changes']['title'] = events.title;

  axios
    .post(
      process.env.HASURA_API,
      { query, variables },
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        },
      }
    )
    .then(res => {
      callback(null, res.data);
    })
    .catch(err => {
      callback(err);
    });
};
