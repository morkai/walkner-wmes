define([
  'app/i18n',
  'app/data/aors',
  'app/core/views/DetailsView',
  'app/prodTasks/templates/details',
  'i18n!app/nls/users'
], function(
  t,
  aors,
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'aors.synced': 'render'
    },

    serialize: function()
    {
      var data = DetailsView.prototype.serialize.call(this);

      data.model.aors = data.model.aors
        .map(function(aorId)
        {
          var aor = aors.get(aorId);

          if (aor)
          {
            return {_id: aorId, name: aor.getLabel()};
          }

          return null;
        })
        .filter(function(aor) { return aor !== null; });

      return data;
    }

  });
});
