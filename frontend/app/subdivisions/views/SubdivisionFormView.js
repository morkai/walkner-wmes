define([
  'underscore',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/views/FormView',
  'app/subdivisions/templates/form',
  'i18n!app/nls/divisions'
], function(
  _,
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
    }

  });
});
