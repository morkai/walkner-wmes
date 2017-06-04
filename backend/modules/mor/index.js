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
    addSection,
    removeSection,
    editSection,
    moveSection,
    addWatch,
    removeWatch,
    editWatch,
    addMrp,
    removeMrp,
    editMrp,
    editProdFunction
  };

  let saveTimer = null;
  let saveAgain = false;
  let saveInProgress = false;

  module.state = {
    settings: {},
    users: [],
    globalProdFunctions: [],
    sections: []
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

    const stateJson = JSON.stringify(_.pick(module.state, 'globalProdFunctions', 'sections'), null, 2);

    fs.writeFile(module.config.statePath, stateJson, function(err)
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
      },
      function(err, stateData, settings)
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

  function collectUserIds()
  {
    const userIds = {};

    module.state.globalProdFunctions.forEach(prodFunction =>
    {
      prodFunction.users.forEach(u => userIds[u] = 1);
    });

    module.state.sections.forEach(section =>
    {
      section.watch.forEach(watch => userIds[watch.user] = 1);

      section.commonProdFunctions.forEach(prodFunction =>
      {
        prodFunction.users.forEach(u => userIds[u] = 1);
      });

      section.mrps.forEach(mrp =>
      {
        mrp.iptCheckRecipients.forEach(u => userIds[u] = 1);

        mrp.prodFunctions.forEach(prodFunction =>
        {
          prodFunction.users.forEach(u => userIds[u] = 1);
        });
      });
    });

    return Object.keys(userIds);
  }

  function reloadUsers(done)
  {
    step(
      function()
      {
        const User = app[module.config.mongooseId].model('User');
        const conditions = {
          _id: {
            $in: collectUserIds()
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

  function addSection(params, done)
  {
    let section = module.state.sections.find(s => s._id === params._id);

    if (section)
    {
      return done(app.createError('ALREADY_EXISTS'), 400);
    }

    section = _.defaults(_.pick(params, ['_id', 'name', 'watchEnabled', 'mrpsEnabled', 'prodFunctions']), {
      _id: '',
      name: '?',
      watchEnabled: true,
      mrpsEnabled: true,
      prodFunctions: []
    });

    module.state.sections.push(section);

    done(null, params);
  }

  function removeSection(params, done)
  {
    const section = module.state.sections.find(s => s._id === params.section);

    if (!section)
    {
      return done(app.createError('NOT_FOUND'), 400);
    }

    module.state.sections = module.state.sections.filter(s => s !== section);

    done(null, params);
  }

  function editSection(params, done)
  {
    const section = module.state.sections.find(s => s._id === params._id);

    if (!section)
    {
      return done(app.createError('NOT_FOUND'), 400);
    }

    _.assign(section, _.pick(params, [
      'name', 'watchEnabled', 'mrpsEnabled', 'prodFunctions'
    ]));

    done(null, params);
  }

  function moveSection(params, done)
  {
    const sections = module.state.sections;
    const sourceSection = sections.find(s => s._id === params.source);
    const targetSection = sections.find(s => s._id === params.target);

    if (sourceSection === targetSection || !sourceSection || !targetSection)
    {
      return done(app.createError('INVALID_SECTION'), 400);
    }

    sections.splice(sections.indexOf(sourceSection), 1);
    sections.splice(sections.indexOf(targetSection) + (params.position === 'after' ? 1 : 0), 0, sourceSection);

    done(null, params);
  }

  function addWatch(params, done)
  {
    const section = module.state.sections.find(s => s._id === params.section);

    if (!section)
    {
      return done(app.createError('INVALID_SECTION'), 400);
    }

    const user = module.state.users.find(u => u._id.equals(params.user));

    if (!user)
    {
      return done(app.createError('INVALID_USER', 400));
    }

    let watch = section.watch.find(w => w.user === params.user);

    if (watch)
    {
      return done(app.createError('ALREADY_EXISTS', 400));
    }

    watch = _.defaults(_.pick(params, ['user', 'days', 'from', 'to']), {
      user: '',
      days: [0, 1, 2, 3, 4, 5, 6],
      from: '06:00',
      to: '06:00'
    });

    section.watch.push(watch);

    done(null, params);
  }

  function removeWatch(params, done)
  {
    const section = module.state.sections.find(s => s._id === params.section);

    if (!section)
    {
      return done(app.createError('INVALID_SECTION'), 400);
    }

    const watch = section.watch.find(w => w.user === params.user);

    if (!watch)
    {
      return done(app.createError('NOT_FOUND', 400));
    }

    section.watch = section.watch.filter(w => w !== watch);

    done(null, params);
  }

  function editWatch(params, done)
  {
    const section = module.state.sections.find(s => s._id === params.section);

    if (!section)
    {
      return done(app.createError('INVALID_SECTION'), 400);
    }

    const watch = section.watch.find(w => w.user === params.user);

    if (!watch)
    {
      return done(app.createError('NOT_FOUND', 400));
    }

    _.assign(watch, _.pick(params, ['days', 'from', 'to']));

    done(null, params);
  }

  function addMrp(params, done)
  {
    const section = module.state.sections.find(s => s._id === params.section);

    if (!section)
    {
      return done(app.createError('INVALID_SECTION'), 400);
    }

    let mrp = section.mrps.find(m => m._id === params.mrp);

    if (mrp)
    {
      return done(app.createError('ALREADY_EXISTS', 400));
    }

    loadUsers(params.iptCheckRecipients, function(err, iptCheckRecipients)
    {
      if (err)
      {
        return done(err);
      }

      section.mrps.push({
        _id: params.mrp,
        description: params.description || '',
        iptCheck: !!params.iptCheck,
        iptCheckRecipients: iptCheckRecipients.map(u => u._id.toHexString()),
        prodFunctions: []
      });

      done(null, _.assign(params, {iptCheckRecipients}));
    });
  }

  function removeMrp(params, done)
  {
    const section = module.state.sections.find(d => d._id === params.section);

    if (!section)
    {
      return done();
    }

    const mrp = section.mrps.find(m => m._id === params.mrp);

    if (!mrp)
    {
      return done();
    }

    section.mrps = section.mrps.filter(m => m._id !== params.mrp);

    done(null, params);
  }

  function editMrp(params, done)
  {
    const section = module.state.sections.find(s => s._id === params.section);

    if (!section)
    {
      return done(app.createError('INVALID_SECTION'), 400);
    }

    const mrp = section.mrps.find(m => m._id === params.mrp);

    if (!mrp)
    {
      return done(app.createError('NOT_FOUND'), 400);
    }

    loadUsers(params.iptCheckRecipients, function(err, iptCheckRecipients)
    {
      if (err)
      {
        return done(err);
      }

      mrp.description = params.description || '';
      mrp.iptCheck = !!params.iptCheck;
      mrp.iptCheckRecipients = iptCheckRecipients.map(u => u._id.toHexString());

      done(null, _.assign(params, {iptCheckRecipients}));
    });
  }

  function editProdFunction(params, done)
  {
    let prodFunctions = null;

    if (params.section === null)
    {
      prodFunctions = module.state.globalProdFunctions;
    }
    else if (params.mrp === null)
    {
      const section = module.state.sections.find(s => s._id === params.section);

      if (!section)
      {
        return done(app.createError('INVALID_SECTION', 400));
      }

      prodFunctions = section.commonProdFunctions;
    }
    else
    {
      const section = module.state.sections.find(s => s._id === params.section);

      if (!section)
      {
        return done(app.createError('INVALID_SECTION', 400));
      }

      const mrp = section.mrps.find(m => m._id === params.mrp);

      if (!section)
      {
        return done(app.createError('INVALID_MRP', 400));
      }

      prodFunctions = mrp.prodFunctions;
    }

    let prodFunction = prodFunctions.find(p => p._id === params.prodFunction);

    if (!prodFunction)
    {
      prodFunction = {
        _id: params.prodFunction,
        users: []
      };

      prodFunctions.push(prodFunction);
    }

    loadUsers(params.users, function(err, users)
    {
      if (err)
      {
        return done(err);
      }

      prodFunction.users = users.map(u => u._id.toHexString());

      done(null, _.assign(params, {users}));
    });
  }

  function loadUsers(userIds, done)
  {
    app[module.config.mongooseId]
      .model('User')
      .find({_id: {$in: userIds}}, USER_FIELDS)
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

        done(null, userIds.map(u => map[u]).filter(u => !!u));
      });
  }
};
