// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/orgUnits',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/kanbanSupplyAreas/templates/form'
], function(
  _,
  orgUnits,
  idAndLabel,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-_id': 'validateId'

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.validateId = _.debounce(this.validateId.bind(this), 500);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('lines').select2({
        multiple: true,
        data: orgUnits.getAllByType('prodLine')
          .filter(function(l) { return !l.get('deactivatedAt'); })
          .map(idAndLabel)
      });

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('name').focus();
      }
      else
      {
        this.$id('_id').focus();
      }
    },

    serializeToForm: function() // eslint-disable-line no-unused-vars
    {
      var obj = this.model.toJSON();

      obj.lines = (obj.lines || []).join(',');

      return obj;
    },

    serializeForm: function(formData)
    {
      formData.lines = (formData.lines || '').split(',').filter(function(d) { return !!d.length; });

      return formData;
    },

    validateId: function()
    {
      var view = this;
      var $id = view.$id('_id');
      var req = view.ajax({method: 'HEAD', url: '/kanban/supplyAreas/' + $id.val()});

      req.fail(function()
      {
        $id[0].setCustomValidity('');
      });

      req.done(function()
      {
        $id[0].setCustomValidity(req.status === 200 ? view.t('FORM:ERROR:alreadyExists') : '');
      });
    }

  });
});
