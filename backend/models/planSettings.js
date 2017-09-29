// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

module.exports = function setupPlanSettingsModel(app, mongoose)
{
  const mrpLineSettingsSchema = new mongoose.Schema({
    _id: String,
    workerCount: Number,
    orderPriority: [String]
  }, {
    _id: false
  });

  const mrpSettingsSchema = new mongoose.Schema({
    _id: String,
    extraOrderSeconds: Number,
    extraShiftSeconds: [Number],
    bigOrderQuantity: Number,
    hardOrderManHours: Number,
    hardComponents: [String],
    lines: [mrpLineSettingsSchema]
  }, {
    _id: false
  });

  const lineSchema = new mongoose.Schema({
    _id: String,
    mrpPriority: [String],
    activeFrom: String,
    activeTo: String
  }, {
    _id: false
  });

  const planSettingsSchema = new mongoose.Schema({
    _id: Date,
    useRemainingQuantity: Boolean,
    ignoreCompleted: Boolean,
    requiredStatuses: [String],
    ignoredStatuses: [String],
    lines: [lineSchema],
    mrps: [mrpSettingsSchema]
  }, {
    id: false
  });

  planSettingsSchema.statics.TOPIC_PREFIX = 'planning.settings';

  planSettingsSchema.pre('save', function(next)
  {
    const definedMrps = new Map();
    const listedMrps = new Map();

    this.mrps.forEach(mrp => definedMrps.set(mrp._id, mrp));

    this.lines.forEach(line =>
    {
      line.mrpPriority.forEach(mrpId =>
      {
        if (!listedMrps.has(mrpId))
        {
          listedMrps.set(mrpId, []);
        }

        listedMrps.get(mrpId).push(line._id);
      });
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
        hardOrderManHours: 0,
        hardComponents: [],
        lines: []
      };

      mrp.lines = lineIds.map(lineId =>
      {
        return mrp.lines.find(line => line._id === lineId) || {
          _id: lineId,
          workerCount: 1,
          orderPriority: ['small', 'easy', 'hard']
        };
      });

      definedMrps.set(mrpId, mrp);
    }

    this.mrps = Array.from(definedMrps.values());

    next();
  });

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

  mongoose.model('PlanSettings', planSettingsSchema);
};
