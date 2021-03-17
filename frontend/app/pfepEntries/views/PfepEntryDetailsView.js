// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/pfepEntries/templates/details'
], function(
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    remoteTopics: function()
    {
      var topics = DetailsView.prototype.remoteTopics.apply(this, arguments);

      topics['pfep.entries.imported'] = function()
      {
        this.promised(this.model.fetch());
      };

      return topics;
    }

  });
});
