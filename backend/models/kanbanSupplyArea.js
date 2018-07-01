// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKanbanSupplyAreaModel(app, mongoose)
{
  const kanbanSupplyAreaSchema = new mongoose.Schema({
    _id: String,
    name: String,
    lines: [String]
  }, {
    id: false,
    minimize: false
  });

  kanbanSupplyAreaSchema.statics.TOPIC_PREFIX = 'kanban.supplyAreas';

  mongoose.model('KanbanSupplyArea', kanbanSupplyAreaSchema);
};
