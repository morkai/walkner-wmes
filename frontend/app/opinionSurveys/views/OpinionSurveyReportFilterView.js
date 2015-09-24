// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  '../dictionaries',
  'app/opinionSurveys/templates/reportFilter'
], function(
  _,
  FilterView,
  idAndLabel,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('surveys').select2({
        width: 300,
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        data: this.surveys.map(idAndLabel)
      });

      this.$id('divisions').select2({
        width: 250,
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        data: dictionaries.divisions.map(idAndLabel)
      });

      this.$id('superiors').select2({
        width: 500,
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        id: function(superior) { return superior._id; },
        formatSelection: function(superior) { return superior.short; },
        data: {
          results: this.surveys.getSuperiors(),
          text: 'full'
        }
      });

      this.$id('employers').select2({
        width: 200,
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        data: dictionaries.employers.map(idAndLabel)
      });
    },

    serializeQueryToForm: function()
    {
      return {
        surveys: this.query.get('surveys').join(','),
        divisions: this.query.get('divisions').join(','),
        superiors: this.query.get('superiors').join(','),
        employers: this.query.get('employers').join(',')
      };
    },

    changeFilter: function()
    {
      this.query.set(this.serializeFormToQuery(), {reset: true});
    },

    serializeFormToQuery: function()
    {
      return {
        surveys: this.$id('surveys').val().split(','),
        divisions: this.$id('divisions').val().split(','),
        superiors: this.$id('superiors').val().split(','),
        employers: this.$id('employers').val().split(',')
      };
    }

  });
});
