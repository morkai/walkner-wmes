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

    idPrefix: 'subdivisionForm',

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

      this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', function()
      {
        this.orgUnitDropdownsView.selectValue(this.model).focus();
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
