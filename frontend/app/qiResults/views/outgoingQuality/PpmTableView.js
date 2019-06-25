// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/reports/util/formatXAxis',
  'app/qiResults/templates/outgoingQuality/ppmTable'
], function(
  _,
  View,
  formatXAxis,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:groups', this.render);
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        data: _.map(view.model.get('groups'), function(group)
        {
          return {
            week: formatXAxis(view, {value: group.key}),
            oql: group.oql,
            target: group.oqlTarget
          };
        })
      };
    }

  });
});
