// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-kaizens/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  $,
  currentUser,
  FilterView,
  dateTimeRange,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'createdAt',
      'workplace',
      'division',
      'building',
      'location',
      'station',
      'kind',
      'eventCategory',
      'limit'
    ],
    filterMap: {

    },

    template,

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'change input[name="userType"]': function()
      {
        if (this.$('input[name="userType"]:checked').val() === 'mine')
        {
          this.$id('user').select2('data', {
            id: currentUser.data._id,
            text: currentUser.getLabel()
          });
        }
      }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        userType: 'others'
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'workplace': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'division': 'workplace',
      'building': 'workplace',
      'location': 'workplace',
      'station': 'station',
      'eventCategory': 'workplace',
      'kind': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'status': 'kind',
      'users.user.id': (propertyName, term, formData) =>
      {
        const userId = term.args[1];

        formData.userType = userId === currentUser.data._id ? 'mine' : 'others';
        formData.user = userId;
      },
      'kom': (propertyName, term, formData) =>
      {
        if (!formData.status)
        {
          formData.status = [];
        }

        formData.status.push('kom');
      }
    },

    getTemplateData: function()
    {
      return {
        statuses: dictionaries.statuses.kaizen.concat('kom').map(status => ({
          value: status,
          label: dictionaries.getLabel('status', status)
        })),
        kinds: dictionaries.kinds.map(kind => ({
          value: kind.id,
          label: kind.getLabel({long: true})
        }))
      };
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      const status = this.$id('status').val();

      if (status && status.length)
      {
        const statuses = [];
        let kom = false;

        status.forEach(s =>
        {
          if (s === 'kom')
          {
            kom = true;
          }
          else
          {
            statuses.push(s);
          }
        });

        if (statuses.length === 1)
        {
          selector.push({name: 'eq', args: ['status', statuses[0]]});
        }
        else if (statuses.length > 1)
        {
          selector.push({name: 'in', args: ['status', statuses]});
        }

        if (kom)
        {
          selector.push({name: 'eq', args: ['kom', kom]});
        }
      }

      [
        'workplace',
        'division',
        'building',
        'location',
        'station',
        'kind',
        'activityKind'
      ].forEach(prop =>
      {
        const $prop = this.$id(prop);
        let value = $prop.val();

        if (!value || !value.length)
        {
          return;
        }

        if (typeof value === 'string')
        {
          value = value.split(',');
        }

        if ($prop[0].tagName === 'SELECT' && $prop[0].options.length === value.length)
        {
          return;
        }

        value = value.map(v => /^[0-9]+$/.test(v) ? parseInt(v, 10) : v);

        if (value.length === 1)
        {
          selector.push({name: 'eq', args: [prop, value[0]]});
        }
        else
        {
          selector.push({name: 'in', args: [prop, value]});
        }
      });

      const user = this.$id('user').val();

      if (user)
      {
        selector.push({name: 'eq', args: ['users.user.id', user]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        view: this,
        width: '100%'
      });

      this.setUpWorkplaceSelect2();
      this.setUpDivisionSelect2();
      this.setUpBuildingSelect2();
      this.setUpLocationSelect2();
      this.setUpStationSelect2();
      this.setUpEventCategorySelect2();
    },

    setUpWorkplaceSelect2: function()
    {
      this.$id('workplace').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.workplaces
          .filter(i => i.get('active'))
          .map(i => ({
            id: i.id,
            text: i.getLabel({long: true}),
            model: i
          })),
        formatSelection: ({model}, $el, e) => e(model.getLabel())
      });
    },

    setUpDivisionSelect2: function()
    {
      this.$id('division').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.workplaces
          .filter(i => i.get('active'))
          .map(workplace => ({
            text: workplace.getLabel({long: true}),
            children: dictionaries.divisions
              .filter(division => division.get('active') && division.get('workplace') === workplace.id)
              .map(division => ({
                id: division.id,
                text: division.getLabel({long: true}),
                model: division
              }))
          })),
        formatSelection: ({model}, $el, e) => e(model.getLabel())
      });
    },

    setUpBuildingSelect2: function()
    {
      this.$id('building').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.buildings
          .filter(i => i.get('active'))
          .map(i => ({
            id: i.id,
            text: i.getLabel({long: true}),
            model: i
          })),
        formatSelection: ({model}, $el, e) => e(model.getLabel())
      });
    },

    setUpLocationSelect2: function()
    {
      this.$id('location').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.locations
          .filter(i => i.get('active'))
          .map(i => ({
            id: i.id,
            text: i.getLabel({long: true}),
            model: i
          })),
        formatSelection: ({model}, $el, e) => e(model.getLabel())
      });
    },

    setUpStationSelect2: function()
    {
      const data = [];

      dictionaries.locations.forEach(location =>
      {
        if (!location.get('active'))
        {
          return;
        }

        const stations = dictionaries.stations.getByLocation(location.id).filter(s => s.get('active'));

        if (!stations.length)
        {
          return;
        }

        data.push({
          text: location.getLabel({long: true}),
          children: stations.map(station => ({
            id: station.id,
            text: station.getLabel({long: true}),
            model: station
          }))
        });
      });

      this.$id('station').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data,
        formatSelection: ({model}, $el, e) => e(model.getLabel({path: true}))
      });
    },

    setUpEventCategorySelect2: function()
    {
      this.$id('eventCategory').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.eventCategories
          .filter(i => i.get('active'))
          .map(i => ({
            id: i.id,
            text: i.getLabel({long: true}),
            model: i
          })),
        formatSelection: ({model}, $el, e) => e(model.getLabel())
      });
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    filterHasValue: function(filter)
    {
      if (filter === 'createdAt')
      {
        var $from = this.$id('from-date');
        var $to = this.$id('to-date');

        return $from.val().length > 0 || $to.val().length > 0;
      }

      return FilterView.prototype.filterHasValue.apply(this, arguments);
    },

    showFilter: function(filter)
    {
      if (filter === 'creator' || filter === 'implementers' || filter === 'coordinators')
      {
        this.$id('user').select2('focus');
      }
      else
      {
        FilterView.prototype.showFilter.apply(this, arguments);
      }
    }

  });
});
