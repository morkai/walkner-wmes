// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/QiResultDetailsView',
  '../views/QiResultHistoryView',
  'app/qiResults/templates/detailsPage'
], function(
  t,
  DetailsPage,
  pageActions,
  qiDictionaries,
  QiResultDetailsView,
  QiResultHistoryView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    baseBreadcrumb: true,

    actions: function()
    {
      var model = this.model;
      var actions = [];

      if (!model.get('ok'))
      {
        var pdfUrl = model.url() + '.pdf';

        actions.push({
          id: 'print',
          icon: 'print',
          label: t(model.getNlsDomain(), 'PAGE_ACTION:print'),
          href: pdfUrl,
          callback: function(e)
          {
            if (e.button !== 0)
            {
              return;
            }

            var win = window.open(pdfUrl);

            if (win)
            {
              win.onload = win.print.bind(win);

              return false;
            }

            window.location.href = pdfUrl;
          }
        });
      }

      if (model.canEdit())
      {
        actions.push(pageActions.edit(model, false));
      }

      if (model.canDelete())
      {
        actions.push(pageActions.delete(model, false));
      }

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.setView('.qiResults-detailsPage-properties', this.detailsView);
      this.setView('.qiResults-detailsPage-history', this.historyView);
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      qiDictionaries.unload();
    },

    defineViews: function()
    {
      this.detailsView = new QiResultDetailsView({model: this.model});
      this.historyView = new QiResultHistoryView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch(), qiDictionaries.load());
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      qiDictionaries.load();
    }

  });
});
