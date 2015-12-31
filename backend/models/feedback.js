// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupFeedbackModel(app, mongoose)
{
  var feedbackChangeSchema = mongoose.Schema({
    type: {
      type: String,
      required: true,
      enum: ['property', 'watch', 'unwatch']
    },
    data: {}
  }, {
    _id: false
  });

  var feedbackReplySchema = mongoose.Schema({
    savedAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    versions: {},
    navigator: {},
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    changes: [feedbackChangeSchema]
  }, {
    _id: false
  });

  var feedbackUnseenSchema = mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    properties: [String]
  }, {
    _id: false
  });

  var feedbackSchema = mongoose.Schema({
    project: {
      type: 'String',
      required: true
    },
    savedAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    creator: {
      id: mongoose.Schema.Types.ObjectId,
      ip: String,
      label: String
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    page: {
      title: String,
      url: String
    },
    versions: {},
    navigator: {
      userAgent: String,
      userLanguage: String,
      platform: String,
      width: Number,
      height: Number,
      innerWidth: Number,
      innerHeight: Number
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['bug', 'improvement', 'feature', 'task', 'other'],
      default: 'other'
    },
    priority: {
      type: String,
      required: true,
      enum: ['critical', 'major', 'normal', 'minor'],
      default: 'normal'
    },
    status: {
      type: String,
      required: true,
      enum: ['new', 'accepted', 'rejected', 'started', 'resolved', 'reopened'],
      default: 'new'
    },
    resolution: {
      type: String,
      enum: ['fixed', 'wontfix', 'duplicate', 'incomplete', 'cantreproduce'],
      default: null
    },
    expectedAt: {
      type: Date,
      default: null
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    watchers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [feedbackReplySchema],
    unseen: [feedbackUnseenSchema]
  }, {
    id: false
  });

  //feedbackSchema.index({date: 1, mrp: 1}, {unique: true});

  feedbackSchema.statics.TOPIC_PREFIX = 'feedback';

  mongoose.model('Feedback', feedbackSchema);
};
