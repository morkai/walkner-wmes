// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/forms/dropdownRadio',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-observations/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  $,
  currentUser,
  FilterView,
  dateTimeRange,
  dropdownRadio,
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
      'department',
      'building',
      'location',
      'station',
      'observationKind',
      'limit'
    ],
    filterMap: {
      createdAt: 'date',
      finishedAt: 'date'
    },

    template,

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'change input[name="userType"]': function() { this.toggleUserSelect2(true); }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        userType: 'others',
        dateFilter: 'createdAt'
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'finishedAt': dateTimeRange.rqlToForm,
      'workplace': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'department': 'workplace',
      'building': 'workplace',
      'location': 'workplace',
      'station': 'workplace',
      'observationKind': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'status': 'kind',
      'creator.id': (propertyName, term, formData) =>
      {
        formData.userType = propertyName.split('.')[0];
        formData.user = term.args[1];
      },
      'coordinators.id': 'creator.id',
      'users.user.id': (propertyName, term, formData) =>
      {
        if (term.args[1] === 'mine')
        {
          formData.userType = 'mine';
          formData.user = null;
        }
        else if (term.args[1] === 'unseen')
        {
          formData.userType = 'unseen';
          formData.user = null;
        }
        else
        {
          formData.userType = 'others';
          formData.user = term.args[1];
        }
      }
    },

    getTemplateData: function()
    {
      return {
        statuses: dictionaries.statuses.observation.map(status => ({
          value: status,
          label: dictionaries.getLabel('status', status)
        })),
        kinds: dictionaries.observationKinds.map(kind => ({
          value: kind.id,
          label: kind.getLabel({long: true})
        }))
      };
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      const dateFilter = this.$('input[name="dateFilter"]:checked').val();

      rqlQuery.sort = {};
      rqlQuery.sort[dateFilter] = -1;

      dateTimeRange.formToRql(this, selector);

      [
        'status',
        'workplace',
        'department',
        'building',
        'location',
        'station',
        'observationKind'
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
      let userType = this.$('input[name="userType"]').val();

      if (userType === 'mine' || userType === 'unseen')
      {
        selector.push({name: 'eq', args: ['users.user.id', userType]});
      }
      else if (user)
      {
        if (userType === 'others')
        {
          userType = 'users.user';
        }

        selector.push({name: 'eq', args: [userType + '.id', user]});
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

      this.setUpUserType();
      this.toggleUserSelect2();
      this.setUpWorkplaceSelect2();
      this.setUpDepartmentSelect2();
      this.setUpBuildingSelect2();
      this.setUpLocationSelect2();
      this.setUpStationSelect2();
      this.setUpActivityKindSelect2();
    },

    setUpUserType: function()
    {
      var view = this;
      var options = [
        'mine',
        'unseen',
        'others',
        'creator',
        'coordinators'
      ].map(function(userType)
      {
        return {
          value: userType,
          title: view.t(`filter:user:${userType}:title`),
          optionLabel: view.t(`filter:user:${userType}`)
        };
      });

      dropdownRadio(view.$id('userType'), {
        label: view.t('filter:user:others'),
        options: options
      });
    },

    toggleUserSelect2: function(resetUser)
    {
      var userType = this.$('input[name="userType"]').val();
      var mine = userType === 'mine' || userType === 'unseen';
      var $user = this.$id('user').select2('enable', !mine);

      if (mine || (resetUser && !$user.val()))
      {
        $user.select2('data', {
          id: currentUser.data._id,
          text: currentUser.getLabel()
        });
      }
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

    setUpDepartmentSelect2: function()
    {
      this.$id('department').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.workplaces
          .filter(i => i.get('active'))
          .map(workplace => ({
            text: workplace.getLabel({long: true}),
            children: dictionaries.departments
              .filter(department => department.get('active') && department.get('workplace') === workplace.id)
              .map(department => ({
                id: department.id,
                text: department.getLabel({long: true}),
                model: department
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

    setUpActivityKindSelect2: function()
    {
      this.$id('activityKind').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.activityKinds
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
      if (filter === 'date')
      {
        var $from = this.$id('from-date');
        var $to = this.$id('to-date');

        return $from.val().length > 0 || $to.val().length > 0;
      }

      return FilterView.prototype.filterHasValue.apply(this, arguments);
    },

    showFilter: function(filter)
    {
      if (filter === 'creator'
        || filter === 'implementers'
        || filter === 'coordinators')
      {
        this.$id('userType').val(filter).trigger('change');
        this.$id('user').select2('focus');

        return;
      }

      const $dateFilter = this.$('.dateTimeRange-label-input[value="' + filter + '"]');

      if ($dateFilter.length)
      {
        $dateFilter.prop('checked', true);

        dateTimeRange.toggleLabel(this);
      }

      FilterView.prototype.showFilter.apply(this, arguments);
    }

  });
});
