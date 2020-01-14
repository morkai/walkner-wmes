// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/EditFormPage',
  'app/planning/views/PlanSettingsView'
], function(
  t,
  EditFormPage,
  PlanSettingsView
) {
  'use strict';

  return EditFormPage.extend({

    baseBreadcrumb: true,
    FormView: PlanSettingsView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('planning', 'BREADCRUMB:base'),
          href: '#planning/plans'
        },
        {
          label: this.model.getLabel(),
          href: '#planning/plans/' + this.model.id
        },
        {
          label: t.bound('planning', 'BREADCRUMB:settings')
        }
      ];
    },

    getFormViewOptions: function()
    {
      var model = this.model;
      var nlsDomain = model.getNlsDomain();

      return {
        editMode: true,
        model: model,
        formMethod: 'PUT',
        formAction: model.url(),
        formActionText: t(nlsDomain, 'settings:submit'),
        failureText: t(nlsDomain, 'settings:editFailure'),
        panelTitleText: t(nlsDomain, 'settings:title'),
        back: this.options.back
      };
    }

  });
});
