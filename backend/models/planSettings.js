// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPlanSettingsModel(app, mongoose)
{
  const lineSettingsSchema = new mongoose.Schema({
    _id: String,
    workerCount: Number,
    activeFrom: String,
    activeTo: String,
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
    lines: [lineSettingsSchema]
  }, {
    _id: false
  });

  const linePrioritySchema = new mongoose.Schema({
    line: String,
    mrps: [String]
  }, {
    _id: false
  });

  const planSettingsSchema = new mongoose.Schema({
    _id: Date,
    useRemainingQuantity: Boolean,
    ignoreCompleted: Boolean,
    requiredStatuses: [String],
    ignoredStatuses: [String],
    hardComponents: [String],
    linePriorities: [linePrioritySchema],
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

    this.linePriorities.forEach(linePriority =>
    {
      linePriority.mrps.forEach(mrpId =>
      {
        if (!listedMrps.has(mrpId))
        {
          listedMrps.set(mrpId, []);
        }

        listedMrps.get(mrpId).push(linePriority.line);
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
        lines: []
      };

      mrp.lines = lineIds.map(lineId =>
      {
        return mrp.lines.find(line => line._id === lineId) || {
          _id: lineId,
          workerCount: 1,
          activeFrom: '',
          activeTo: '',
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
      hardComponents: [],
      linePriorities: [],
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
      hardComponents: sourceSettings.hardComponents,
      linePriorities: sourceSettings.linePriorities,
      mrps: sourceSettings.mrps
    });
  };

  planSettingsSchema.methods.toGenerator = function()
  {
    const mrps = new Map();
    const lines = new Map();
    const ignoredStatuses = new Set();

    this.ignoredStatuses.forEach(status => ignoredStatuses.add(status));

    return {
      useRemainingQuantity: this.useRemainingQuantity,
      ignoreCompleted: this.ignoreCompleted,
      requiredStatuses: this.requiredStatuses,
      ignoredStatuses: ignoredStatuses,
      hardComponents: this.hardComponents,
      mrps: this.mrps.map(mrp => mrp._id),
      mrp: (mrpId) =>
      {
        if (!mrps.has(mrpId))
        {
          mrps.set(mrpId, this.mrps.find(mrp => mrp._id === mrpId));
        }

        return mrps.get(mrpId);
      },
      line: (mrpId, lineId) =>
      {
        if (!lines.has(lineId))
        {
          lines.set(lineId, new Map());
        }

        const lineMrpMap = lines.get(lineId);

        if (!lineMrpMap.has(mrpId))
        {
          lineMrpMap.set(mrpId, mrps.get(mrpId).lines.find(line => line._id === lineId));
        }

        return lineMrpMap.get(mrpId);
      }
    };
  };

  mongoose.model('PlanSettings', planSettingsSchema);
};
