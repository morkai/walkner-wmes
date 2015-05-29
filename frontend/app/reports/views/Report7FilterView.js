// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/data/aors',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/reports/templates/report7Filter'
], function(
  _,
  aors,
  FilterView,
  idAndLabel,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      'aors': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].split(',');
      },
      'statuses': 'aors'
    },

    serialize: function()
    {
      return _.extend(FilterView.prototype.serialize.call(this), {
        aors: []
      });
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('statuses');

      this.$id('aors').select2({
        multiple: true,
        data: aors.map(idAndLabel)
      });
    },

    serializeQueryToForm: function()
    {
      return {
        aors: this.model.get('aors').join(','),
        statuses: this.model.get('statuses')
      };
    },

    changeFilter: function()
    {
      var query = {
        statuses: this.getButtonGroupValue('statuses'),
        aors: this.$id('aors').val().split(',').filter(function(aor) { return aor.length > 0; })
      };

      if (!query.statuses.length)
      {
        this.$id('statuses').find('.btn').click();
      }

      this.model.set(query, {reset: true});
    }

  });
});
