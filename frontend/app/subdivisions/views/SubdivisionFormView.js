// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/data/aors',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/views/FormView',
  'app/subdivisions/templates/form'
], function(
  aors,
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
        orgUnit: OrgUnitDropdownsView.ORG_UNIT.DIVISION
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      var oudv = this.orgUnitDropdownsView;

      this.listenToOnce(oudv, 'afterRender', function()
      {
        oudv.selectValue(this.model).focus();
        oudv.$id('division').select2('enable', !this.options.editMode);
      });

      this.$id('prodTaskTags').select2({
        tags: this.model.allTags || [],
        tokenSeparators: [',']
      });

      this.$id('aor').select2({
        allowClear: true,
        data: aors.map(function(aor)
        {
          return {
            id: aor.id,
            text: aor.getLabel()
          };
        })
      });
    },

    serializeToForm: function()
    {
      var data = this.model.toJSON();

      data.prodTaskTags = data.prodTaskTags ? data.prodTaskTags.join(',') : '';

      return data;
    },

    serializeForm: function(data)
    {
      data.prodTaskTags = typeof data.prodTaskTags === 'string' ? data.prodTaskTags.split(',') : [];
      data.aor = aors.get(data.aor) ? data.aor : null;

      return data;
    }

  });
});
