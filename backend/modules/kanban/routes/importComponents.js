// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const xlsx = require('xlsx');
const fs = require('fs-extra');
const deepEqual = require('deep-equal');

module.exports = function importComponentsRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const KanbanComponent = mongoose.model('KanbanComponent');

  const updatedAt = new Date();
  const updater = userModule.createUserInfo(req.session.user, req);

  step(
    function()
    {
      fs.readFile(req.file.path, this.next());
    },
    function(err, buffer)
    {
      if (err)
      {
        return this.skip(err);
      }

      try
      {
        const workbook = xlsx.read(buffer, {
          type: 'buffer',
          cellFormula: false,
          cellHTML: false,
          cellText: false
        });

        this.sheet = workbook.Sheets[workbook.SheetNames[0]];

        setImmediate(this.next());
      }
      catch (err)
      {
        this.skip(err);
      }
    },
    function()
    {
      const rows = new Map();
      const addresses = {
        _id: null,
        newStorageBin: null
      };
      const range = xlsx.utils.decode_range(this.sheet['!ref']);

      for (let c = range.s.c; c <= range.e.c; ++c)
      {
        const col = xlsx.utils.encode_col(c);
        const row = range.s.r + 1;
        const cell = this.sheet[col + row];

        if (!cell)
        {
          continue;
        }

        const v = String(cell.v).toLowerCase().replace(/[^a-z0-9]+/g, '');

        if (v === '12nc')
        {
          addresses._id = col;
        }
        else if (/lok.*?nowa/.test(v))
        {
          addresses.newStorageBin = col;
        }
      }

      Object.keys(addresses).forEach(k =>
      {
        const address = addresses[k];

        if (address === null || (Array.isArray(address) && address.every(a => a === null)))
        {
          delete addresses[k];
        }
      });

      if (!addresses._id)
      {
        return this.skip(app.createError('Missing the 12NC column.', 'INPUT', 400));
      }

      const columns = Object.keys(addresses);

      if (columns.length === 1)
      {
        return this.skip(app.createError('Missing at least one data column.', 'INPUT', 400));
      }

      let emptyCount = 0;

      for (let r = range.s.r + 2; r <= range.e.r + 1; ++r)
      {
        const row = {};

        for (let c = 0; c < columns.length; ++c)
        {
          const column = columns[c];
          const address = addresses[column];

          if (Array.isArray(address))
          {
            if (!Array.isArray(row[column]))
            {
              row[column] = address.map(() => null);
            }

            for (let i = 0; i < address.length; ++i)
            {
              const cell = this.sheet[address[i] + r];

              row[column][i] = parseCellValue(column, cell);
            }
          }
          else
          {
            const cell = this.sheet[address + r];

            row[column] = parseCellValue(column, cell);
          }
        }

        emptyCount = row._id ? 0 : (emptyCount + 1);

        if (emptyCount >= 5)
        {
          break;
        }

        rows.set(row._id, row);
      }

      this.columns = columns;
      this.rows = rows;
      this.sheet = null;

      setImmediate(this.next());
    },
    function()
    {
      const columns = {};

      this.columns.forEach(c => columns[c] = 1);

      KanbanComponent
        .find({_id: {$in: Array.from(this.rows.keys())}}, columns)
        .lean()
        .exec(this.next());
    },
    function(err, entries)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.message = {
        entryCount: 0,
        componentCount: 0,
        updatedAt
      };

      importNext(this.message, entries, this.rows, this.columns, this.next());
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      app.broker.publish('kanban.import.success', this.message);

      fs.unlink(req.file.path, () => {});

      res.sendStatus(204);
    }
  );

  function parseCellValue(column, cell)
  {
    switch (column)
    {
      case '_id':
        return cell && cell.v ? String(cell.v) : null;

      case 'newStorageBin':
        return cell && typeof cell.v === 'string' && /^[A-Z0-9-]+$/i.test(cell.v.trim())
          ? cell.v.trim().toUpperCase()
          : null;

      default:
        return null;
    }
  }

  function importNext(message, oldDocs, newDocs, columns, done)
  {
    if (!oldDocs.length)
    {
      return done();
    }

    const oldDoc = oldDocs.shift();
    const newDoc = newDocs.get(oldDoc._id);

    const update = {
      $set: {updatedAt},
      $push: {
        changes: {
          date: updatedAt,
          user: updater,
          data: {}
        }
      }
    };

    let changed = false;

    columns.forEach(column =>
    {
      const oldValue = oldDoc[column];
      const newValue = newDoc[column];

      if (deepEqual(newValue, oldValue))
      {
        return;
      }

      update.$set[column] = newValue;
      update.$set[`updates.${column}`] = {
        date: updatedAt,
        user: updater,
        data: oldValue
      };
      update.$push.changes.data[column] = [oldValue, newValue];

      changed = true;
    });

    if (!changed)
    {
      return setImmediate(importNext, message, oldDocs, newDocs, columns, done);
    }

    KanbanComponent.update({_id: oldDoc._id}, update, err =>
    {
      if (err)
      {
        module.error(`Failed to import component: ${oldDoc._id}: ${err.message}`);
      }
      else
      {
        message.componentCount += 1;
      }

      setImmediate(importNext, message, oldDocs, newDocs, columns, done);
    });
  }
};