// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  'app/core/util/html2pdf',
  'app/printers/views/PrinterPickerView',
  '../dictionaries',
  '../views/QiResultDetailsView',
  '../views/QiResultHistoryView',
  'app/qiResults/templates/detailsPage'
], function(
  t,
  DetailsPage,
  pageActions,
  html2pdf,
  PrinterPickerView,
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
      var view = this;
      var model = view.model;
      var actions = [];

      if (!model.get('ok'))
      {
        actions.push(PrinterPickerView.pageAction({view: view, tag: 'qi'}, function(printer)
        {
          view.ajax({url: model.url() + '.html', dataType: 'html'}).done(function(html)
          {
            html2pdf(html, {orientation: 'landscape'}, printer);
          });
        }));
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

      this.setView('#-properties', this.detailsView);
      this.setView('#-history', this.historyView);
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
