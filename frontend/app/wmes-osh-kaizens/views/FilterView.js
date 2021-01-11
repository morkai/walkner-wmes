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
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-kaizens/templates/filter',
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
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'createdAt',
      'locationPath',
      'kind',
      'kaizenCategory',
      'limit'
    ],
    filterMap: {
      createdAt: 'date',
      startedAt: 'date',
      implementedAt: 'date',
      plannedAt: 'date',
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
      'startedAt': dateTimeRange.rqlToForm,
      'implementedAt': dateTimeRange.rqlToForm,
      'plannedAt': dateTimeRange.rqlToForm,
      'finishedAt': dateTimeRange.rqlToForm,
      'workplace': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'department': 'workplace',
      'building': 'workplace',
      'location': 'workplace',
      'station': 'station',
      'kaizenCategory': 'workplace',
      'kind': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'status': 'kind',
      'kom': (propertyName, term, formData) =>
      {
        if (!formData.status)
        {
          formData.status = [];
        }

        formData.status.push('kom');
      },
      'creator.id': (propertyName, term, formData) =>
      {
        formData.userType = propertyName.split('.')[0];
        formData.user = term.args[1];
      },
      'implementers.id': 'creator.id',
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

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-locationPath', new OrgUnitPickerFilterView({
        filterView: this,
        emptyLabel: this.t('PROPERTY:locationPath')
      }));
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

    serializeFormToQuery: function(selector, rqlQuery)
    {
      const dateFilter = this.$('input[name="dateFilter"]:checked').val();

      rqlQuery.sort = {};
      rqlQuery.sort[dateFilter] = -1;

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
      this.setUpKaizenCategorySelect2();
    },

    setUpUserType: function()
    {
      const view = this;
      const options = [
        'mine',
        'unseen',
        'others',
        'creator',
        'implementers',
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
      const userType = this.$('input[name="userType"]').val();
      const mine = userType === 'mine' || userType === 'unseen';
      const $user = this.$id('user').select2('enable', !mine);

      if (mine || (resetUser && !$user.val()))
      {
        $user.select2('data', {
          id: currentUser.data._id,
          text: currentUser.getLabel()
        });
      }
    },

    setUpKaizenCategorySelect2: function()
    {
      this.$id('kaizenCategory').select2({
        width: '250px',
        multiple: true,
        placeholder: ' ',
        data: dictionaries.kaizenCategories
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
        const $from = this.$id('from-date');
        const $to = this.$id('to-date');

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
