// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/OpinionSurveyDetailsView'
], function(
  t,
  DetailsPage,
  pageActions,
  dictionaries,
  OpinionSurveyDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: true,
    DetailsView: OpinionSurveyDetailsView,

    actions: function()
    {
      var model = this.model;
      var nlsDomain = model.getNlsDomain();

      return [
        {
          label: t.bound(nlsDomain, 'PAGE_ACTION:print'),
          icon: 'print',
          href: '/opinionSurveys/' + model.id + '.pdf'
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
