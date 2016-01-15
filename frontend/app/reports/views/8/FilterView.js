// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'form2js',
  'select2',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/orgUnits',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/reports/Report8Query',
  'app/reports/templates/8/filter'
], function(
  _,
  $,
  form2js,
  select2,
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

      'change #-from': 'setUpProdLineSelect2',
      'change #-to': 'setUpProdLineSelect2',
      'change [name="divisions[]"]': 'setUpProdLineSelect2',
      'change [name="subdivisionTypes[]"]': 'setUpProdLineSelect2'

    }, FilterView.prototype.events),

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      var subdivisionToProdLines = {};

      orgUnits.getAllByType('prodLine').forEach(function(prodLine)
      {
        var prodLineUnits = orgUnits.getAllForProdLine(prodLine);

        if (!subdivisionToProdLines[prodLineUnits.subdivision])
        {
          subdivisionToProdLines[prodLineUnits.subdivision] = [];
        }

        var deactivatedAt = prodLine.get('deactivatedAt');

        subdivisionToProdLines[prodLineUnits.subdivision].push({
          id: prodLine.id,
          text: prodLine.get('description'),
          deactivatedAt: deactivatedAt ? Date.parse(deactivatedAt) : 0
        });
      });

      this.subdivisionToProdLines = subdivisionToProdLines;
    },

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

      this.setUpProdLineSelect2();
    },

    setUpProdLineSelect2: function()
    {
      var timeRange = this.serializeTimeRange();
      var selectedDivisions = this.getCheckboxValues('[name="divisions[]"]:checked');
      var selectedSubdivisionTypes = this.getCheckboxValues('[name="subdivisionTypes[]"]:checked');

      if (!selectedDivisions.length)
      {
        selectedDivisions = this.getCheckboxValues('[name="divisions[]"]');
      }

      if (!selectedSubdivisionTypes.length)
      {
        selectedSubdivisionTypes = this.getCheckboxValues('[name="subdivisionTypes[]"]');
      }

      var subdivisionToProdLines = this.subdivisionToProdLines;
      var data = [];
      var availableProdLineIds = {};

      _.forEach(selectedDivisions, function(divisionId)
      {
        var division = orgUnits.getByTypeAndId('division', divisionId);
        var subdivisions = orgUnits.getChildren(division).filter(function(subdivision)
        {
          return _.includes(selectedSubdivisionTypes, subdivision.get('type'));
        });

        _.forEach(subdivisions, function(subdivision)
        {
          var item = {
            text: division.id + ' \\ ' + subdivision.getLabel(),
            children: []
          };

          _.forEach(subdivisionToProdLines[subdivision.id], function(prodLine)
          {
            if (!prodLine.deactivatedAt || prodLine.deactivatedAt >= timeRange.from)
            {
              item.children.push(prodLine);
              availableProdLineIds[prodLine.id] = true;
            }
          });

          if (item.children.length)
          {
            data.push(item);
          }
        });
      });

      var matcher = $().select2.defaults.matcher;
      var $prodLines = this.$id('prodLines');

      $prodLines.val($prodLines.val().split(',').filter(function(prodLineId)
      {
        return availableProdLineIds[prodLineId];
      }));

      $prodLines.select2({
        width: 322,
        multiple: true,
        data: data.length === 1 ? data[0].children : data,
        dropdownCssClass: 'reports-8-prodLines-select2',
        matcher: function(term, text, option)
        {
          return matcher(term, option.id) || matcher(term, text);
        },
        formatResult: function(item, $container, query, e)
        {
          if (!item.id)
          {
            return e(item.text);
          }

          var html = [];

          select2.util.markMatch(item.id, query.term, html, e);

          html.push(': ');
          html.push('<span style="text-decoration: ' + (item.deactivatedAt ? 'line-through' : 'initial') + '">');
          select2.util.markMatch(item.text, query.term, html, e);
          html.push('</span>');

          return html.join('');
        },
        formatSelection: function(item)
        {
          return item.deactivatedAt
            ? ('<span style="text-decoration: line-through">' + item.id + '</span>')
            : item.id;
        }
      });
    },

    getCheckboxValues: function(selector)
    {
      return this.$(selector).get().map(function(d) { return d.value; });
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
      var query = _.extend(
        _.result(this.model, 'defaults'),
        form2js(this.el),
        {_rnd: Math.random()}
      );

      _.extend(query, this.serializeTimeRange(query));

      this.$id('from').val(time.format(query.from, 'YYYY-MM-DD'));
      this.$id('to').val(time.format(query.to, 'YYYY-MM-DD'));

      ['days', 'shifts', 'divisions', 'subdivisionTypes'].forEach(this.applyAllOptionsIfEmpty.bind(this, query));

      delete query.visibleSeries;

      return query;
    },

    serializeTimeRange: function(query)
    {
      if (!query)
      {
        query = {
          from: this.$id('from').val(),
          to: this.$id('to').val(),
          interval: this.$('[name="interval"]:checked').val()
        };
      }

      var fromTime = time.getMoment(query.from, 'YYYY-MM-DD').startOf(query.interval).valueOf();
      var toMoment = time.getMoment(query.to, 'YYYY-MM-DD').startOf(query.interval);

      if (fromTime === toMoment.valueOf())
      {
        toMoment.add(1, query.interval);
      }

      return {
        from: fromTime,
        to: toMoment.valueOf()
      };
    }

  });
});
