// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  statePath: 'mor.json'
};

exports.start = function startMorModule(app, module, done)
{
  const USER_FIELDS = {
    firstName: 1,
    lastName: 1,
    personellId: 1,
    prodFunction: 1,
    orgUnitType: 1,
    orgUnitId: 1,
    email: 1,
    mobile: 1,
    working: 1,
    kdPosition: 1
  };
  const STATE_UPDATE_ACTIONS = {
    addWatch,
    removeWatch,
    editWatch,
    addMrp,
    removeMrp,
    editMrp
  };

  let saveTimer = null;
  let saveAgain = false;
  let saveInProgress = false;

  module.state = {
    settings: {},
    users: [],
    watch: [],
    divisions: []
  };

  module.updateState = updateState;

  module.saveState = saveState;

  module.reloadState = reloadState;

  module.reloadUsers = reloadUsers;

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.settingsId
    ],
    () => reloadState(false, done)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.expressId,
      module.config.userId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.broker.subscribe('users.edited', handleUserEdited);
  app.broker.subscribe('users.deleted', handleUserDeleted);
  app.broker.subscribe('settings.updated.mor.**', handleSettingUpdated);

  function updateState(action, params, instanceId, done)
  {
    if (STATE_UPDATE_ACTIONS[action])
    {
      STATE_UPDATE_ACTIONS[action](params, (err, params) =>
      {
        if (!err)
        {
          app.broker.publish('mor.updated', {instanceId, action, params});

          saveState();
        }

        done(err);
      });
    }
    else
    {
      done(app.createError('UNKNOWN_ACTION', 400));
    }
  }

  function saveState()
  {
    if (saveTimer)
    {
      return;
    }

    if (saveInProgress)
    {
      saveAgain = true;

      return;
    }

    saveTimer = setTimeout(doSaveState, 1000);
  }

  function doSaveState()
  {
    saveTimer = null;
    saveInProgress = true;

    fs.writeFile(module.config.statePath, JSON.stringify(_.pick(module.state, 'watch', 'divisions')), function(err)
    {
      if (err)
      {
        module.error(`Failed to save the state file: ${err.message}`);
      }

      saveInProgress = false;

      if (saveAgain)
      {
        saveAgain = false;

        saveState();
      }
    });
  }

  function reloadState(publish, done)
  {
    step(
      function()
      {
        fs.readFile(module.config.statePath, 'utf8', this.parallel());

        app[module.config.settingsId].findValues('mor.', this.parallel());

        app[module.config.mongooseId].model('Division')
          .find({type: 'prod', deactivatedAt: null}, {_id: 1})
          .sort({_id: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, stateData, settings, divisions)
      {
        if (err)
        {
          module.warn(`Failed to reload the state: ${err.message}`);
        }

        if (stateData)
        {
          try
          {
            _.assign(module.state, JSON.parse(stateData));
          }
          catch (err)
          {
            module.warn(`Failed to parse the state file: ${err.message}`);
          }
        }

        _.forEach(divisions, division =>
        {
          if (!module.state.divisions.find(d => d._id === division._id))
          {
            module.state.divisions.push({
              _id: division._id,
              mrps: []
            });
          }
        });

        if (settings)
        {
          module.state.settings = settings;
        }

        reloadUsers(this.next());
      },
      function()
      {
        if (publish)
        {
          app.broker.publish('mor.updated', {action: 'reload'});
        }

        done();
      }
    );
  }

  function reloadUsers(done)
  {
    const userIds = {};

    module.state.watch.forEach(w => userIds[w.user] = 1);

    module.state.divisions.forEach(division =>
    {
      division.mrps.forEach(mrp =>
      {
        mrp.prodFunctions.forEach(prodFunction =>
        {
          prodFunction.users.forEach(u => userIds[u] = 1);
        });
      });
    });

    step(
      function()
      {
        const User = app[module.config.mongooseId].model('User');
        const conditions = {
          _id: {
            $in: Object.keys(userIds)
          }
        };

        User.find(conditions, USER_FIELDS).lean().exec(this.parallel());
        User.find({prodFunction: 'manager'}, USER_FIELDS).lean().exec(this.parallel());
      },
      function(err, users, managers)
      {
        if (users && managers)
        {
          managers.forEach(manager =>
          {
            const user = users.some(user => user._id.equals(manager._id));

            if (!user)
            {
              users.push(manager);
            }
          });

          module.state.users = users;
        }

        done(err);
      }
    );
  }

  function handleUserEdited(message)
  {
    const editedUser = message.model;
    const morUser = module.state.users.find(u => u._id.equals(editedUser._id));

    if (morUser)
    {
      _.assign(morUser, _.pick(editedUser, _.keys(USER_FIELDS)));
    }
  }

  function handleUserDeleted(message)
  {
    const deletedUserId = message.model._id.toString();
    const morUser = module.state.users.find(u => u._id.equals(deletedUserId));

    if (!morUser)
    {
      return;
    }

    if (module.state.watch.some(w => w.user === deletedUserId))
    {
      removeWatch({user: deletedUserId});
    }

    module.state.divisions.forEach(division =>
    {
      division.mrps.forEach(mrp =>
      {
        mrp.prodFunctions.forEach(prodFunction =>
        {
          if (prodFunction.users.some(u => u === deletedUserId))
          {
            editMrp({
              division: division._id,
              mrp: mrp._id,
              prodFunction: prodFunction._id,
              users: prodFunction.users.filter(u => u !== deletedUserId)
            });
          }
        });
      });
    });
  }

  function handleSettingUpdated(message)
  {
    module.state.settings[message._id.replace('mor.', '')] = message.value;
  }

  function addWatch(params, done)
  {
    const watch = module.state.watch.find(w => w.user === params.user);

    if (watch)
    {
      return done();
    }

    const user = module.state.users.find(u => u._id.equals(params.user));

    if (!user)
    {
      return done(app.createError('INVALID_USER', 400));
    }

    module.state.watch.push(_.pick(params, ['user', 'from', 'to']));

    done(null, params);
  }

  function removeWatch(params, done)
  {
    module.state.watch = module.state.watch.filter(w => w.user !== params.user);

    done(null, params);
  }

  function editWatch(params, done)
  {
    const watch = module.state.watch.find(w => w.user === params.user);

    if (!watch)
    {
      return done(app.createError('INVALID_USER', 400));
    }

    _.assign(watch, _.pick(params, ['from', 'to']));

    done(null, params);
  }

  function addMrp(params, done)
  {
    const division = module.state.divisions.find(d => d._id === params.division);

    if (!division)
    {
      return done();
    }

    const mrp = division.mrps.find(m => m._id === params.mrp);

    if (mrp)
    {
      return done();
    }

    division.mrps.push({
      _id: params.mrp,
      prodFunctions: []
    });

    done(null, params);
  }

  function removeMrp(params, done)
  {
    const division = module.state.divisions.find(d => d._id === params.division);

    if (!division)
    {
      return done();
    }

    const mrp = division.mrps.find(m => m._id === params.mrp);

    if (!mrp)
    {
      return done();
    }

    division.mrps = division.mrps.filter(m => m._id !== params.mrp);

    done(null, params);
  }

  function editMrp(params, done)
  {
    const division = module.state.divisions.find(d => d._id === params.division);

    if (!division)
    {
      return done(app.createError('INVALID_DIVISION', 400));
    }

    const mrp = division.mrps.find(m => m._id === params.mrp);

    if (!mrp)
    {
      return done(app.createError('INVALID_MRP', 400));
    }

    let prodFunction = mrp.prodFunctions.find(p => p._id === params.prodFunction);

    if (!prodFunction)
    {
      prodFunction = {
        _id: params.prodFunction,
        users: []
      };

      mrp.prodFunctions.push(prodFunction);
    }

    app[module.config.mongooseId]
      .model('User')
      .find({_id: {$in: params.users}}, USER_FIELDS)
      .lean()
      .exec(function(err, list)
      {
        if (err)
        {
          return done(err);
        }

        const map = {};

        list.forEach(user =>
        {
          if (!module.state.users.find(u => u._id.equals(user._id)))
          {
            module.state.users.push(user);
          }

          map[user._id] = user;
        });

        prodFunction.users = _.map(params.users, u => map[u]).filter(u => !!u).map(u => u._id.toHexString());

        done(null, _.assign({}, params, {users: prodFunction.users.map(u => map[u])}));
      });
  }
};
