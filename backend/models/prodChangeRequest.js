// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupProdChangeRequestModel(app, mongoose)
{
  var prodChangeRequestSchema = mongoose.Schema({
    status: {
      type: String,
      default: 'new',
      enum: ['new', 'accepted', 'rejected']
    },
    createdAt: {
      type: Date,
      required: true
    },
    creator: {
      type: Object,
      required: true
    },
    creatorComment: {
      type: String,
      default: ''
    },
    confirmedAt: {
      type: Date,
      default: null
    },
    confirmer: {
      type: Object,
      default: null
    },
    confirmerComment: {
      type: String,
      default: ''
    },
    division: {
      type: String,
      required: true
    },
    prodLine: {
      type: String,
      default: null
    },
    modelType: {
      type: String,
      required: true,
      enum: ['shift', 'order', 'downtime', 'fteMaster', 'fteLeader']
    },
    modelId: {
      type: String,
      default: null
    },
    operation: {
      type: String,
      required: true,
      enum: ['add', 'edit', 'delete']
    },
    data: {}
  }, {
    id: false
  });

  prodChangeRequestSchema.statics.TOPIC_PREFIX = 'prodChangeRequests';
  prodChangeRequestSchema.statics.CRUD_PUBLISH = false;

  prodChangeRequestSchema.index({status: 1});
  prodChangeRequestSchema.index({division: 1});
  prodChangeRequestSchema.index({prodLine: 1});
  prodChangeRequestSchema.index({modelId: 1});

  prodChangeRequestSchema.pre('save', function(next)
  {
    this._wasNew = this.isNew;

    next();
  });

  prodChangeRequestSchema.post('save', function(doc)
  {
    app.broker.publish('prodChangeRequests.' + (this._wasNew ? 'created' : 'updated'), doc.toJSON());
  });

  prodChangeRequestSchema.statics.create = function(operation, modelType, modelId, creator, data, done)
  {
    /*jshint -W040*/

    var creatorComment = '';

    if (data.requestComment)
    {
      creatorComment = data.requestComment;

      delete data.requestComment;
    }

    var changeRequest = new this({
      createdAt: new Date(),
      creator: creator,
      creatorComment: creatorComment,
      division: data.division,
      prodLine: data.prodLine,
      modelType: modelType,
      modelId: modelId,
      operation: operation,
      data: data
    });

    return changeRequest.save(done);
  };

  prodChangeRequestSchema.methods.accept = function(confirmer, comment, done)
  {
    this.confirm('accepted', confirmer, comment, done);
  };

  prodChangeRequestSchema.methods.reject = function(confirmer, comment, done)
  {
    this.confirm('rejected', confirmer, comment, done);
  };

  prodChangeRequestSchema.methods.confirm = function(status, confirmer, comment, done)
  {
    this.status = status;
    this.confirmerComment = comment || '';
    this.confirmer = confirmer;
    this.confirmedAt = new Date();

    this.save(done);
  };

  mongoose.model('ProdChangeRequest', prodChangeRequestSchema);
};
