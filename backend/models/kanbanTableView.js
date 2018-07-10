// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKanbanTableViewModel(app, mongoose)
{
  const kanbanTableViewSchema = new mongoose.Schema({
    name: String,
    user: {},
    default: {
      type: Boolean,
      default: false
    },
    columns: {},
    filterMode: {
      type: String,
      default: 'and'
    },
    filters: {},
    sort: {}
  }, {
    id: false,
    minimize: false
  });

  kanbanTableViewSchema.index({'user.id': 1, 'default': 1});

  kanbanTableViewSchema.statics.TOPIC_PREFIX = 'kanban.tableViews';

  mongoose.model('KanbanTableView', kanbanTableViewSchema);
};