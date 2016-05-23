// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/subdivisions/templates/form'
], function(
  aors,
  downtimeReasons,
  OrgUnitDropdownsView,
  FormView,
  idAndLabel,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.orgUnitDropdownsView = new OrgUnitDropdownsView({
        orgUnit: OrgUnitDropdownsView.ORG_UNIT.DIVISION,
        required: true
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
        placeholder: ' ',
        allowClear: true,
        data: aors.map(idAndLabel)
      });

      this.$id('initialDowntime').select2({
        placeholder: ' ',
        allowClear: true,
        data: downtimeReasons.map(idAndLabel)
      });

      this.$id('autoDowntime').select2({
        placeholder: ' ',
        allowClear: true,
        data: downtimeReasons.map(idAndLabel)
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
      data.autoDowntime = downtimeReasons.get(data.autoDowntime) ? data.autoDowntime : null;
      data.initialDowntime = downtimeReasons.get(data.initialDowntime) ? data.initialDowntime : null;

      return data;
    }

  });
});
