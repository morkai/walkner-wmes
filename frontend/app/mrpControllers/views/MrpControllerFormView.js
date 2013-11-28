define([
  'underscore',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/core/views/FormView',
  'app/mrpControllers/templates/form',
  'i18n!app/nls/mrpControllers'
], function(
  _,
  divisions,
  subdivisions,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'mrpControllerForm',

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        divisions: this.serializeSubdivisionOptions()
      });
    },

    serializeSubdivisionOptions: function()
    {
      var divisionOptgroups = [];
      var lastDivision = null;

      subdivisions.forEach(function(subdivisionModel)
      {
        var divisionModel = divisions.get(subdivisionModel.get('division'));

        if (!divisionModel)
        {
          return;
        }

        var division = {
          _id: divisionModel.get('_id'),
          label: divisionModel.getLabel(),
          subdivisions: []
        };

        if (lastDivision === null || division._id !== lastDivision._id)
        {
          lastDivision = division;

          divisionOptgroups.push(division);
        }

        lastDivision.subdivisions.push({
          value: subdivisionModel.get('_id'),
          label: subdivisionModel.getLabel()
        });
      });

      return divisionOptgroups;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('_id').attr('disabled', true);
      }

      this.$id('subdivision').select2({
        formatSelection: function(obj)
        {
          return obj.element[0].parentNode.label + ' \\ ' + obj.text;
        }
      });
    }

  });
});
