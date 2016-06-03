// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  'app/qiResults/dictionaries',
  '../views/QiResultDetailsView'
], function(
  t,
  DetailsPage,
  pageActions,
  qiDictionaries,
  QiResultDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: true,

    DetailsView: QiResultDetailsView,

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

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      qiDictionaries.unload();
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
