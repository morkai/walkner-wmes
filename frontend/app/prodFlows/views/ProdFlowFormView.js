// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/orgUnits/views/OrgUnitDropdownsView',
  'app/orgUnits/util/changeWarning',
  'app/core/views/FormView',
  'app/prodFlows/templates/form'
], function(
  time,
  OrgUnitDropdownsView,
  changeWarning,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.orgUnitDropdownsView = new OrgUnitDropdownsView({
        orgUnit: OrgUnitDropdownsView.ORG_UNIT.MRP_CONTROLLER,
        multiple: true,
        required: true
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var addMode = !this.options.editMode;
      var oudv = this.orgUnitDropdownsView;

      this.listenToOnce(oudv, 'afterRender', function()
      {
        oudv.selectValue(this.model).focus();
        oudv.$id('division').select2('enable', addMode);
        oudv.$id('subdivision').select2('enable', addMode);
      });

      changeWarning(this);
    },

    serializeToForm: function()
    {
      var data = FormView.prototype.serializeToForm.call(this);

      if (data.deactivatedAt)
      {
        data.deactivatedAt = time.format(data.deactivatedAt, 'YYYY-MM-DD');
      }

      return data;
    },

    serializeForm: function(formData)
    {
      var deactivatedAt = time.getMoment(formData.deactivatedAt || null);

      formData.deactivatedAt = deactivatedAt.isValid() ? deactivatedAt.toISOString() : null;

      formData.mrpController = typeof formData.mrpController === 'string' ? formData.mrpController.split(',') : [];

      return formData;
    }

  });
});
