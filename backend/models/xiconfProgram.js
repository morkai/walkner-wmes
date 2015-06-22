// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupXiconfProgramModel(app, mongoose)
{
  var xiconfProgramSchema = mongoose.Schema({
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
