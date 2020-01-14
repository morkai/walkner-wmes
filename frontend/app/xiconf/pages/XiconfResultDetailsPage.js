// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      'xiconf.results.synced': function(message)
      {
        var order = this.model.get('order');

        if (Array.isArray(message.orders) && order && message.orders.indexOf(order._id) !== -1)
        {
          this.promised(this.model.fetch());
        }
      },
      'xiconf.results.toggled': function(message)
      {
        if (this.model.id === message.resultId)
        {
          this.model.set('cancelled', message.cancelled);
        }
      }
    },

    breadcrumbs: function()
    {
      return [
        t.bound('xiconf', 'BREADCRUMB:base'),
        {
          label: t.bound('xiconf', 'BREADCRUMB:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('xiconf', 'BREADCRUMB:details')
      ];
    },

    actions: function()
    {
      var page = this;
      var model = page.model;
      var workflow = model.get('workflow');
      var feature = model.get('feature');
      var gprsOrderFile = model.get('gprsOrderFile');
      var gprsInputFile = model.get('gprsInputFile');
      var gprsOutputFile = model.get('gprsOutputFile');
      var url = model.url() + ';';

      return [{
        template: function()
        {
          return page.renderPartialHtml(downloadActionTemplate, {
            files: {
              gprsOrderFile: gprsOrderFile && gprsOrderFile.length ? (url + 'gprsOrder') : null,
              workflow: workflow && workflow.length ? (url + 'workflow') : null,
              feature: feature && feature.length ? (url + 'feature') : null,
              gprsInputFile: gprsInputFile && gprsInputFile.length ? (url + 'gprsInput') : null,
              gprsOutputFile: gprsOutputFile && gprsOutputFile.length ? (url + 'gprsOutput') : null
            }
          });
        }
      }];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new XiconfResult({_id: this.options.modelId}), this);

      this.view = new XiconfResultDetailsView({
        model: this.model,
        tab: this.options.tab
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
