// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function setUpKanbanState(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const KanbanEntry = mongoose.model('KanbanEntry');
  const KanbanComponent = mongoose.model('KanbanComponent');
  const KanbanSupplyArea = mongoose.model('KanbanSupplyArea');

  const maps = {
    supplyAreas: {},
    components: {},
    entries: {}
  };
  const types = Object.keys(maps);
  const lists = {};
  const json = {};
  let updatedAt = new Date();

  module.getState = getState;

  types.forEach(type =>
  {
    lists[type] = null;
    json[type] = '[]';

    app.broker.subscribe(`kanban.${type}.*`, () => lists[type] = null);
  });

  app.broker.subscribe('kanban.import.success', message =>
  {
    if (message.componentCount)
    {
      lists.components = null;
    }

    if (message.entryCount)
    {
      lists.entries = null;
    }
  });

  app.broker.subscribe('messenger.client.connected', message =>
  {
    if (message.socketType === 'sub' && message.moduleName === module.config.sapImporterMessengerId)
    {
      lists.components = null;
      lists.entries = null;
    }
  });

  function load(done)
  {
    step(
      function()
      {
        if (lists.supplyAreas)
        {
          setImmediate(this.group(), null, null);
        }
        else
        {
          KanbanSupplyArea.find({}).lean().exec(this.group());
        }

        if (lists.components)
        {
          setImmediate(this.group(), null, null);
        }
        else
        {
          KanbanComponent.find({}, {changes: 0}).lean().exec(this.group());
        }

        if (lists.entries)
        {
          setImmediate(this.group(), null, null);
        }
        else
        {
          KanbanEntry.find({}, {changes: 0}).lean().exec(this.group());
        }
      },
      function(err, results)
      {
        if (err)
        {
          module.error(`Failed to load state: ${err.message}`);
        }

        types.forEach((type, i) =>
        {
          const docs = results[i];

          if (docs)
          {
            lists[type] = docs;
            json[type] = null;
            maps[type] = {};

            docs.forEach(d => maps[type][d._id] = d);
          }

          if (!json[type])
          {
            json[type] = JSON.stringify(docs);
          }
        });

        updatedAt = new Date();

        if (done)
        {
          done(err);
        }
      }
    );
  }

  function getState(done)
  {
    let reload = false;

    types.forEach(type =>
    {
      if (lists[type] === null)
      {
        reload = true;
      }
    });

    if (!reload)
    {
      return setImmediate(done, null, {
        maps,
        lists,
        json,
        updatedAt
      });
    }

    load(err =>
    {
      if (err)
      {
        return done(err);
      }

      getState(done);
    });
  }
};
