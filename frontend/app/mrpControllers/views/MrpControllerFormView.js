define([
  'app/data/views/OrgUnitDropdownsView',
  'app/core/views/FormView',
  'app/mrpControllers/templates/form'
], function(
  OrgUnitDropdownsView,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'mrpControllerForm',

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

      if (this.options.editMode)
      {
        this.$id('_id').attr('disabled', true);
      }

      this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', function()
      {
        this.orgUnitDropdownsView.selectValue(this.model).focus();
      });
    }

  });
});
