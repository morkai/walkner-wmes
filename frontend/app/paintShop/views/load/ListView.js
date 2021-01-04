// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/ListView'
], function(
  viewport,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: '',

    remoteTopics: {
      'paintShop.load.updated': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {
          id: 'time',
          min: 1,
          label: this.t('load:history:time')
        },
        {
          id: 'counter',
          min: 1,
          label: this.t('load:history:counter')
        },
        {
          id: 'duration',
          min: 1,
          label: this.t('load:history:duration')
        },
        {
          id: 'reason',
          min: 1,
          label: this.t('load:history:reason')
        },
        '-'
      ];
    },

    serializeActions: function()
    {
      return null;
    },

    serializeRow: function(model)
    {
      return model.serialize({reasons: this.reasons});
    }

  });
});
