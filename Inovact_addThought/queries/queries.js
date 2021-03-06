// Requires Cognito_sub
const getUser = `query getUser($cognito_sub: String_comparison_exp) {
  user(where: { cognito_sub: $cognito_sub }) {
  id,
  user_name,
  bio,
  avatar,
  phone_number,
  email_id,
  designation,
  organization,
  organizational_role,
  university,
  graduation_year,
  journey_start_date,
  years_of_professional_experience,
  created_at,
  updated_at,
  first_name,
  last_name,
  role,
  cognito_sub,
  admin,
  profile_complete
  }
}
`;

const getThought = `query getThought($id: Int) {
  thoughts(where: {id: {_eq: $id}}) {
    id
    user_id
   thought
    thought_comments {
      id
      created_at
      updated_at
      user_id
    }
    user {
      id
      avatar
      first_name
      last_name
      role
    }
  }
}
`;

module.exports = {
  getUser,
  getThought,
};
