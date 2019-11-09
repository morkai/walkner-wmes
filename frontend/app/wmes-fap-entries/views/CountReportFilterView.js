// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/data/orgUnits',
  '../dictionaries',
  '../Entry',
  'app/wmes-fap-entries/templates/countReportFilter',
  'app/core/util/ExpandableSelect'
], function(
  js2form,
  time,
  View,
  buttonGroup,
  idAndLabel,
  dateTimeRange,
  setUpMrpSelect2,
  orgUnits,
  dictionaries,
  Entry,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'submit': function()
      {
        this.changeFilter();

        return false;
      },
      'click #-levels .active': function(e)
      {
        setTimeout(function()
        {
          e.currentTarget.classList.remove('active');
          e.currentTarget.querySelector('input').checked = false;
        }, 1);
      }
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('interval'));
      buttonGroup.toggle(this.$id('levels'));

      this.$('.is-expandable').expandableSelect();

      setUpMrpSelect2(this.$id('mrps'), {
        own: true,
        view: this,
        width: '250px'
      });

      this.setUpCategorySelect2();
    },

    getTemplateData: function()
    {
      return {
        divisions: orgUnits.getAllByType('division')
          .filter(function(d) { return d.isActive() && d.get('type') === 'prod'; })
          .map(idAndLabel),
        subdivisionTypes: dictionaries.subdivisionTypes
      };
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        interval: model.get('interval'),
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        categories: model.get('categories').concat(model.get('subCategories')).join(','),
        mrps: model.get('mrps').join(','),
        subdivisionTypes: model.get('subdivisionTypes').join(','),
        divisions: model.get('divisions').join(','),
        levels: model.get('levels')
      };
    },

    changeFilter: function()
    {
      var view = this;
      var range = dateTimeRange.serialize(view);
      var levels = buttonGroup.getValue(this.$id('levels'));
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        interval: buttonGroup.getValue(this.$id('interval')),
        levels: levels == null ? -1 : (parseInt(levels, 10) || 0)
      };

      ['categories', 'mrps', 'subdivisionTypes', 'divisions'].forEach(function(prop)
      {
        var value = view.$id(prop).val();

        query[prop] = Array.isArray(value) ? value : value ? value.split(',') : [];
      });

      if (query.categories.length)
      {
        query.subCategories = [];
        query.categories = query.categories.filter(function(id)
        {
          if (dictionaries.subCategories.get(id))
          {
            query.subCategories.push(id);

            return false;
          }

          return true;
        });
      }

      view.model.set(query);
      view.model.trigger('filtered');
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

      this.$id('categories').select2({
        width: '350px',
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
    }

  });
});
