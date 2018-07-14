// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const fresh = require('fresh');

module.exports = function setUpKanbanRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const settingsModule = app[module.config.settingsId];
  const KanbanEntry = mongoose.model('KanbanEntry');
  const KanbanComponent = mongoose.model('KanbanComponent');
  const KanbanSupplyArea = mongoose.model('KanbanSupplyArea');
  const KanbanContainer = mongoose.model('KanbanContainer');
  const KanbanTableView = mongoose.model('KanbanTableView');

  const canView = userModule.auth('USER');
  const canManage = userModule.auth('KANBAN:MANAGE');
  const canImport = userModule.auth('KANBAN:MANAGE', 'FN:process-engineer');
  const canUpdate = userModule.auth('KANBAN:MANAGE', 'FN:process-engineer', 'FN:leader');

  const updateLocks = new Map();

  // Import
  express.post('/kanban;import', canImport, importRoute);

  // State
  express.get('/kanban/state', canView, stateRoute);

  // Entries
  express.get('/kanban/entries', canView, express.crud.browseRoute.bind(null, app, KanbanEntry));
  express.get('/kanban/entries/:id', canView, express.crud.readRoute.bind(null, app, KanbanEntry));
  express.put('/kanban/entries/:id', canManage, express.crud.editRoute.bind(null, app, KanbanEntry));
  express.patch('/kanban/entries/:id', canUpdate, updateEntryRoute);

  // Components
  express.get('/kanban/components', canView, express.crud.browseRoute.bind(null, app, KanbanComponent));
  express.get('/kanban/components/:id', canView, express.crud.readRoute.bind(null, app, KanbanComponent));

  // Supply Areas
  express.get('/kanban/supplyAreas', canView, express.crud.browseRoute.bind(null, app, KanbanSupplyArea));
  express.post('/kanban/supplyAreas', canManage, express.crud.addRoute.bind(null, app, KanbanSupplyArea));
  express.get('/kanban/supplyAreas/:id', canView, express.crud.readRoute.bind(null, app, KanbanSupplyArea));
  express.put('/kanban/supplyAreas/:id', canManage, express.crud.editRoute.bind(null, app, KanbanSupplyArea));
  express.delete('/kanban/supplyAreas/:id', canManage, express.crud.deleteRoute.bind(null, app, KanbanSupplyArea));

  // Containers
  express.get('/kanban/containers', canView, express.crud.browseRoute.bind(null, app, KanbanContainer));
  express.post('/kanban/containers', canManage, express.crud.addRoute.bind(null, app, KanbanContainer));
  express.get('/kanban/containers/:id', canView, express.crud.readRoute.bind(null, app, KanbanContainer));
  express.put('/kanban/containers/:id', canManage, express.crud.editRoute.bind(null, app, KanbanContainer));
  express.delete('/kanban/containers/:id', canManage, express.crud.deleteRoute.bind(null, app, KanbanContainer));

  // Table views
  express.get('/kanban/tableViews', canView, express.crud.browseRoute.bind(null, app, KanbanTableView));
  express.post('/kanban/tableViews', canView, express.crud.addRoute.bind(null, app, KanbanTableView));
  express.get('/kanban/tableViews/mine', canView, readUsersTableViewRoute);
  express.get('/kanban/tableViews/:id', canView, express.crud.readRoute.bind(null, app, KanbanTableView));
  express.put('/kanban/tableViews/:id', canView, express.crud.editRoute.bind(null, app, KanbanTableView));
  express.delete('/kanban/tableViews/:id', canView, express.crud.deleteRoute.bind(null, app, KanbanTableView));

  // Settings
  express.get(
    '/kanban/settings',
    canView,
    (req, res, next) =>
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^kanban\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settingsModule.Setting)
  );
  express.put('/kanban/settings/:id', canManage, settingsModule.updateRoute);

  function stateRoute(req, res, next)
  {
    module.getState((err, state) =>
    {
      if (err)
      {
        return next(err);
      }

      const headers = {
        'content-type': 'application/json',
        'last-modified': state.updatedAt.toUTCString(),
        'etag': `"${state.updatedAt.getTime().toString(36)}"`,
        'cache-control': 'private, must-revalidate'
      };

      res.set(headers);

      if (fresh(req.headers, headers))
      {
        return res.sendStatus(304);
      }

      res.json(state.json);
    });
  }

  function importRoute(req, res, next)
  {
    const sapGuiModule = app[module.config.sapGuiId];

    if (!sapGuiModule)
    {
      return next(app.createError('Import feature is disabled.', 'DISABLED', 500));
    }

    if (module.importTimer)
    {
      return next(app.createError('Import in progress.', 'IN_PROGRESS', 400));
    }

    module.importTimer = app.timeout(15 * 60 * 1000, () => module.importTimer = null);

    step(
      function()
      {
        KanbanSupplyArea.find({}, {_id: 1}).lean().exec(this.parallel());

        settingsModule.findValues('kanban.', this.parallel());
      },
      function(err, supplyAreas, settings)
      {
        if (err)
        {
          return next(err);
        }

        const kanbanJob = {
          name: 'kanban',
          scriptTimeout: 10 * 60 * 1000,
          repeatOnFailure: 0,
          supplyAreas: supplyAreas.map(d => d._id),
          pkhdStorageType: settings['import.pkhdStorageType'] || '151',
          maktLanguage: settings['import.maktLanguage'] || 'PL',
          mlgtWarehouseNo: settings['import.mlgtWarehouseNo'] || 'KZ1',
          mlgtStorageType: settings['import.mlgtStorageType'] || '851',
          waitForResult: false
        };

        sapGuiModule.runRemoteJob(kanbanJob, err =>
        {
          if (err)
          {
            clearTimeout(module.importTimer);
            module.importTimer = null;

            return next(err);
          }

          res.sendStatus(204);
        });
      }
    );
  }

  function readUsersTableViewRoute(req, res, next)
  {
    const user = userModule.createUserInfo(req.session.user, req);

    if (user.id)
    {
      user.id = user.id.toString();
    }

    step(
      function()
      {
        KanbanTableView.findOne({'user.id': user.id, default: true}).lean().exec(this.next());
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

        KanbanTableView.findOne({user: null, default: true}).lean().exec(this.next());
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
  }

  function updateEntryRoute(req, res, next)
  {
    const entryId = parseInt(req.params.id, 10);
    const {property, arrayIndex, newValue} = req.body;
    const date = new Date();
    const user = userModule.createUserInfo(req.session.user, req);

    step(
      function()
      {
        lockUpdate(entryId, this.next());
      },
      function()
      {
        module.getState(this.parallel());

        KanbanEntry.findById(entryId, {changes: 1}).lean().exec(this.parallel());
      },
      function(err, state, entryChanges)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!entryChanges)
        {
          return this.skip(app.createError(`Entry changes not found: ${entryId}`, 'NOT_FOUND', 404));
        }

        const entry = state.maps.entries[entryId];

        if (!entry)
        {
          return this.skip(app.createError(`Entry not found: ${entryId}`, 'NOT_FOUND', 404));
        }

        let oldValue = entry[property];

        if (typeof oldValue === 'undefined')
        {
          return this.skip(app.createError(`Invalid property: ${property}`, 'INPUT', 400));
        }

        let updatePropertyDot = property;
        let updatePropertyUs = property;

        if (arrayIndex >= 0)
        {
          if (!Array.isArray(oldValue) || typeof oldValue[arrayIndex] === 'undefined')
          {
            return this.skip(app.createError(`Invalid array index: ${arrayIndex}`, 'INPUT', 400));
          }

          oldValue = oldValue[arrayIndex];
          updatePropertyDot += `.${arrayIndex}`;
          updatePropertyUs += `_${arrayIndex}`;
        }

        if (newValue === oldValue)
        {
          return this.skip();
        }

        const update = {
          $set: {
            [updatePropertyDot]: newValue,
            [`updates.${updatePropertyUs}`]: {
              date,
              user,
              data: oldValue
            }
          }
        };
        const {changes} = entryChanges;
        const lastChange = changes[changes.length - 1];

        if (lastChange
          && (date - lastChange.date) < 15 * 60 * 1000
          && String(lastChange.user.id) === String(user.id))
        {
          lastChange.date = date;
          lastChange.data[updatePropertyUs] = [
            typeof lastChange.data[updatePropertyUs] === 'undefined' ? oldValue : lastChange.data[updatePropertyUs][0],
            newValue
          ];

          update.$set[`changes.${changes.length - 1}`] = lastChange;
        }
        else
        {
          update.$push = {
            changes: {
              $each: [{
                date,
                user,
                data: {
                  [updatePropertyUs]: [oldValue, newValue]
                }
              }]
            }
          };
        }

        this.state = state;
        this.message = {
          entryId,
          property,
          arrayIndex,
          newValue,
          updates: update.$set[`updates.${updatePropertyUs}`]
        };

        KanbanEntry.collection.update({_id: entryId}, update, this.next());
      },
      function(err, result)
      {
        if (err)
        {
          return next(err);
        }

        res.sendStatus(204);

        if (result && result.result.nModified === 1)
        {
          this.state.lists.entries = null;

          app.broker.publish('kanban.entries.updated', this.message);
        }

        unlockUpdate(entryId);
      }
    );
  }

  function lockUpdate(entryId, done)
  {
    if (updateLocks.has(entryId))
    {
      updateLocks.get(entryId).push(done);
    }
    else
    {
      updateLocks.set(entryId, []);

      done();
    }
  }

  function unlockUpdate(entryId)
  {
    const entryLocks = updateLocks.get(entryId);

    if (!entryLocks)
    {
      return;
    }

    if (entryLocks.length === 0)
    {
      updateLocks.delete(entryId);
    }
    else
    {
      setImmediate(entryLocks.shift());
    }
  }
};
