// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/OpinionSurveyDetailsView',
  'app/opinionSurveys/templates/printAction'
], function(
  t,
  DetailsPage,
  pageActions,
  dictionaries,
  OpinionSurveyDetailsView,
  printActionTemplate
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: true,
    DetailsView: OpinionSurveyDetailsView,

    actions: function()
    {
      var page = this;
      var model = page.model;
      var nlsDomain = model.getNlsDomain();

      return [
        {
          label: t.bound(nlsDomain, 'PAGE_ACTION:print'),
          icon: 'print',
          template: function()
          {
            return page.renderPartial(printActionTemplate, {
              surveyId: model.id,
              langs: ['pl'].concat(Object.keys(model.get('lang') || {}))
            })[0].outerHTML;
          }
        },
        {
          label: t.bound(nlsDomain, 'PAGE_ACTION:editEmployeeCount'),
          icon: 'users',
          href: model.genClientUrl('editEmployeeCount')
        },
        pageActions.edit(model, false),
        pageActions.delete(model, false)
      ];
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    load: function(when)
    {
      return when(this.model.fetch(), dictionaries.load());
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
