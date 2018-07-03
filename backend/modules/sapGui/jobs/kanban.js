// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const step = require('h5.step');
const parseSapTextTable = require('../../sap/util/parseSapTextTable');
const parseSapNumber = require('../../sap/util/parseSapNumber');
const parseSapString = require('../../sap/util/parseSapString');
const checkOutputFile = require('./checkOutputFile');

let inProgress = false;

module.exports = function runKanbanJob(app, sapGuiModule, job, done)
{
  if (inProgress)
  {
    return setImmediate(done, app.createError('Job already running.', 'IN_PROGRESS', 400));
  }

  inProgress = true;

  const filePrefix = `${Date.now()}_${Math.random()}_`;
  const tmpDir = os.tmpdir();
  const files = {
    supplyAreas: {},
    controlCycles: {},
    materials: {},
    pkhd: {},
    makt: {},
    pkps: {},
    mlgt: {}
  };

  Object.keys(files).forEach(k =>
  {
    const file = `${filePrefix}_${k}.txt`;

    files[k] = {
      path: tmpDir,
      file: file,
      full: path.join(tmpDir, file)
    };
  });

  step(
    function()
    {
      this.result = {
        supplyAreas: job.supplyAreas || [],
        kanbans: {
          columns: ['_id', 'nc12', 'supplyArea', 'kanbanQtySap', 'componentQty', 'kanbanId'],
          rows: []
        },
        components: {
          columns: ['_id', 'description', 'storageBin', 'maxBinQty', 'minBinQty', 'replenQty'],
          rows: []
        }
      };

      fs.writeFile(
        files.supplyAreas.full,
        this.result.supplyAreas.join('\r\n').trim(),
        this.next()
      );
    },
    function(err)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'PKHD_TRANSACTION_FAILURE'));
      }

      const args = [
        '--output-path', files.pkhd.path,
        '--output-file', files.pkhd.file,
        '--table', 'PKHD',
        '--layout', 'WMES_PKHD',
        '--criteria', `F,4,${files.supplyAreas.path},${files.supplyAreas.file}`,
        '--criteria', `f,14,${job.pkhdStorageType}`
      ];

      sapGuiModule.runScript(job, 'T_ZSE16D.exe', args, checkOutputFile.bind(null, this.next()));
    },
    function(err, exitCode, output)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'PKHD_TRANSACTION_FAILURE'), exitCode, output);
      }

      fs.readFile(files.pkhd.full, {encoding: 'utf8'}, this.next());
    },
    function(err, pkhd)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'PKHD_READ_FAILURE'));
      }

      this.components = new Map();
      this.kanbans = new Map();

      parseSapTextTable(pkhd, {
        columnMatchers: {
          _id: /^C.*?Cycle$/,
          nc12: /^Material$/,
          supplyArea: /^Supply.*?Area$/,
          kanbanQtySap: /^Number$/,
          componentQty: /^Kanban Qty$/
        },
        valueParsers: {
          _id: parseSapNumber,
          nc12: input => input.replace(/^0+/, ''),
          supplyArea: parseSapString,
          kanbanQtySap: parseSapNumber,
          componentQty: parseSapNumber
        },
        itemDecorator: obj =>
        {
          if (!obj._id)
          {
            return null;
          }

          const kanban = [
            obj._id,
            obj.nc12,
            obj.supplyArea,
            Math.max(0, obj.kanbanQtySap),
            Math.max(0, obj.componentQty),
            0
          ];

          this.components.set(obj.nc12, null);
          this.kanbans.set(obj._id, kanban);

          return null;
        }
      });

      fs.writeFile(files.controlCycles.full, Array.from(this.kanbans.keys()).join('\r\n'), this.parallel());
      fs.writeFile(files.materials.full, Array.from(this.components.keys()).join('\r\n'), this.parallel());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'PKHD_WRITE_FAILURE'));
      }

      const args = [
        '--output-path', files.makt.path,
        '--output-file', files.makt.file,
        '--table', 'MAKT',
        '--layout', 'WMES_MAKT',
        '--criteria', `F,1,${files.materials.path},${files.materials.file}`,
        '--criteria', `m,2,${job.maktLanguage || 'PL'}`
      ];

      sapGuiModule.runScript(job, 'T_ZSE16D.exe', args, checkOutputFile.bind(null, this.next()));
    },
    function(err, exitCode, output)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'MAKT_TRANSACTION_FAILURE'), exitCode, output);
      }

      fs.readFile(files.makt.full, {encoding: 'utf8'}, this.next());
    },
    function(err, makt)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'MAKT_READ_FAILURE'));
      }

      parseSapTextTable(makt, {
        columnMatchers: {
          _id: /^Material$/,
          description: /^Material description$/,
          lang: /^Lang/
        },
        valueParsers: {
          _id: input => input.replace(/^0+/, ''),
          description: parseSapString,
          lang: parseSapString
        },
        itemDecorator: obj =>
        {
          if (!obj._id)
          {
            return null;
          }

          const oldComponent = this.components.get(obj._id);

          if (oldComponent)
          {
            if (oldComponent[1] === '' || (obj.description !== '' && obj.lang === 'PL'))
            {
              oldComponent[1] = obj.description;
            }
          }
          else
          {
            this.components.set(obj._id, [
              obj._id,
              obj.description,
              '',
              0,
              0,
              0
            ]);
          }

          return null;
        }
      });

      setImmediate(this.next());
    },
    function()
    {
      const args = [
        '--output-path', files.pkps.path,
        '--output-file', files.pkps.file,
        '--table', 'PKPS',
        '--layout', 'WMES_PKPS',
        '--criteria', `F,2,${files.controlCycles.path},${files.controlCycles.file}`,
        '--criteria', 'f,3,1'
      ];

      sapGuiModule.runScript(job, 'T_ZSE16D.exe', args, checkOutputFile.bind(null, this.next()));
    },
    function(err, exitCode, output)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'PKPS_TRANSACTION_FAILURE'), exitCode, output);
      }

      fs.readFile(files.pkps.full, {encoding: 'utf8'}, this.next());
    },
    function(err, pkps)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'PKPS_READ_FAILURE'));
      }

      parseSapTextTable(pkps, {
        columnMatchers: {
          controlCycleId: /^C.*?nt.*?Cyc/,
          kanbanId: /^ID/
        },
        valueParsers: {
          controlCycleId: parseSapNumber,
          kanbanId: parseSapNumber
        },
        itemDecorator: obj =>
        {
          const kanban = this.kanbans.get(obj.controlCycleId);

          if (kanban && (!kanban[5] || obj.kanbanId < kanban[5]))
          {
            kanban[5] = obj.kanbanId < 0 ? 0 : obj.kanbanId;
          }

          return null;
        }
      });

      setImmediate(this.next());
    },
    function()
    {
      const args = [
        '--output-path', files.mlgt.path,
        '--output-file', files.mlgt.file,
        '--table', 'MLGT',
        '--layout', 'WMES_MLGT',
        '--criteria', `f,2,${job.mlgtWarehouseNo || 'KZ1'}`,
        '--criteria', `f,3,${job.mlgtStorageType || '851'}`
      ];

      sapGuiModule.runScript(job, 'T_ZSE16D.exe', args, checkOutputFile.bind(null, this.next()));
    },
    function(err, exitCode, output)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'MLGT_TRANSACTION_FAILURE'), exitCode, output);
      }

      fs.readFile(files.mlgt.full, {encoding: 'utf8'}, this.next());
    },
    function(err, mlgt)
    {
      if (err)
      {
        return this.skip(app.createError(err.message, 'MLGT_READ_FAILURE'));
      }

      parseSapTextTable(mlgt, {
        columnMatchers: {
          _id: /^Material$/,
          storageBin: /^Stor.*?Bin/,
          maxBinQty: /Max.*?qty/i,
          minBinQty: /Min.*?qty/i,
          replenQty: /Rep.*?qty/i
        },
        valueParsers: {
          _id: input => input.replace(/^0+/, ''),
          storageBin: parseSapString,
          maxBinQty: parseSapNumber,
          minBinQty: parseSapNumber,
          replenQty: parseSapNumber
        },
        itemDecorator: obj =>
        {
          if (!obj._id)
          {
            return null;
          }

          if (!this.components.get(obj._id))
          {
            this.components.set(obj._id, [
              obj._id,
              '',
              '',
              0,
              0,
              0
            ]);
          }

          const component = this.components.get(obj._id);

          component[2] = obj.storageBin;
          component[3] = Math.max(0, obj.maxBinQty);
          component[4] = Math.max(0, obj.minBinQty);
          component[5] = Math.max(0, obj.replenQty);

          return null;
        }
      });

      setImmediate(this.next());
    },
    function()
    {
      const resultFile = path.join(
        sapGuiModule.config.outputPath,
        Math.floor(Date.now() / 1000) + '@KANBAN.json'
      );

      this.result.kanbans.rows = Array.from(this.kanbans.values());
      this.result.components.rows = Array.from(this.components.values());

      fs.writeFile(resultFile, JSON.stringify(this.result), this.next());
    },
    function(err)
    {
      Object.keys(files).forEach(k => fs.unlink(files[k].full, () => {}));

      done(err, 0, this.result);

      inProgress = false;
    }
  );
};
