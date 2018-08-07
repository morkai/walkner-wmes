// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKanbanSupplyAreaModel(app, mongoose)
{
  const kanbanSupplyAreaSchema = new mongoose.Schema({
    name: String,
    workCenter: String,
    family: String,
    lineCount: Number,
    lines: [String]
  }, {
    id: false,
    minimize: false
  });

  kanbanSupplyAreaSchema.statics.TOPIC_PREFIX = 'kanban.supplyAreas';

  kanbanSupplyAreaSchema.pre('save', function(next)
  {
    this.lineCount = this.lines.filter(l => l !== '-').length;

    next();
  });

  mongoose.model('KanbanSupplyArea', kanbanSupplyAreaSchema);
};
