// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfProgramModel(app, mongoose)
{
  const xiconfProgramSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    updatedAt: {
      type: Date,
      required: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['t24vdc', 'glp2'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    prodLines: {
      type: String,
      default: ''
    },
    steps: {
      type: Object,
      required: true
    }
  }, {
    id: false
  });

  xiconfProgramSchema.index({name: 1});

  xiconfProgramSchema.statics.TOPIC_PREFIX = 'xiconfPrograms';

  mongoose.model('XiconfProgram', xiconfProgramSchema);
};
