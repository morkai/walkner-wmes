// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKanbanContainerModel(app, mongoose)
{
  const kanbanContainerSchema = new mongoose.Schema({
    _id: String,
    name: String,
    length: Number,
    width: Number,
    height: Number,
    image: String
  }, {
    id: false,
    minimize: false
  });

  kanbanContainerSchema.statics.TOPIC_PREFIX = 'kanban.containers';

  mongoose.model('KanbanContainer', kanbanContainerSchema);
};
