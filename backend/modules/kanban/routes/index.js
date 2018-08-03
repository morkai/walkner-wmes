// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const os = require('os');
const multer = require('multer');
const importSapRoute = require('./importSap');
const importEntriesRoute = require('./importEntries');
const importComponentsRoute = require('./importComponents');
const stateRoute = require('./state');
const readUsersTableViewRoute = require('./readUsersTableView');
const updateEntryRoute = require('./updateEntry');
const startPrintJobRoute = require('./startPrintJob');
const ignorePrintJobRoute = require('./ignorePrintJob');
const restorePrintJobRoute = require('./restorePrintJob');
const uploadContainerImageRoute = require('./uploadContainerImage');
const sendContainerImageRoute = require('./sendContainerImage');

module.exports = function setUpKanbanRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const settingsModule = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];
  const KanbanEntry = mongoose.model('KanbanEntry');
  const KanbanComponent = mongoose.model('KanbanComponent');
  const KanbanSupplyArea = mongoose.model('KanbanSupplyArea');
  const KanbanContainer = mongoose.model('KanbanContainer');
  const KanbanTableView = mongoose.model('KanbanTableView');
  const KanbanPrintQueue = mongoose.model('KanbanPrintQueue');

  const canView = userModule.auth('USER');
  const canManage = userModule.auth('KANBAN:MANAGE');
  const canPrint = userModule.auth('KANBAN:MANAGE', 'KANBAN:PRINT');
  const canImport = userModule.auth('KANBAN:MANAGE', 'FN:process-engineer');
  const canUpdate = userModule.auth('KANBAN:MANAGE', 'FN:process-engineer', 'FN:leader', 'FN:master');

  // Import
  express.post('/kanban/import/sap', canImport, importSapRoute.bind(null, app, module));
  express.post(
    '/kanban/import/entries',
    canImport,
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 1,
        fileSize: 2 * 1024 * 1024
      }
    }).single('file'),
    importEntriesRoute.bind(null, app, module)
  );
  express.post(
    '/kanban/import/components',
    canImport,
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 1,
        fileSize: 2 * 1024 * 1024
      }
    }).single('file'),
    importComponentsRoute.bind(null, app, module)
  );

  // State
  express.get('/kanban/state', canView, stateRoute.bind(null, app, module));

  // Entries
  express.get('/kanban/entries', canView, express.crud.browseRoute.bind(null, app, KanbanEntry));
  express.get('/kanban/entries/:id', canView, express.crud.readRoute.bind(null, app, KanbanEntry));
  express.put('/kanban/entries/:id', canManage, express.crud.editRoute.bind(null, app, KanbanEntry));
  express.patch('/kanban/entries/:id', canUpdate, updateEntryRoute.bind(null, app, module));

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
  express.get('/kanban/containers/:id.jpg', canView, sendContainerImageRoute.bind(null, app, module));
  express.post(
    '/kanban/containers/:id.jpg',
    canManage,
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024
      }
    }).single('image'),
    uploadContainerImageRoute.bind(null, app, module)
  );
  express.get('/kanban/containers/:id', canView, express.crud.readRoute.bind(null, app, KanbanContainer));
  express.put('/kanban/containers/:id', canManage, express.crud.editRoute.bind(null, app, KanbanContainer));
  express.delete('/kanban/containers/:id', canManage, express.crud.deleteRoute.bind(null, app, KanbanContainer));

  // Table views
  express.get('/kanban/tableViews', canView, express.crud.browseRoute.bind(null, app, KanbanTableView));
  express.post('/kanban/tableViews', canView, express.crud.addRoute.bind(null, app, KanbanTableView));
  express.get('/kanban/tableViews/mine', canView, readUsersTableViewRoute.bind(null, app, module));
  express.get('/kanban/tableViews/:id', canView, express.crud.readRoute.bind(null, app, KanbanTableView));
  express.put('/kanban/tableViews/:id', canView, express.crud.editRoute.bind(null, app, KanbanTableView));
  express.delete('/kanban/tableViews/:id', canView, express.crud.deleteRoute.bind(null, app, KanbanTableView));

  // Print queues
  express.get('/kanban/printQueues', canView, express.crud.browseRoute.bind(null, app, KanbanPrintQueue));
  express.post(
    '/kanban/printQueues',
    canUpdate,
    preparePrintQueue,
    express.crud.addRoute.bind(null, app, KanbanPrintQueue)
  );
  express.get('/kanban/printQueues/:id', canView, express.crud.readRoute.bind(null, app, KanbanPrintQueue));
  express.put('/kanban/printQueues/:id', canUpdate, express.crud.editRoute.bind(null, app, KanbanPrintQueue));
  express.delete('/kanban/printQueues/:id', canPrint, express.crud.deleteRoute.bind(null, app, KanbanPrintQueue));
  express.post('/kanban/printQueues;print', canPrint, startPrintJobRoute.bind(null, app, module));
  express.post('/kanban/printQueues;ignore', canPrint, ignorePrintJobRoute.bind(null, app, module));
  express.post('/kanban/printQueues;restore', canPrint, restorePrintJobRoute.bind(null, app, module));

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

  function preparePrintQueue(req, res, next)
  {
    req.body.createdAt = new Date();
    req.body.creator = userModule.createUserInfo(req.session.user, req);

    next();
  }
};