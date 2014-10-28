// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
          label: t.bound('icpo', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('icpo', 'BREADCRUMBS:details')
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
