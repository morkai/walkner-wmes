// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/DetailsView',
  'app/orders/templates/details'
], function(
  t,
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    remoteTopics: {},

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    getTemplateData: function()
    {
      return {
        model: this.model.serialize({
          delayReasons: this.delayReasons
        }),
        panelType: this.options.panelType || 'primary',
        panelTitle: this.options.panelTitle || t('core', 'PANEL:TITLE:details'),
        linkOrderNo: !!this.options.linkOrderNo
      };
    }

  });
});
