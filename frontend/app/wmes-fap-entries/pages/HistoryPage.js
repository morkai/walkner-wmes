// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/core/util/onModelDeleted',
  'app/core/pages/createPageBreadcrumbs',
  '../dictionaries',
  '../views/HistoryView'
], function(
  DetailsPage,
  onModelDeleted,
  createPageBreadcrumbs,
  dictionaries,
  HistoryView
) {
  'use strict';

  return DetailsPage.extend({

    pageClassName: 'page-max-flex',
    DetailsView: HistoryView,

    breadcrumbs: function()
    {
      return createPageBreadcrumbs(this, [
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        ':history'
      ]);
    },

    remoteTopicsAfterSync: true,
    remoteTopics: function()
    {
      var topics = {
        'fap.entries.deleted': 'onDeleted'
      };

      topics['fap.entries.updated.' + this.model.id] = 'onUpdated';

      return topics;
    },

    actions: [],

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);
    },

    destroy: function()
    {

    },

    onDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    onUpdated: function(message)
    {
      this.model.handleChange(message.change, message.notify);
    }

  });
});
