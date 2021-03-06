const { query: Hasura } = require('./utils/hasura');
const {
  addTeam,
  addInvitations,
  addRoles,
  addMembers,
  addTeamTags,
  addSkills,
} = require('./queries/mutations');
const { getUsersFromEmailId, getUserId } = require('./queries/queries');

exports.handler = async (event, context, callback) => {
  const name =
    typeof event.name == 'string' && event.name.length != 0
      ? event.name
      : false;
  const avatar =
    typeof event.avatar == 'string' && event.avatar.length != 0
      ? event.avatar
      : 'https://static.vecteezy.com/system/resources/thumbnails/000/550/535/small/user_icon_007.jpg';
  const description =
    typeof event.description == 'string' && event.description.length != 0
      ? event.description
      : '';
  const tags = event.tags instanceof Array ? event.tags : false;
  const members = event.members instanceof Array ? event.members : false;

  // Find user id
  const cognito_sub = event.cognito_sub;
  const response5 = await Hasura(getUserId, {
    cognito_sub: { _eq: cognito_sub },
  });

  if (!response5.success)
    return callback(null, {
      success: false,
      errorCode: 'InternalServerError',
      errorMessage: 'Failed to find login user',
      data: null,
    });

  // Save team to DB
  const teamData = {
    name,
    creator_id: response5.result.data.user[0].id,
    description,
    avatar,
  };

  const response1 = await Hasura(addTeam, teamData);

  if (!response1.success)
    return callback(null, {
      success: false,
      errorCode: 'InternalServerError',
      errorMessage: 'Failed to save team to db.',
      data: null,
    });

  const team = response1.result.data.insert_team.returning[0];

  // Add current user as a member with admin: true
  let memberObjects = {
    objects: [
      {
        user_id: response5.result.data.user[0].id,
        team_id: team.id,
        admin: true,
      },
    ],
  };

  // Add members
  for (const member of members) {
    memberObjects.objects.push({
      user_id: member.user_id,
      team_id: team.id,
      role: member.role,
    });
  }

  const response6 = await Hasura(addMembers, memberObjects);

  if (!response6.success)
    return callback(null, {
      success: false,
      errorCode: 'InternalServerError',
      errorMessage: 'Failed to save members',
      data: null,
    });

  // // Save roles required for the team
  // role_if: if (roles.length) {
  //   const roleObjects = {
  //     objects: roles.map(role => {
  //       return {
  //         role_id: role.id,
  //         team_id: team.id,
  //       };
  //     }),
  //   };

  //   // @TODO Handle failure of roles insertion
  //   const response4 = await Hasura(addRoles, roleObjects);

  //   // Dont try to save skills if failed to save roles
  //   if (!response4.success) break role_if;

  //   // Save the skills required for each role
  //   let objects = [];
  //   for (const i in roles) {
  //     for (const j in roles[i].skills) {
  //       objects.push({
  //         role_requirement_id:
  //           response4.result.data.insert_team_role_requirements.returning[i]
  //             .id,
  //         skill_id: roles[i].skills[j].id,
  //         proficiency: roles[i].skills[j].proficiency,
  //       });
  //     }
  //   }

  //   const skillObjects = {
  //     objects,
  //   };

  //   // @TODO Handle failue of skills insertion
  //   const response5 = await Hasura(addSkills, skillObjects);
  // }

  // Save the tags associated with the team
  if (tags.length) {
    const tagsData = {
      objects: tags.map(tag_name => {
        return {
          hashtag: {
            data: {
              name: tag_name.toLowerCase(),
            },
            on_conflict: {
              constraint: 'hashtag_tag_name_key',
              update_columns: 'name',
            },
          },
          team_id: team.id,
        };
      }),
    };

    // @TODO Fallback if tags fail to be inserted
    const response4 = await Hasura(addTeamTags, tagsData);
  }

  callback(null, {
    success: true,
    errorCode: '',
    errorMessage: '',
    data: null,
  });

  // @TODO Handle emails of non existing users
  // @TODO Send invites over mail using emails of existing users
};
