// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/util/html2pdf',
  'app/printers/views/PrinterPickerView',
  '../HourlyPlan',
  '../views/HourlyPlanDetailsView',
  'app/hourlyPlans/templates/printableEntry'
], function(
  t,
  user,
  View,
  bindLoadingMessage,
  pageActions,
  html2pdf,
  PrinterPickerView,
  HourlyPlan,
  HourlyPlanDetailsView,
  printableEntryTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'hourlyPlanDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('hourlyPlans', 'BREADCRUMB:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var page = this;
      var actions = [
        PrinterPickerView.pageAction({view: page, tag: 'hourlyPlans'}, function(printer)
        {
          html2pdf(printableEntryTemplate(page.model.serializeToPrint()), printer);
        })
      ];

      if (page.model.isEditable(user))
      {
        actions.push(
          pageActions.edit(page.model),
          pageActions.delete(page.model)
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);
      this.view = new HourlyPlanDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
