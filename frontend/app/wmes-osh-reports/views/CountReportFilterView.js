// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/forms/dropdownRadio',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-reports/templates/count/filter',
  'app/core/util/ExpandableSelect'
], function(
  currentUser,
  FilterView,
  dateTimeRange,
  dropdownRadio,
  setUpUserSelect2,
  dictionaries,
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  const NLS_DOMAIN = {
    nearMiss: 'wmes-osh-nearMisses',
    kaizen: 'wmes-osh-kaizens',
    action: 'wmes-osh-actions',
    observation: 'wmes-osh-observations'
  };

  const FILTER_LIST = {
    nearMiss: [
      'status',
      'user',
      'locationPath',
      'kind',
      'eventCategory',
      'reasonCategory',
      'priority'
    ],
    kaizen: [
      'status',
      'user',
      'locationPath',
      'kind',
      'kaizenCategory'
    ],
    action: [
      'status',
      'user',
      'locationPath',
      'kind',
      'activityKind'
    ],
    observation: [
      'status',
      'user',
      'locationPath',
      'observationKind'
    ]
  };

  return FilterView.extend({

    template,

    nlsDomain: function()
    {
      return NLS_DOMAIN[this.model.type];
    },

    filterList: function()
    {
      return FILTER_LIST[this.model.type];
    },

    filterMap: {
      createdAt: 'date',
      eventDate: 'date',
      date: 'date',
      startedAt: 'date',
      plannedAt: 'date',
      implementedAt: 'date',
      finishedAt: 'date'
    },

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
      'eventDate': dateTimeRange.rqlToForm,
      'date': dateTimeRange.rqlToForm,
      'startedAt': dateTimeRange.rqlToForm,
      'implementedAt': dateTimeRange.rqlToForm,
      'plannedAt': dateTimeRange.rqlToForm,
      'finishedAt': dateTimeRange.rqlToForm,
      'interval': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.args[1];
      },
      'workplace': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'department': 'workplace',
      'building': 'workplace',
      'location': 'workplace',
      'station': 'workplace',
      'eventCategory': 'workplace',
      'reasonCategory': 'workplace',
      'kaizenCategory': 'workplace',
      'activityKind': 'workplace',
      'kind': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'observationKind': 'kind',
      'priority': 'kind',
      'status': 'kind',
      'creator.id': (propertyName, term, formData) =>
      {
        formData.userType = propertyName.split('.')[0];
        formData.user = term.args[1];
      },
      'implementer.id': 'creator.id',
      'implementers.id': 'creator.id',
      'participants.id': 'creator.id',
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
        type: this.model.type,
        statuses: this.serializeStatuses(),
        kinds: this.serializeKinds(),
        observationKinds: this.serializeObservationKinds(),
        priorities: this.serializePriorities()
      };
    },

    serializeStatuses: function()
    {
      return dictionaries.statuses[this.model.type].map(status => ({
        value: status,
        label: dictionaries.getLabel('status', status)
      }));
    },

    serializeKinds: function()
    {
      if (this.model.type === 'observation')
      {
        return [];
      }

      return dictionaries.kinds.map(kind => ({
        value: kind.id,
        label: kind.getLabel({long: true})
      }));
    },

    serializeObservationKinds: function()
    {
      if (this.model.type !== 'observation')
      {
        return [];
      }

      return dictionaries.observationKinds.map(kind => ({
        value: kind.id,
        label: kind.getLabel({long: true})
      }));
    },

    serializePriorities: function()
    {
      if (this.model.type !== 'nearMiss')
      {
        return [];
      }

      return dictionaries.priorities.map(priority => ({
        value: priority,
        label: dictionaries.getLabel('priority', priority)
      }));
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);

      selector.push({name: 'eq', args: ['interval', this.getButtonGroupValue('interval', 'none')]});

      [
        'status',
        'eventCategory',
        'reasonCategory',
        'kaizenCategory',
        'kind',
        'activityKind',
        'observationKind',
        'priority'
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

      this.toggleButtonGroup('interval');

      setUpUserSelect2(this.$id('user'), {
        view: this,
        width: '100%'
      });

      this.setUpUserType();
      this.toggleUserSelect2();
      this.setUpDictionarySelect2('eventCategory');
      this.setUpDictionarySelect2('reasonCategory');
      this.setUpDictionarySelect2('kaizenCategory');
      this.setUpDictionarySelect2('activityKind');
      this.setUpObsFilter();
    },

    setUpDictionarySelect2: function(id, collection)
    {
      const $input = this.$id(id);

      if (!$input.length)
      {
        return;
      }

      $input.select2({
        width: '300px',
        multiple: true,
        placeholder: ' ',
        data: (collection || dictionaries.forProperty(id))
          .filter(i => i.get('active'))
          .map(i => ({
            id: i.id,
            text: i.getLabel({long: true}),
            model: i
          })),
        formatSelection: ({model}, $el, e) => e(model.getLabel())
      });
    },

    setUpUserType: function()
    {
      dropdownRadio(this.$id('userType'), {
        label: this.t('filter:user:others'),
        options: [
          'others',
          'creator',
          'implementer',
          'implementers',
          'participants',
          'coordinators'
        ].filter(userType => this.t.has(`filter:user:${userType}`)).map(userType =>
        {
          return {
            value: userType,
            title: this.t(`filter:user:${userType}:title`),
            optionLabel: this.t(`filter:user:${userType}`)
          };
        })
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

    setUpObsFilter: function()
    {
      if (!this.$id('obsType').length)
      {
        return;
      }

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
      const $dateFilter = this.$('.dateTimeRange-label-input[value="' + filter + '"]');

      if ($dateFilter.length)
      {
        $dateFilter.prop('checked', true);

        dateTimeRange.toggleLabel(this);
      }

      FilterView.prototype.showFilter.apply(this, arguments);

      if (filter === 'user')
      {
        this.$id('user').select2('focus');
      }
    }

  });
});
