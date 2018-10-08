// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderBomMatcherModel(app, mongoose)
{
  const orderBomMatcherSchema = new mongoose.Schema({
    active: Boolean,
    description: {
      type: String,
      required: true,
      trim: true
    },
    matchers: {
      mrp: [String],
      nc12: [String],
      name: [String]
    },
    components: [{
      nc12: String,
      description: String,
      unique: Boolean,
      pattern: {
        type: String,
        required: true,
        trim: true
      },
      nc12Index: [Number],
      snIndex: [Number]
    }]
  }, {
    id: false
  });

  orderBomMatcherSchema.statics.TOPIC_PREFIX = 'orderBomMatchers';

  orderBomMatcherSchema.methods.matchOrder = function(order)
  {
    if (this.matchers.mrp.length && !this.matchers.mrp.includes(order.mrp))
    {
      return false;
    }

    if (this.matchers.nc12.length && !this.matchers.nc12.includes(order.nc12))
    {
      return false;
    }

    if (this.matchers.name.length)
    {
      const nameMatches = this.matchers.name.find(nameMatcher =>
      {
        try
        {
          const re = new RegExp(nameMatcher, 'i');

          return re.test(order.name) || re.test(order.description);
        }
        catch (x)
        {
          return false;
        }
      });

      if (!nameMatches)
      {
        return false;
      }
    }

    const bom = new Set();

    order.bom.forEach(component => bom.add(component.nc12));

    return this.components.every(componentMatcher => bom.has(componentMatcher.nc12));
  };

  mongoose.model('OrderBomMatcher', orderBomMatcherSchema);
};
