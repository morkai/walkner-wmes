// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/data/divisions',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/pressWorksheets/templates/filter'
], function(
  time,
  divisions,
  FilterView,
  setUpUserSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        date: '',
        shift: 0,
        type: 'any',
        divisions: divisions
          .filter(function(division) { return division.get('type') === 'prod'; })
          .map(function(division) { return division.id; }),
        mine: false,
        userType: 'operators',
        user: {
          id: null,
          text: null
        }
      };
    },

    termToForm: {
      'date': function(propertyName, term, formData)
      {
        if (term.name === 'in')
        {
          formData.date = time.format(term.args[1][0], 'YYYY-MM-DD');
        }
        else
        {
          var dateMoment = time.getMoment(term.args[1]);

          formData.date = dateMoment.format('YYYY-MM-DD');
          formData.shift = this.getShiftNoFromMoment(dateMoment);
        }
      },
      'shift': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'divisions': function(propertyName, term, formData)
      {
        formData.divisions = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'master.id': function(propertyName, term, formData)
      {
        formData.userType = propertyName.split('.')[0];
        formData.user.id = term.args[1];

        if (formData.user.text === null)
        {
          formData.user.text = term.args[1];
        }
      },
      'user': function(propertyName, term, formData)
      {
        formData.user.text = term.args[1];
      },
      'type': 'shift',
      'mine': 'shift',
      'operator.id': 'master.id',
      'operators.id': 'master.id'
    },

    serialize: function()
    {
      var data = FilterView.prototype.serialize.call(this);

      data.divisions = divisions
        .filter(function(division)
        {
          return division.get('type') === 'prod';
        })
        .sort(function(a, b)
        {
          return a.getLabel().localeCompare(b.getLabel());
        })
        .map(function(division)
        {
          return {
            id: division.id,
            label: division.id,
            title: division.get('description')
          };
        });

      return data;
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('shift');
      this.toggleButtonGroup('type');
      this.toggleButtonGroup('divisions');
      this.toggleButtonGroup('mine');

      setUpUserSelect2(this.$id('user')).select2(
        'data', this.formData.user.id === null ? null : this.formData.user
      );
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var dateMoment = time.getMoment(this.$id('date').val());
      var shiftNo = parseInt(this.$('input[name=shift]:checked').val(), 10);
      var type = this.$('input[name=type]:checked').val();
      var divisions = this.getButtonGroupValue('divisions');
      var mine = this.$('input[name=mine]:checked').val();
      var userType = this.$('input[name=userType]:checked').val();
      var user = this.$id('user').select2('data');

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

      if (divisions.length === 1)
      {
        selector.push({name: 'eq', args: ['divisions', divisions[0]]});
      }
      else if (divisions.length > 1)
      {
        selector.push({name: 'in', args: ['divisions', divisions]});
      }

      if (user)
      {
        selector.push({name: 'eq', args: [userType + '.id', user.id]});
        selector.push({name: 'eq', args: ['user', user.text]});
      }

      if (mine)
      {
        selector.push({name: 'eq', args: ['mine', 1]});

        rqlQuery.sort = {
          createdAt: -1
        };
      }
      else
      {
        rqlQuery.sort = {
          date: -1
        };
      }
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
