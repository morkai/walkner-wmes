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
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'createdAt',
      'locationPath',
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

      'change input[name="userType"]': function() { this.toggleUserSelect2(true); },

      'click #-clearObs': 'clearObsFilter'

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
      },
      '@observation': (propertyName, term, formData) =>
      {
        formData.obsType = term.args[0];
        formData.obsFilter = term.args[1] || 'any';
        formData.obsCategory = (term.args[2] || []).join(',');
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

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    getTemplateData: function()
    {
      return {
        statuses: dictionaries.statuses.observation.map(status => ({
          value: status,
          label: dictionaries.getLabel('status', status)
        })),
        observationKinds: dictionaries.observationKinds.map(kind => ({
          value: kind.id,
          label: kind.getLabel({long: false})
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

      this.serializeObsFilter(selector);
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
      this.setUpActivityKindSelect2();
      this.setUpObsFilter();
    },

    setUpUserType: function()
    {
      const options = [
        'mine',
        'unseen',
        'others',
        'creator',
        'coordinators'
      ].map(userType =>
      {
        return {
          value: userType,
          title: this.t(`filter:user:${userType}:title`),
          optionLabel: this.t(`filter:user:${userType}`)
        };
      });

      dropdownRadio(this.$id('userType'), {
        label: this.t('filter:user:others'),
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

    setUpObsFilter: function()
    {
      dropdownRadio(this.$id('obsType'), {
        label: this.t('filter:obsType:any'),
        options: ['any', 'behaviors', 'workConditions'].map(value =>
        {
          return {
            value,
            optionLabel: this.t(`filter:obsType:${value}`)
          };
        })
      });

      dropdownRadio(this.$id('obsFilter'), {
        label: this.t('filter:obsFilter:any'),
        options: ['any', 'safe', 'risky', 'easy', 'hard'].map(value =>
        {
          return {
            value,
            optionLabel: this.t(`filter:obsFilter:${value}`)
          };
        })
      });

      this.$id('obsCategory').select2({
        width: '350px',
        multiple: true,
        placeholder: this.t('filter:obsCategory'),
        data: dictionaries.observationCategories
          .filter(i => i.get('active'))
          .map(i => ({
            id: i.id,
            text: i.getLabel({long: true}),
            model: i
          })),
        formatSelection: ({model}, $el, e) => e(model.getLabel({long: false}))
      });
    },

    serializeObsFilter: function(selector)
    {
      const type = this.$id('obsType').val();

      if (!type)
      {
        return;
      }

      const filter = this.$id('obsFilter').val();
      const category = this.$id('obsCategory').val().split(',').map(v => +v).filter(v => v > 0);

      if (category.length || type !== 'any' || filter !== 'any')
      {
        const args = [type];

        if (filter !== 'any' || category.length)
        {
          args.push(filter);

          if (category.length)
          {
            args.push(category);
          }
        }

        selector.push({name: 'observation', args});
      }
    },

    clearObsFilter: function()
    {
      this.$id('obsType').val('any').trigger('change');
      this.$id('obsFilter').val('any').trigger('change');
      this.$id('obsCategory').select2('data', []);
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
