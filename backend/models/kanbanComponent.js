// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKanbanComponentModel(app, mongoose)
{
  const kanbanComponentSchema = new mongoose.Schema({
    _id: String,
    createdAt: Date,
    updatedAt: Date,
    updater: {},
    description: String,
    storageBin: String,
    newStorageBin: String,
    maxBinQty: Number,
    minBinQty: Number,
    replenQty: Number,
    markerColor: String,
    updates: {},
    changes: {}
  }, {
    id: false,
    minimize: false
  });

  kanbanComponentSchema.statics.TOPIC_PREFIX = 'kanban.components';
  kanbanComponentSchema.statics.BROWSE_LIMIT = 0;

  kanbanComponentSchema.statics.createFromImport = function(data, updatedAt, updater)
  {
    return {
      _id: data[0],
      createdAt: updatedAt,
      updatedAt,
      updater,
      description: data[1],
      storageBin: data[2],
      newStorageBin: '',
      maxBinQty: data[3],
      minBinQty: data[4],
      replenQty: data[5],
      markerColor: null,
      updates: {},
      changes: []
    };
  };

  mongoose.model('KanbanComponent', kanbanComponentSchema);
};
