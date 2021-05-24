// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/orgUnits/views/OrgUnitDropdownsView',
  'app/orgUnits/util/changeWarning',
  'app/core/views/FormView',
  'app/workCenters/templates/form'
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
        orgUnit: OrgUnitDropdownsView.ORG_UNIT.PROD_FLOW,
        required: true
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var editMode = this.options.editMode;

      if (editMode)
      {
        this.$id('_id').attr('readonly', true);
      }

      var oudv = this.orgUnitDropdownsView;

      this.listenToOnce(oudv, 'afterRender', function()
      {
        oudv.selectValue(this.model).focus();
        oudv.$id('division').select2('enable', !editMode);
        oudv.$id('subdivision').select2('enable', !editMode);
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

    serializeForm: function(data)
    {
      var deactivatedAt = time.getMoment(data.deactivatedAt || null);

      data.deactivatedAt = deactivatedAt.isValid() ? deactivatedAt.toISOString() : null;

      if (data.prodFlow)
      {
        data.mrpController = null;
      }
      else
      {
        data.prodFlow = null;
      }

      return data;
    }

  });
});
