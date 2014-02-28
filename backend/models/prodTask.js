'use strict';

module.exports = function setupProdTaskModel(app, mongoose)
{
  var prodTaskSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    tags: [String],
    fteDiv: {
      type: Boolean,
      default: false
    },
    clipColor: {
      type: String,
      default: '#eeee00'
    }
  }, {
    id: false
  });

  prodTaskSchema.index({tags: 1});

  prodTaskSchema.statics.TOPIC_PREFIX = 'prodTasks';
  prodTaskSchema.statics.BROWSE_LIMIT = 1000;

  prodTaskSchema.statics.getForSubdivision = function(subdivisionId, done)
  {
    var subdivision = app.subdivisions.modelsById[subdivisionId];

    if (!subdivision)
    {
      return done(null, []);
    }

    var subdivisionTags = subdivision.get('prodTaskTags');

    if (!Array.isArray(subdivisionTags) || !subdivisionTags.length)
    {
      return done(null, []);
    }

    this.find({tags: {$in: subdivisionTags}}, {name: 1, fteDiv: 1}).lean().exec(done);
  };

  mongoose.model('ProdTask', prodTaskSchema);
};
