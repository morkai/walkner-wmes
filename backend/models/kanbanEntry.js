// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKanbanEntryModel(app, mongoose)
{
  const kanbanEntrySchema = new mongoose.Schema({
    _id: Number,
    createdAt: Date,
    updatedAt: Date,
    updater: {},
    kind: String,
    nc12: String,
    supplyArea: String,
    kanbanQtySap: Number,
    componentQty: Number,
    kanbanId: Number,
    workstations: [Number],
    locations: [String],
    discontinued: Boolean,
    comment: String,
    updates: {},
    changes: {}
  }, {
    id: false,
    minimize: false
  });

  kanbanEntrySchema.index({updatedAt: -1});
  kanbanEntrySchema.index({nc12: 1});
  kanbanEntrySchema.index({supplyArea: 1});
  kanbanEntrySchema.index({discontinued: 1});

  kanbanEntrySchema.statics.TOPIC_PREFIX = 'kanban.entries';
  kanbanEntrySchema.statics.BROWSE_LIMIT = 0;

  kanbanEntrySchema.statics.createFromImport = function(data, updatedAt, updater)
  {
    return {
      _id: data[0],
      createdAt: updatedAt,
      updatedAt,
      updater,
      kind: null,
      nc12: data[1],
      supplyArea: data[2],
      kanbanQtySap: data[3],
      componentQty: data[4],
      kanbanId: data[5],
      workstations: [0, 0, 0, 0, 0, 0],
      locations: ['', '', '', '', '', ''],
      discontinued: false,
      comment: '',
      updates: {},
      changes: []
    };
  };

  mongoose.model('KanbanEntry', kanbanEntrySchema);
};
