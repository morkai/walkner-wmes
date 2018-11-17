// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function readUsersTableViewRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const KanbanTableView = mongoose.model('KanbanTableView');

  const user = userModule.createUserInfo(req.session.user, req);

  if (user.id)
  {
    user.id = user.id.toString();
  }

  step(
    function()
    {
      KanbanTableView
        .findOne({'user.id': user.id, default: true})
        .lean()
        .exec(this.next());
    },
    function(err, tableView)
    {
      if (err)
      {
        return this.skip(app.createError(`Failed to find user's table view: ${err.message}`));
      }

      if (tableView)
      {
        return this.skip(null, tableView);
      }

      KanbanTableView
        .findOne({user: null, default: true})
        .lean()
        .exec(this.next());
    },
    function(err, tableView)
    {
      if (err)
      {
        return this.skip(app.createError(`Failed to find global table view: ${err.message}`));
      }

      if (tableView)
      {
        delete tableView._id;
      }
      else
      {
        tableView = {
          default: true,
          columns: {},
          filterMode: 'and',
          filters: {},
          sort: {_id: 1}
        };
      }

      tableView.user = user;
      tableView.name = 'mine';

      new KanbanTableView(tableView).save(this.next());
    },
    function(err, tableView)
    {
      if (err)
      {
        return next(err);
      }

      res.json(tableView);
    }
  );
};
