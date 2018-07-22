// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupKanbanPrintQueueModel(app, mongoose)
{
  const kanbanPrintJobSchema = new mongoose.Schema({
    _id: String,
    status: {
      type: String,
      default: 'pending'
    },
    startedAt: {
      type: Date,
      default: null
    },
    finishedAt: {
      type: Date,
      default: null
    },
    line: String,
    kanbans: [Number],
    layouts: [String],
    data: {}
  }, {
    id: false,
    minimize: false
  });

  const kanbanPrintQueueSchema = new mongoose.Schema({
    _id: String,
    createdAt: Date,
    creator: {},
    todo: {
      type: Boolean,
      default: true
    },
    jobs: [kanbanPrintJobSchema]
  }, {
    id: false,
    minimize: false
  });

  kanbanPrintQueueSchema.statics.TOPIC_PREFIX = 'kanban.printQueues';

  kanbanPrintQueueSchema.index({todo: 1, createdAt: -1});
  kanbanPrintQueueSchema.index({'jobs.status': 1});

  mongoose.model('KanbanPrintQueue', kanbanPrintQueueSchema);
};
