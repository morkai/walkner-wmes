// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/opinionSurveyOmrResults/templates/form'
], function(
  $,
  _,
  i18n,
  viewport,
  FormView,
  idAndLabel,
  template
) {
  'use strict';

  var t = i18n.forDomain('opinionSurveyOmrResults');

  return FormView.extend({

    template: template,

    events: _.extend({



    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);


    },

    destroy: function()
    {

    },

    serialize: function()
    {
      var model = this.model;

      return _.extend(FormView.prototype.serialize.call(this), {

      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);


    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      return formData;
    },

    serializeForm: function(formData)
    {
      return formData;
    }

  });
});
