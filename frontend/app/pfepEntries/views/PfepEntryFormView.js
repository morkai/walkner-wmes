// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  '../PfepEntry',
  'app/pfepEntries/templates/form'
], function(
  _,
  $,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  FormView,
  setUpUserSelect2,
  PfepEntry,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.extend({



    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);


    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {

      });
    },

    checkValidity: function()
    {
      return true;
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      return formData;
    },

    serializeForm: function(formData)
    {
      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);
    }

  });
});
