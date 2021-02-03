// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/data/colorFactory',
  'app/planning/PlanSettings',
  'app/orders/OrderCollection',
  '../OrderGroupCollection',
  '../views/TesterFilterView',
  '../views/TesterGroupsView',
  'app/planning-orderGroups/templates/tester/page'
], function(
  $,
  time,
  View,
  bindLoadingMessage,
  colorFactory,
  PlanSettings,
  OrderCollection,
  OrderGroupCollection,
  TesterFilterView,
  TesterGroupsView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    modelProperty: 'orderGroups',

    breadcrumbs: function()
    {
      return [
        {href: '#planning/plans', label: this.t('BREADCRUMB:base')},
        {href: '#planning/orderGroups', label: this.t('BREADCRUMB:browse')},
        this.t('tester:breadcrumb')
      ];
    },

    initialize: function()
    {
      this.orderGroups = bindLoadingMessage(new OrderGroupCollection([], {
        rqlQuery: 'sort(name)&limit(0)',
        sortByName: true
      }), this);

      this.planSettings = bindLoadingMessage(new PlanSettings({_id: this.model.get('date')}), this);

      this.sapOrders = bindLoadingMessage(new OrderCollection([], {
        rqlQuery: 'select(mrp,nc12,qty,name,description,bom)&limit(0)'
          + '&statuses=in=REL&statuses=nin=(TECO,DLT,DLFL)'
          + '&scheduledStartDate=' + time.getMoment(this.model.get('date'), 'YYYY-MM-DD').valueOf()
          + '&mrp=' + this.model.get('mrp')
      }), this);

      this.filterView = new TesterFilterView({
        model: this.model
      });

      this.groupsView = new TesterGroupsView({
        model: this.model
      });

      this.setView('#-filter', this.filterView);
      this.setView('#-groups', this.groupsView);

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.once('afterLoad', this.matchGroups);
    },

    load: function(when)
    {
      return when(
        this.orderGroups.fetch({reset: true}),
        this.sapOrders.fetch({reset: true}),
        this.planSettings.fetch()
      );
    },

    onFiltered: function()
    {
      var page = this;
      var mrp = page.model.get('mrp');
      var date = page.model.get('date');
      var scheduledStartDate = time.getMoment(date, 'YYYY-MM-DD').valueOf();

      page.planSettings.set('_id', date);

      page.sapOrders.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'eq' && term.args[0] === 'scheduledStartDate')
        {
          term.args[1] = scheduledStartDate;
        }
        else if (term.name === 'eq' && term.args[0] === 'mrp')
        {
          term.args[1] = mrp;
        }
      });

      page.model.set('loading', true);

      page.load($.when.bind($)).then(function()
      {
        page.model.set('loading', false);
        page.matchGroups();
      });

      page.broker.publish('router.navigate', {
        url: '/planning/orderGroups;tester?date=' + date + '&mrp=' + mrp,
        replace: true,
        trigger: false
      });
    },

    matchGroups: function()
    {
      const groups = {};
      const colorGroup = 'planOrderGroup' + Date.now();

      this.sapOrders.forEach(sapOrder =>
      {
        sapOrder = sapOrder.attributes;

        const matches = this.matchSapOrder(sapOrder);

        matches.forEach(match =>
        {
          if (!groups[match.orderGroup.id])
          {
            groups[match.orderGroup.id] = {
              orderGroup: match.orderGroup,
              sapOrders: []
            };
          }

          groups[match.orderGroup.id].sapOrders.push(sapOrder);
        });

        sapOrder.color = matches.length > 1 ? colorFactory.getColor(colorGroup, sapOrder._id) : '';
      });

      this.model.set({
        groups: Object.values(groups)
      });
    },

    matchSapOrder: function(sapOrder)
    {
      const result = [];
      const mrp = sapOrder.mrp;
      const product = ((sapOrder.nc12 || '')
        + ' ' + (sapOrder.name || '')
        + ' ' + (sapOrder.description || '')).trim().toUpperCase();
      const bom = [];

      (sapOrder.bom || []).forEach(component =>
      {
        const line = 'ITEM ' + (component.get('item') || '0000')
          + ' 12NC ' + (component.get('nc12') || '000000000000')
          + ' NAME ' + (component.get('name') || '?');

        bom.push(line.trim().toUpperCase());
      });

      let noMatchGroup = null;

      this.orderGroups.forEach(orderGroup =>
      {
        if (orderGroup.isNoMatchGroup())
        {
          noMatchGroup = orderGroup;

          return;
        }

        if (this.matchOrderGroup(orderGroup, mrp, product, bom))
        {
          result.push({
            orderGroup,
            sapOrder
          });
        }
      });

      if (result.length === 0)
      {
        result.push({
          orderGroup: noMatchGroup,
          sapOrder
        });
      }

      return result;
    },

    matchOrderGroup: function(orderGroup, mrp, product, bom)
    {
      return !orderGroup.isEmptyGroup()
        && this.matchMrp(orderGroup.get('mrp'), mrp)
        && this.matchProductInclude(orderGroup.get('productInclude'), product)
        && this.matchProductExclude(orderGroup.get('productExclude'), product)
        && this.matchBomInclude(orderGroup.get('bomInclude'), bom)
        && this.matchBomExclude(orderGroup.get('bomExclude'), bom);
    },

    matchAllWords: function(words, value)
    {
      if (words.length === 1)
      {
        return value.includes(words[0]);
      }

      for (var i = 0; i < words.length; ++i)
      {
        if (!value.includes(words[i]))
        {
          return false;
        }
      }

      return true;
    },

    matchAnyWord: function(words, value)
    {
      return words.filter(word => value.includes(word));
    },

    matchMrp: function(mrps, mrp)
    {
      return mrps.length === 0 || mrps.includes(mrp);
    },

    matchProductInclude: function(patterns, product)
    {
      if (patterns.length === 0)
      {
        return true;
      }

      return patterns.some(pattern => this.matchAllWords(pattern, product));
    },

    matchProductExclude: function(patterns, product)
    {
      if (patterns.length === 0)
      {
        return true;
      }

      return patterns.every(pattern => !this.matchAllWords(pattern, product));
    },

    matchBomInclude: function(patterns, bom)
    {
      if (patterns.length === 0)
      {
        return true;
      }

      for (let patternI = 0; patternI < patterns.length; ++patternI)
      {
        const required = patterns[patternI];
        const actual = new Set();

        for (let bomI = 0; bomI < bom.length; ++bomI)
        {
          this.matchAnyWord(required, bom[bomI]).forEach(word => actual.add(word));
        }

        if (actual.size === required.length)
        {
          return true;
        }
      }

      return false;
    },

    matchBomExclude: function(patterns, bom)
    {
      if (patterns.length === 0)
      {
        return true;
      }

      for (let patternI = 0; patternI < patterns.length; ++patternI)
      {
        const required = patterns[patternI];
        const actual = new Set();

        for (let bomI = 0; bomI < bom.length; ++bomI)
        {
          this.matchAnyWord(required, bom[bomI]).forEach(word => actual.add(word));
        }

        if (actual.size === required.length)
        {
          return false;
        }
      }

      return true;
    }

  });
});
