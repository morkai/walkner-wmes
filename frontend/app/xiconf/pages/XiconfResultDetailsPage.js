// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../XiconfResult',
  '../views/XiconfResultDetailsView',
  'app/xiconf/templates/downloadAction'
], function(
  t,
  bindLoadingMessage,
  View,
  XiconfResult,
  XiconfResultDetailsView,
  downloadActionTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'xiconfResultDetails',

    remoteTopics: {
      'xiconf.synced': function(message)
      {
        var order = this.model.get('order');

        if (Array.isArray(message.orders) && order && message.orders.indexOf(order._id) !== -1)
        {
          this.promised(this.model.fetch());
        }
      }
    },

    breadcrumbs: function()
    {
      return [
        t.bound('xiconf', 'BREADCRUMBS:base'),
        {
          label: t.bound('xiconf', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('xiconf', 'BREADCRUMBS:details')
      ];
    },

    actions: function()
    {
      var workflow = this.model.get('workflow');
      var feature = this.model.get('feature');
      var url = this.model.url() + ';';

      return [{
        template: function()
        {
          return downloadActionTemplate({
            workflow: typeof workflow === 'string' && workflow.length ? (url + 'workflow') : null,
            feature: typeof feature === 'string' && feature.length ? (url + 'feature') : null
          });
        }
      }];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new XiconfResult({_id: this.options.modelId}), this);

      this.view = new XiconfResultDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
