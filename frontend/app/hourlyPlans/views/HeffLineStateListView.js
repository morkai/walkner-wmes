// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/data/orgUnits',
  '../HeffLineState',
  'app/hourlyPlans/templates/heffLineStateList',
  'app/hourlyPlans/templates/heffLineStateItem'
], function(
  View,
  orgUnits,
  HeffLineState,
  template,
  renderLine
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .heffLineStates-item-title': function(e)
      {
        this.$(e.target).closest('.heffLineStates-item').find('.form-control').select();
      },
      'keydown .form-control': function(e)
      {
        if (e.which === 13)
        {
          this.updatePlan(e.target.dataset.line, e.target.value);
        }
      },
      'blur .form-control': function(e)
      {
        this.updatePlan(e.target.dataset.line, e.target.value);
      }
    },

    remoteTopics: {
      'heffLineStates.added': function(message)
      {
        this.updatePlan(message.model._id, message.model.plan, false);
      },
      'heffLineStates.edited': function(message)
      {
        this.updatePlan(message.model._id, message.model.plan, false);
      },
      'heffLineStates.deleted': function(message)
      {
        this.updatePlan(message.model._id, '', false);
      }
    },

    refreshCollectionNow: function()
    {
      this.render();
    },

    afterRender: function()
    {
      var division = null;
      var prodFlows = [];

      this.collection.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'division')
        {
          division = term.args[1];
        }
        else if (term.name === 'in' && term.args[0] === 'prodFlows')
        {
          prodFlows = term.args[1];
        }
      });

      orgUnits.getAllByType('prodLine').forEach(function(prodLine)
      {
        if (prodLine.get('deactivatedAt'))
        {
          return;
        }

        var ou = orgUnits.getAllForProdLine(prodLine);

        if (division && ou.division !== division)
        {
          return;
        }

        if (prodFlows.length && prodFlows.indexOf(ou.prodFlow) === -1)
        {
          return;
        }

        var subdivision = orgUnits.getByTypeAndId('subdivision', ou.subdivision);

        if (subdivision.get('type') !== 'assembly')
        {
          return;
        }

        var state = this.collection.get(prodLine.id);

        this.renderLine({
          division: orgUnits.getByTypeAndId('division', ou.division),
          prodFlow: orgUnits.getByTypeAndId('prodFlow', ou.prodFlow),
          prodLine: prodLine,
          plan: state ? state.get('plan') : ''
        });
      }, this);
    },

    renderLine: function(data)
    {
      this.$id('list').append(renderLine({
        prodLine: data.prodLine.id,
        plan: data.plan
      }));
    },

    updatePlan: function(prodLine, plan, save)
    {
      var state = this.collection.get(prodLine);

      if (!state)
      {
        state = new HeffLineState({_id: prodLine, plan: ''});
        state.id = null;
      }

      var oldPlan = state.get('plan');
      var newPlan = plan
        .split(/[^0-9]/)
        .map(function(v) { return parseInt(v, 10); })
        .filter(function(v) { return v >= 0; })
        .splice(0, 8)
        .join(' ');

      this.$('.form-control[data-line="' + prodLine + '"]').val(newPlan);

      if (newPlan !== oldPlan)
      {
        state.set('plan', newPlan);

        if (save !== false)
        {
          this.ajax(state.save());
        }

        if (state.id === null)
        {
          state.id = prodLine;

          this.collection.add(state);
        }
      }
    }

  });
});
