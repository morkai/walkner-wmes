// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/data/views/OrgUnitDropdownsView',
  'app/core/views/FormView',
  'app/prodLines/templates/form'
], function(
  OrgUnitDropdownsView,
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
        orgUnit: OrgUnitDropdownsView.ORG_UNIT.WORK_CENTER
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
      }

      this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', function()
      {
        this.orgUnitDropdownsView.selectValue(this.model).focus();
      });
    },

    serializeForm: function(data)
    {
      if (!data.workCenter)
      {
        data.workCenter = null;
      }

      if (!data.inventoryNo)
      {
        data.inventoryNo = null;
      }

      return data;
    }

  });
});
