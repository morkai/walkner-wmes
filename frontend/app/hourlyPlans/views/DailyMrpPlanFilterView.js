// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/time',
  'app/data/orgUnits',
  'app/core/util/ExpandableSelect',
  'app/core/util/idAndLabel',
  'app/core/views/FilterView',
  'app/hourlyPlans/templates/dailyMrpPlans/filter'
], function(
  _,
  js2form,
  time,
  orgUnits,
  ExpandableSelect,
  idAndLabel,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'change #-date': function()
      {
        this.needsReset = true;

        this.scheduleReset(333);
      },
      'focus #-date': function()
      {
        this.needsReset = false;

        clearTimeout(this.timers.reset);
      },
      'blur #-date': function()
      {
        if (this.needsReset)
        {
          this.reset();
        }
      },
      'change #-mrp': function()
      {
        this.needsReset = true;

        this.scheduleReset(333);
      },
      'focus #-mrp': function()
      {
        this.needsReset = false;

        clearTimeout(this.timers.reset);
      },
      'blur #-mrp': function()
      {
        if (this.needsReset)
        {
          this.reset();
        }
      },
      'click #-wrap': function()
      {
        this.model.options.set('wrap', !this.model.options.get('wrap'));
      },
      'click #-generatePlans': function()
      {
        this.model.invoke('generate');
      },
      'click #-savePlans': function()
      {
        var $btn = this.$id('savePlans').prop('disabled', true);
        var $icon = $btn.find('.fa').removeClass('fa-save').addClass('fa-spinner fa-spin');

        this.model.saveLines().always(function()
        {
          $icon.removeClass('fa-spinner fa-spin').addClass('fa-save');
          $btn.prop('disabled', false);
        });
      },
      'click #-setHourlyPlans': function()
      {
        var $btn = this.$id('setHourlyPlans').prop('disabled', true);
        var $icon = $btn.find('.fa').removeClass('fa-calendar').addClass('fa-spinner fa-spin');

        this.model.setHourlyPlans().always(function()
        {
          $icon.removeClass('fa-spinner fa-spin').addClass('fa-calendar');
          $btn.prop('disabled', false);
        });
      }

    }, FilterView.prototype.events),

    defaultFormData: {
      date: '',
      mrp: []
    },

    termToForm: {
      'date': function(propertyName, term, formData)
      {
        formData[propertyName] = time.getMoment(term.args[1]).format('YYYY-MM-DD');
      },
      'mrp': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model.options, 'change:wrap', this.toggleWrapButton);
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    serialize: function()
    {
      var mrps = {};

      orgUnits.getAllByType('mrpController').forEach(function(d)
      {
        if (d.getSubdivision().get('type') === 'assembly')
        {
          mrps[d.id.replace(/~.+$/, '')] = 1;
        }
      });

      return _.assign(FilterView.prototype.serialize.call(this), {
        mrpControllers: Object.keys(mrps).map(function(mrp) { return {id: mrp, text: mrp}; })
      });
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      this.toggleWrapButton();
    },

    scheduleReset: function(delay)
    {
      var view = this;

      clearTimeout(view.timers.reset);

      view.timers.reset = setTimeout(function()
      {
        view.timers.reset = null;
        view.needsReset = false;

        view.reset();
      }, delay);
    },

    reset: function()
    {
      clearTimeout(this.timers.reset);
      this.timers.reset = null;

      var date = this.$id('date').val();
      var mrp = this.$id('mrp').val();
      var selector = this.model.rqlQuery.selector.args = [];

      if (!_.isEmpty(date))
      {
        selector.push({name: 'eq', args: ['date', date]});
      }

      if (!_.isEmpty(mrp))
      {
        selector.push({name: 'in', args: ['mrp', mrp]});
      }

      if (selector.length !== 2)
      {
        this.model.reset([]);

        return;
      }

      this.model.fetch({reset: true});
    },

    toggleWrapButton: function()
    {
      var wrap = !!this.model.options.get('wrap');

      this.$id('wrap')
        .toggleClass('active', !wrap)
        .attr('title', wrap ? 'Włącz przewijanie list' : 'Wyłącz przewijanie list');
    }

  });
});
