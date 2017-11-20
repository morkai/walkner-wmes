// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const deepEqual = require('deep-equal');
const moment = require('moment');

module.exports = function setupPlanSettingsModel(app, mongoose)
{
  const mrpLineSettingsSchema = new mongoose.Schema({
    _id: String,
    workerCount: {
      type: Number,
      default: 1
    },
    orderPriority: [String]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const mrpSettingsSchema = new mongoose.Schema({
    _id: String,
    extraOrderSeconds: {
      type: Number,
      default: 0
    },
    extraShiftSeconds: [Number],
    bigOrderQuantity: {
      type: Number,
      default: 70
    },
    splitOrderQuantity: {
      type: Number,
      default: 70
    },
    maxSplitLineCount: {
      type: Number,
      default: 0
    },
    hardOrderManHours: {
      type: Number,
      default: 0
    },
    hardComponents: [String],
    lines: [mrpLineSettingsSchema]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const lineSchema = new mongoose.Schema({
    _id: String,
    mrpPriority: [String],
    activeFrom: {
      type: String,
      default: ''
    },
    activeTo: {
      type: String,
      default: ''
    }
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planSettingsSchema = new mongoose.Schema({
    _id: Date,
    useRemainingQuantity: {
      type: Boolean,
      default: true
    },
    ignoreCompleted: {
      type: Boolean,
      default: true
    },
    requiredStatuses: [String],
    ignoredStatuses: [String],
    lines: [lineSchema],
    mrps: [mrpSettingsSchema]
  }, {
    id: false,
    minimize: false,
    retainKeyOrder: true
  });

  planSettingsSchema.statics.TOPIC_PREFIX = 'planning.settings';

  planSettingsSchema.statics.createNew = function(_id)
  {
    return new this({
      _id: _id,
      useRemainingQuantity: true,
      ignoreCompleted: true,
      requiredStatuses: ['REL'],
      ignoredStatuses: ['TECO', 'CNF', 'DLV', 'DLFL', 'DLT'],
      lines: [],
      mrps: []
    });
  };

  planSettingsSchema.statics.copyFrom = function(_id, sourceSettings)
  {
    return new this({
      _id: _id,
      useRemainingQuantity: sourceSettings.useRemainingQuantity,
      ignoreCompleted: sourceSettings.ignoreCompleted,
      requiredStatuses: sourceSettings.requiredStatuses,
      ignoredStatuses: sourceSettings.ignoredStatuses,
      lines: sourceSettings.lines,
      mrps: sourceSettings.mrps
    });
  };

  planSettingsSchema.methods.toGenerator = function()
  {
    const lines = new Map();
    const mrps = new Map();
    const mrpLines = new Map();
    const ignoredStatuses = new Set();
    const hardComponents = new Set();

    this.ignoredStatuses.forEach(status => ignoredStatuses.add(status));

    this.mrps.forEach(mrp => mrp.hardComponents.forEach(nc12 => hardComponents.add(nc12)));

    const line = (lineId) =>
    {
      if (!lines.has(lineId))
      {
        lines.set(lineId, this.lines.find(line => line._id === lineId));
      }

      return lines.get(lineId);
    };
    const mrp = (mrpId) =>
    {
      if (!mrps.has(mrpId))
      {
        const mrp = this.mrps.find(mrp => mrp._id === mrpId);

        if (!mrp)
        {
          return null;
        }

        mrps.set(mrpId, Object.assign(mrp.toObject(), {
          hardComponents: new Set(mrp.hardComponents)
        }));
      }

      return mrps.get(mrpId);
    };
    const mrpLine = (mrpId, lineId) =>
    {
      if (!mrpLines.has(lineId))
      {
        mrpLines.set(lineId, new Map());
      }

      const lineMrpMap = mrpLines.get(lineId);

      if (!lineMrpMap.has(mrpId))
      {
        const line = mrp(mrpId).lines.find(line => line._id === lineId);

        lineMrpMap.set(mrpId, line);
      }

      return lineMrpMap.get(mrpId);
    };

    return {
      useRemainingQuantity: this.useRemainingQuantity,
      ignoreCompleted: this.ignoreCompleted,
      requiredStatuses: this.requiredStatuses,
      ignoredStatuses: ignoredStatuses,
      hardComponents: hardComponents,
      shiftStartTimes: [
        moment.utc(this._id).clone().hours(6).valueOf(),
        moment.utc(this._id).clone().hours(14).valueOf(),
        moment.utc(this._id).clone().hours(22).valueOf()
      ],
      mrps: this.mrps.map(mrp => mrp._id),
      lines: this.lines.map(line => line._id),
      line,
      mrp,
      mrpLine
    };
  };

  planSettingsSchema.methods.removeUnused = function()
  {
    const definedLines = new Set();
    const definedMrps = new Map();
    const listedMrps = new Map();

    this.mrps.forEach(mrp => definedMrps.set(mrp._id, mrp));

    this.lines.forEach(line =>
    {
      line.mrpPriority = line.mrpPriority.filter(mrpId => typeof mrpId === 'string' && mrpId.length > 0);

      if (!line.mrpPriority.length)
      {
        return;
      }

      line.mrpPriority.forEach(mrpId =>
      {
        if (!listedMrps.has(mrpId))
        {
          listedMrps.set(mrpId, []);
        }

        listedMrps.get(mrpId).push(line._id);
      });

      definedLines.add(line);
    });

    for (const mrpId of definedMrps.keys())
    {
      if (!listedMrps.has(mrpId))
      {
        definedMrps.delete(mrpId);
      }
    }

    for (const [mrpId, lineIds] of listedMrps)
    {
      const mrp = definedMrps.get(mrpId) || {
        _id: mrpId,
        extraOrderSeconds: 0,
        extraShiftSeconds: [0, 0, 0],
        bigOrderQuantity: 70,
        splitOrderQuantity: 70,
        maxSplitLineCount: 0,
        hardOrderManHours: 0,
        hardComponents: [],
        lines: []
      };

      mrp.lines = lineIds.map(lineId =>
      {
        return mrp.lines.find(line => line._id === lineId) || {
          _id: lineId,
          workerCount: 0,
          orderPriority: ['small', 'easy', 'hard']
        };
      });

      definedMrps.set(mrpId, mrp);
    }

    this.lines = Array.from(definedLines.values());
    this.mrps = Array.from(definedMrps.values());
  };

  planSettingsSchema.methods.applyChanges = function(input, user)
  {
    const changes = [];
    const planChange = {
      plan: this._id || input._id,
      date: new Date(),
      user,
      data: {
        settings: changes
      }
    };

    if (this.isNew)
    {
      this.set(input);
      this.removeUnused();

      return planChange;
    }

    input = new this.constructor(input);
    input.removeUnused();

    [
      'useRemainingQuantity',
      'ignoreCompleted',
      'requiredStatuses',
      'ignoredStatuses'
    ].forEach(prop =>
    {
      const oldValue = this[prop].toObject ? this[prop].toObject() : this[prop];
      const newValue = input[prop].toObject ? input[prop].toObject() : input[prop];

      if (deepEqual(newValue, oldValue))
      {
        return;
      }

      this[prop] = newValue;

      changes.push({
        type: 'change',
        property: prop,
        oldValue: oldValue,
        newValue: newValue
      });
    });

    this.applyLineChanges(input, changes);
    this.applyMrpChanges(input, changes);

    return planChange;
  };

  planSettingsSchema.methods.applyLineChanges = function(input, changes)
  {
    const oldLineMap = {};
    const newLineMap = {};
    const newLines = [];

    this.lines.forEach(line => oldLineMap[line._id] = line);
    input.lines.forEach(line => newLineMap[line._id] = line);

    Object.keys(newLineMap).forEach(lineId =>
    {
      const oldLine = oldLineMap[lineId] ? oldLineMap[lineId].toObject() : null;
      const newLine = newLineMap[lineId].toObject();

      delete oldLineMap[lineId];

      newLines.push(newLine);

      if (!oldLine)
      {
        changes.push({
          type: 'lines:add',
          line: newLine
        });

        return;
      }

      Object.keys(newLine).forEach(prop =>
      {
        const oldValue = oldLine[prop].toObject ? oldLine[prop].toObject() : oldLine[prop];
        const newValue = newLine[prop].toObject ? newLine[prop].toObject() : newLine[prop];

        if (deepEqual(newValue, oldValue))
        {
          return;
        }

        changes.push({
          type: 'lines:change',
          line: lineId,
          property: prop,
          oldValue: oldValue,
          newValue: newValue
        });
      });
    });

    Object.keys(oldLineMap).forEach(lineId =>
    {
      changes.push({
        type: 'lines:remove',
        line: oldLineMap[lineId]
      });
    });

    this.lines = newLines;
  };

  planSettingsSchema.methods.applyMrpChanges = function(input, changes)
  {
    const oldMrpMap = {};
    const newMrpMap = {};
    const newMrps = [];

    this.mrps.forEach(mrp => oldMrpMap[mrp._id] = mrp);
    input.mrps.forEach(mrp => newMrpMap[mrp._id] = mrp);

    Object.keys(newMrpMap).forEach(mrpId =>
    {
      const oldMrp = oldMrpMap[mrpId] ? oldMrpMap[mrpId].toObject() : null;
      const newMrp = newMrpMap[mrpId].toObject();

      delete oldMrpMap[mrpId];

      newMrps.push(newMrp);

      if (!oldMrp)
      {
        return changes.push({
          type: 'mrps:add',
          mrp: newMrp
        });
      }

      Object.keys(newMrp).forEach(prop =>
      {
        const oldValue = oldMrp[prop].toObject ? oldMrp[prop].toObject() : oldMrp[prop];
        const newValue = newMrp[prop].toObject ? newMrp[prop].toObject() : newMrp[prop];

        if (prop === 'lines')
        {
          return this.applyMrpLineChanges(mrpId, oldValue, newValue, changes);
        }

        if (!deepEqual(newValue, oldValue))
        {
          changes.push({
            type: 'mrps:change',
            mrp: mrpId,
            property: prop,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      });
    });

    Object.keys(oldMrpMap).forEach(mrpId =>
    {
      changes.push({
        type: 'mrps:remove',
        mrp: oldMrpMap[mrpId]
      });
    });

    this.mrps = newMrps;
  };

  planSettingsSchema.methods.applyMrpLineChanges = function(mrpId, oldMrpLines, newMrpLines, changes)
  {
    const oldMrpLineMap = {};
    const newMrpLineMap = {};

    oldMrpLines.forEach(mrpLine => oldMrpLineMap[mrpLine._id] = mrpLine);
    newMrpLines.forEach(mrpLine => newMrpLineMap[mrpLine._id] = mrpLine);

    Object.keys(newMrpLineMap).forEach(mrpLineId =>
    {
      const oldMrpLine = oldMrpLineMap[mrpLineId];
      const newMrpLine = newMrpLineMap[mrpLineId];

      delete oldMrpLineMap[mrpLineId];

      if (!oldMrpLine)
      {
        return changes.push({
          type: 'mrpLines:add',
          mrp: mrpId,
          line: newMrpLine
        });
      }

      Object.keys(newMrpLine).forEach(prop =>
      {
        const oldValue = oldMrpLine[prop].toObject ? oldMrpLine[prop].toObject() : oldMrpLine[prop];
        const newValue = newMrpLine[prop].toObject ? newMrpLine[prop].toObject() : newMrpLine[prop];

        if (!deepEqual(newValue, oldValue))
        {
          changes.push({
            type: 'mrpLines:change',
            mrp: mrpId,
            line: mrpLineId,
            property: prop,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      });
    });

    Object.keys(oldMrpLineMap).forEach(mrpLineId =>
    {
      changes.push({
        type: 'mrpLines:remove',
        mrp: mrpId,
        line: oldMrpLineMap[mrpLineId]
      });
    });
  };

  mongoose.model('PlanSettings', planSettingsSchema);
};
