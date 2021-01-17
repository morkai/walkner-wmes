// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/EditFormPage',
  'app/planning-orderGroups/OrderGroupCollection',
  'app/planning/views/PlanSettingsView'
], function(
  EditFormPage,
  OrderGroupCollection,
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
          label: this.t('BREADCRUMB:base'),
          href: '#planning/plans'
        },
        {
          label: this.model.getLabel(),
          href: '#planning/plans/' + this.model.id
        },
        {
          label: this.t('BREADCRUMB:settings')
        }
      ];
    },

    getFormViewOptions: function()
    {
      return {
        editMode: true,
        model: this.model,
        formMethod: 'PUT',
        formAction: this.model.url(),
        formActionText: this.t('settings:submit'),
        failureText: this.t('settings:editFailure'),
        panelTitleText: this.t('settings:title'),
        back: this.options.back,
        orderGroups: this.orderGroups
      };
    },

    defineModels: function()
    {
      EditFormPage.prototype.defineModels.apply(this, arguments);

      this.orderGroups = new OrderGroupCollection([], {rqlQuery: 'sort(name)&limit(0)'});
      this.orderGroups.comparator = function(a, b)
      {
        return a.get('name').localeCompare(b.get('name'));
      };
    },

    load: function(when)
    {
      return when(this.orderGroups.fetch(), this.model.fetch());
    }

  });
});
