define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/pressWorksheets/templates/filter'
], function(
  _,
  js2form,
  t,
  user,
  time,
  Model,
  View,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('pressWorksheetsFilter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.toggleButtonGroup('shift');
      this.toggleButtonGroup('type');
    },

    toggleButtonGroup: function(groupName)
    {
      this.$id(groupName).find('input:checked').parent().addClass('active');
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        date: '',
        shift: 0,
        type: 'any',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };
      var view = this;

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        if (term.name !== 'eq' && term.name !== 'in')
        {
          return;
        }

        var property = term.args[0];

        switch (property)
        {
          case 'date':
            if (term.name === 'in')
            {
              formData.date = time.format(term.args[1][0], 'YYYY-MM-DD');
            }
            else
            {
              var dateMoment = time.getMoment(term.args[1]);

              formData.date = dateMoment.format('YYYY-MM-DD');
              formData.shift = view.getShiftNoFromMoment(dateMoment);
            }
            break;

          case 'shift':
          case 'type':
            formData[property] = term.args[1];
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var selector = [];
      var dateMoment = time.getMoment(this.$id('date').val());
      var shiftNo = parseInt(this.$('input[name=shift]:checked').val(), 10);
      var type = this.$('input[name=type]:checked').val();

      this.setHoursByShiftNo(dateMoment, shiftNo);

      if (dateMoment.isValid())
      {
        if (shiftNo === 0)
        {
          var startTime = dateMoment.valueOf();

          selector.push({
            name: 'in',
            args: [
              'date',
              [
                startTime + 6 * 3600 * 1000,
                startTime + 14 * 3600 * 1000,
                startTime + 22 * 3600 * 1000
              ]
            ]
          });
        }
        else
        {
          selector.push({name: 'eq', args: ['date', dateMoment.valueOf()]});
        }
      }
      else if (shiftNo !== 0)
      {
        selector.push({name: 'eq', args: ['shift', shiftNo]});
      }

      if (type !== 'any')
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    getShiftNoFromMoment: function(moment)
    {
      var hours = moment.hours();

      if (hours === 6)
      {
        return 1;
      }

      if (hours === 14)
      {
        return 2;
      }

      if (hours === 22)
      {
        return 3;
      }

      return 0;
    },

    setHoursByShiftNo: function(moment, shiftNo)
    {
      if (shiftNo === 1)
      {
        moment.hours(6);
      }
      else if (shiftNo === 2)
      {
        moment.hours(14);
      }
      else if (shiftNo === 3)
      {
        moment.hours(22);
      }
      else
      {
        moment.hours(0);
      }
    }

  });
});
