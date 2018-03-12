// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function clipPlannersRoute(app, reportsModule, req, res)
{
  const morModule = app[reportsModule.config.morId];

  const result = {
    users: {},
    mrps: {}
  };

  if (!morModule)
  {
    return res.json(result);
  }

  const users = {};

  morModule.state.users.forEach(user => users[user._id] = user);

  morModule.state.sections.forEach(section =>
  {
    section.mrps.forEach(mrp =>
    {
      const prodFunction = mrp.prodFunctions.find(prodFunction => prodFunction._id === 'production-planner');

      if (!prodFunction)
      {
        return;
      }

      if (!result.mrps[mrp._id])
      {
        result.mrps[mrp._id] = [];
      }

      prodFunction.users.forEach(userId =>
      {
        result.users[userId] = users[userId];
        result.mrps[mrp._id].push(userId);
      });
    });
  });

  res.json(result);
};
