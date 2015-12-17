// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'form2js',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/orgUnits',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  '../Report8Query',
  'app/reports/templates/report8Filter'
], function(
  _,
  form2js,
  t,
  time,
  viewport,
  orgUnits,
  FilterView,
  idAndLabel,
  Report8Query,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.extend({

    }, FilterView.prototype.events),

    serialize: function()
    {
      return _.extend(FilterView.prototype.serialize.call(this), {
        numericProps: Report8Query.NUMERIC_PROPS,
        divisions: orgUnits.getAllByType('division')
          .filter(function(division) { return division.get('type') === 'prod'; })
          .map(idAndLabel)
      });
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('prodLines').select2({
        width: 322,
        multiple: true,
        data: orgUnits.getAllByType('prodLine').map(idAndLabel)
      });
    },

    serializeQueryToForm: function()
    {
      var formData = this.model.toJSON();

      formData.from = time.format(formData.from, 'YYYY-MM-DD');
      formData.to = time.format(formData.to, 'YYYY-MM-DD');

      ['days', 'shifts', 'divisions', 'subdivisionTypes'].forEach(this.applyAllOptionsIfEmpty.bind(this, formData));

      formData.prodLines = _.isArray(formData.prodLines) ? formData.prodLines.join(',') : '';

      return formData;
    },

    applyAllOptionsIfEmpty: function(obj, prop)
    {
      if (_.isEmpty(obj[prop]))
      {
        obj[prop] = this.$('input[name="' + prop + '[]"]').map(function() { return this.value; }).get();
      }
    },

    changeFilter: function()
    {
      this.model.set(this.serializeFormToQuery(), {reset: true});
    },

    serializeFormToQuery: function()
    {
      var query = _.extend(_.result(this.model, 'defaults'), form2js(this.el), {
        _rnd: Math.random()
      });
      var fromTime = time.getMoment(query.from, 'YYYY-MM-DD').startOf(query.interval).valueOf();
      var toMoment = time.getMoment(query.to, 'YYYY-MM-DD').startOf(query.interval);

      if (fromTime === toMoment.valueOf())
      {
        toMoment.add(1, query.interval);
      }

      query.from = fromTime;
      query.to = toMoment.valueOf();

      this.$id('from').val(time.format(query.from, 'YYYY-MM-DD'));
      this.$id('to').val(time.format(query.to, 'YYYY-MM-DD'));

      ['days', 'shifts', 'divisions', 'subdivisionTypes'].forEach(this.applyAllOptionsIfEmpty.bind(this, query));

      delete query.visibleSeries;

      return query;
    }

  });
});
