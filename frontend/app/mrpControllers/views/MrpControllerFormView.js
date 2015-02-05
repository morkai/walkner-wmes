// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/data/mrpControllers',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/views/FormView',
  'app/mrpControllers/templates/form'
], function(
  time,
  mrpControllers,
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
        orgUnit: OrgUnitDropdownsView.ORG_UNIT.SUBDIVISION
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var editMode = this.options.editMode;

      if (editMode)
      {
        this.$id('_id').attr('disabled', true);
      }

      var replacedByData = mrpControllers.map(function(model)
      {
        return {id: model.id, text: model.getLabel()};
      });

      if (editMode)
      {
        var thisId = this.model.id;

        replacedByData = replacedByData.filter(function(model) { return model.id !== thisId; });
      }

      this.$id('replacedBy').select2({
        allowClear: true,
        placeholder: ' ',
        data: replacedByData
      });

      var oudv = this.orgUnitDropdownsView;

      this.listenToOnce(oudv, 'afterRender', function()
      {
        oudv.selectValue(this.model).focus();
        oudv.$id('division').select2('enable', !editMode);
        oudv.$id('subdivision').select2('enable', !editMode);
      });
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

      return data;
    }

  });
});
