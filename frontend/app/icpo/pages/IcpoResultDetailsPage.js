// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../IcpoResult',
  '../views/IcpoResultDetailsView',
  'app/icpo/templates/downloadAction'
], function(
  t,
  bindLoadingMessage,
  View,
  IcpoResult,
  IcpoResultDetailsView,
  downloadActionTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('icpo', 'BREADCRUMB:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('icpo', 'BREADCRUMB:details')
      ];
    },

    actions: function()
    {
      var model = this.model;
      var url = model.url() + ';';

      return [{
        template: function()
        {
          var files = {};

          ['orderData', 'driverData', 'gprsData', 'inputData', 'outputData'].forEach(function(type)
          {
            var data = model.get(type);

            files[type] = data && data.length ? (url + type) : null;
          });

          return downloadActionTemplate({files: files});
        }
      }];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new IcpoResult({_id: this.options.modelId}), this);

      this.view = new IcpoResultDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
