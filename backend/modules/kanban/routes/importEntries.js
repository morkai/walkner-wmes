// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const xlsx = require('xlsx');
const fs = require('fs-extra');
const deepEqual = require('deep-equal');

module.exports = function importEntriesRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const KanbanEntry = mongoose.model('KanbanEntry');

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
        kind: null,
        workstations: [null, null, null, null, null, null],
        container: null,
        locations: [null, null, null, null, null, null],
        discontinued: null
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

        if (v === 'ccn')
        {
          addresses._id = col;
        }
        else if (v.includes('pojemnik'))
        {
          addresses.container = col;
        }
        else if (v.includes('rodzaj'))
        {
          addresses.kind = col;
        }
        else if (v.includes('wycof'))
        {
          addresses.discontinued = col;
        }
        else if (/l(ok.*?)?st(an.*?)?[1-6]$/.test(v))
        {
          addresses.locations[v.substr(-1) - 1] = col;
        }
        else if (/st(an.*?)?[1-6]$/.test(v))
        {
          addresses.workstations[v.substr(-1) - 1] = col;
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
        return this.skip(app.createError('Missing the CCN column.', 'INPUT', 400));
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

      KanbanEntry
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
        return cell && cell.v > 0 ? +cell.v : null;

      case 'kind':
        return cell && typeof cell.v === 'string' && /^(pk|kk)$/i.test(cell.v) ? cell.v.toLowerCase() : null;

      case 'container':
        return cell && typeof cell.v === 'string' && cell.v.length ? cell.v : null;

      case 'discontinued':
        return !(!cell || cell.v === '' || cell.v === 0 || cell.v === '0');

      case 'workstations':
        return parseFloat(parseFloat(cell && cell.v || '0').toFixed(1));

      case 'locations':
        return cell && typeof cell.v === 'string' && /^[A-Za-z][0-9]{2}$/.test(cell.v) ? cell.v.toUpperCase() : '';

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

      if (Array.isArray(oldValue))
      {
        oldValue.forEach((oldVal, arrayIndex) =>
        {
          const newVal = newValue[arrayIndex];

          if (deepEqual(newVal, oldVal))
          {
            return;
          }

          update.$set[`${column}.${arrayIndex}`] = newVal;
          update.$set[`updates.${column}_${arrayIndex}`] = {
            date: updatedAt,
            user: updater,
            data: oldVal
          };
          update.$push.changes.data[`${column}_${arrayIndex}`] = [oldVal, newVal];

          changed = true;
        });
      }
      else if (!deepEqual(newValue, oldValue))
      {
        update.$set[column] = newValue;
        update.$set[`updates.${column}`] = {
          date: updatedAt,
          user: updater,
          data: oldValue
        };
        update.$push.changes.data[column] = [oldValue, newValue];

        changed = true;
      }
    });

    if (!changed)
    {
      return setImmediate(importNext, message, oldDocs, newDocs, columns, done);
    }

    KanbanEntry.update({_id: oldDoc._id}, update, err =>
    {
      if (err)
      {
        module.error(`Failed to import entry: ${oldDoc._id}: ${err.message}`);
      }
      else
      {
        message.entryCount += 1;
      }

      setImmediate(importNext, message, oldDocs, newDocs, columns, done);
    });
  }
};
