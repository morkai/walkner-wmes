// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/forms/dropdownRadio',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/mrpControllers/util/setUpMrpSelect2',
  '../dictionaries',
  '../Entry',
  'app/wmes-fap-entries/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  currentUser,
  FilterView,
  dateTimeRange,
  dropdownRadio,
  idAndLabel,
  orgUnits,
  setUpUserSelect2,
  setUpMrpSelect2,
  dictionaries,
  Entry,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [
      'createdAt',
      'order',
      'mrp',
      'category',
      'subdivisionType',
      'divisions',
      'level',
      'limit'
    ],
    filterMap: {
      orderNo: 'order',
      nc12: 'order',
      productName: 'search',
      problem: 'search'
    },

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'change input[name="userType"]': function() { this.toggleUserSelect2(true); },
      'change input[name="statusType"]': 'toggleStatus',

      'click #-level .active': function(e)
      {
        setTimeout(function()
        {
          e.currentTarget.classList.remove('active');
          e.currentTarget.querySelector('input').checked = false;
        }, 1);
      }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        userType: 'others',
        statusType: 'specific'
      };
    },

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'orderNo': function(propertyName, term, formData)
      {
        formData.order = term.args[1];
      },
      'nc12': 'orderNo',
      'search': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'level': 'search',
      'observers.user.id': function(propertyName, term, formData)
      {
        if (term.args[1] === currentUser.data._id)
        {
          formData.userType = 'mine';
          formData.user = currentUser.data._id;
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
      'changes.user.id': function(propertyName, term, formData)
      {
        formData.userType = 'active';
        formData.user = term.args[1];
      },
      'creator.id': function(propertyName, term, formData)
      {
        formData.userType = 'creator';
        formData.user = term.args[1];
      },
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'divisions': 'status',
      'mrp': function(propertyName, term, formData)
      {
        formData[propertyName] = Array.isArray(term.args[1]) ? term.args[1].join(',') : '';
      },
      'category': 'mrp',
      'subCategory': 'mrp',
      'analysisNeed': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
        formData.statusType = formData.analysisNeed === undefined || formData.analysisDone === undefined
          ? 'specific'
          : 'analysis';
      },
      'analysisDone': 'analysisNeed',
      'subdivisionType': 'divisions'
    },

    serializeTermToForm: function(term, formData)
    {
      if (term.name === 'or')
      {
        var categories = [];

        term.args.forEach(function(subTerm)
        {
          if (subTerm.name === 'in' && (subTerm.args[0] === 'category' || subTerm.args[0] === 'subCategory'))
          {
            categories = categories.concat(subTerm.args[1]);
          }
        });

        if (categories.length)
        {
          formData.category = categories.join(',');
        }

        return;
      }

      FilterView.prototype.serializeTermToForm.apply(this, arguments);
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        statuses: ['pending', 'started', 'finished'],
        divisions: orgUnits.getAllByType('division')
          .filter(function(d) { return d.isActive() && d.get('type') === 'prod'; })
          .map(idAndLabel),
        subdivisionTypes: dictionaries.subdivisionTypes
      });
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]').val();
      var statusType = this.$('input[name="statusType"]:checked').val();
      var level = this.$('input[name="level"]:checked').val();
      var status = (this.$id('status').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var divisions = (this.$id('divisions').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var subdivisionType = (this.$id('subdivisionType').val() || []).filter(function(v) { return !_.isEmpty(v); });
      var user = this.$id('user').val();
      var order = this.$id('order').val().trim();
      var mrp = this.$id('mrp').val();
      var category = this.$id('category').val();
      var search = this.$id('search').val().trim();

      dateTimeRange.formToRql(this, selector);

      if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['observers.user.id', currentUser.data._id]});
      }
      else if (userType === 'unseen')
      {
        selector.push({name: 'eq', args: ['observers.user.id', userType]});
      }
      else if (userType === 'active')
      {
        selector.push({name: 'eq', args: ['changes.user.id', user]});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: [
          userType === 'creator' ? 'creator.id' : 'observers.user.id',
          user
        ]});
      }

      if (order.length === 9)
      {
        selector.push({name: 'eq', args: ['orderNo', order]});
      }
      else if (order.length)
      {
        selector.push({name: 'eq', args: ['nc12', order]});
      }

      if (statusType === 'specific' && status.length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }
      else if (statusType === 'analysis')
      {
        selector.push(
          {name: 'eq', args: ['analysisNeed', true]},
          {name: 'eq', args: ['analysisDone', false]}
        );
      }

      if (level >= 0)
      {
        selector.push({name: 'eq', args: ['level', +level]});
      }

      if (mrp && mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }

      if (category && category.length)
      {
        var categories = [];
        var subCategories = [];

        category.split(',').forEach(function(id)
        {
          if (dictionaries.categories.get(id))
          {
            categories.push(id);
          }
          else if (dictionaries.subCategories.get(id))
          {
            subCategories.push(id);
          }
        });

        if (categories.length && subCategories.length)
        {
          selector.push({name: 'or', args: [
            {name: 'in', args: ['category', categories]},
            {name: 'in', args: ['subCategory', subCategories]}
          ]});
        }
        else if (categories.length)
        {
          selector.push({name: 'in', args: ['category', categories]});
        }
        else if (subCategories.length)
        {
          selector.push({name: 'in', args: ['subCategory', subCategories]});
        }
      }

      if (divisions.length)
      {
        selector.push({name: 'in', args: ['divisions', divisions]});
      }

      if (subdivisionType.length)
      {
        selector.push({name: 'in', args: ['subdivisionType', subdivisionType]});
      }

      if (search.length)
      {
        selector.push({name: 'eq', args: ['search', search]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('limit').parent().attr('data-filter', 'limit');

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        view: this,
        width: '275px',
        noPersonnelId: true
      });

      setUpMrpSelect2(this.$id('mrp'), {
        own: true,
        view: this,
        width: '250px'
      });

      this.setUpCategorySelect2();
      this.setUpUserType();
      this.toggleButtonGroup('level');
      this.toggleUserSelect2(false);
      this.toggleStatus();
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    setUpCategorySelect2: function()
    {
      var parentToSub = {};

      dictionaries.subCategories.forEach(function(subCategory)
      {
        if (!subCategory.get('active'))
        {
          return;
        }

        var parent = subCategory.get('parent');

        if (!parentToSub[parent])
        {
          parentToSub[parent] = [];
        }

        parentToSub[parent].push(subCategory);
      });

      this.$id('category').select2({
        width: '280px',
        multiple: true,
        allowClear: true,
        data: dictionaries.categories
          .filter(function(c) { return c.get('active'); })
          .map(function(category)
          {
            var subCategories = parentToSub[category.id];

            return {
              id: category.id,
              text: category.getLabel(),
              children: !subCategories ? [] : subCategories.map(idAndLabel)
            };
          })
      });
    },

    setUpUserType: function()
    {
      var view = this;
      var options = ['mine', 'unseen', 'others', 'active', 'creator'].map(function(userType)
      {
        return {
          value: userType,
          title: view.t('filter:user:' + userType + ':title'),
          optionLabel: view.t('filter:user:' + userType)
        };
      });

      dropdownRadio(view.$id('userType'), {
        label: view.t('filter:user:label'),
        options: options
      });
    },

    toggleUserSelect2: function(resetUser)
    {
      var userType = this.$('input[name="userType"]').val();
      var mine = userType === 'mine' || userType === 'unseen';
      var $user = this.$id('user').select2('enable', !mine);

      if (resetUser && (mine || !$user.val()))
      {
        $user.select2('data', {
          id: currentUser.data._id,
          text: currentUser.getLabel()
        });
      }
    },

    toggleStatus: function()
    {
      var statusType = this.$('input[name="statusType"]:checked').val();

      this.$id('status').prop('disabled', statusType !== 'specific');
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
    }

  });
});
