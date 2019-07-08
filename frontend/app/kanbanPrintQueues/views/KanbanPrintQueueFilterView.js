// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/views/FilterView',
  'app/core/util/uuid',
  'app/kanban/layouts',
  'app/kanban/KanbanEntryCollection',
  'app/kanbanComponents/KanbanComponentCollection',
  'app/kanbanSupplyAreas/KanbanSupplyAreaCollection',
  'app/kanbanPrintQueues/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  viewport,
  FilterView,
  uuid,
  kanbanLayouts,
  KanbanEntryCollection,
  KanbanComponentCollection,
  KanbanSupplyAreaCollection,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      todo: ''
    },

    termToForm: {
      'todo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].toString();
      }
    },

    events: _.assign({

      'click #-groupByWorkstations': function(e)
      {
        e.currentTarget.classList.toggle('active');

        this.model.setGroupByWorkstations(e.currentTarget.classList.contains('active'));
      },

      'click #-quickPrint-submit': function()
      {
        var kanbanIds = this.$id('quickPrint-kanbanIds')
          .val()
          .split(/[^0-9]/)
          .filter(function(v) { return !!v.length; })
          .map(function(v) { return +v; });
        var layouts = this.$id('quickPrint-layouts').val() || [];

        if (kanbanIds.length && layouts.length)
        {
          this.quickPrint(layouts, kanbanIds);
        }
      }

    }, FilterView.prototype.events),

    destroy: function()
    {
      FilterView.prototype.destroy.apply(this, arguments);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.toggleButtonGroup('todo');
      this.$id('groupByWorkstations').toggleClass('active', this.model.getGroupByWorkstations());
      this.$('.is-expandable').expandableSelect();
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var view = this;
      var todo = view.getButtonGroupValue('todo');

      if (!todo)
      {
        todo = 'true';

        view.$id('todo').find('input[value="true"]').prop('checked', true);
        view.toggleButtonGroup('todo');
      }

      selector.push({name: 'eq', args: ['todo', todo === 'true']});

      if (todo === 'true')
      {
        rqlQuery.sort = {
          todo: 1,
          createdAt: 1
        };
      }
      else
      {
        rqlQuery.sort = {
          todo: 1,
          createdAt: -1
        };
      }

      rqlQuery.limit = 10;
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.apply(this, arguments), {
        layouts: kanbanLayouts
      });
    },

    failQuickPrint: function()
    {
      viewport.msg.show({
        type: 'error',
        time: 2500,
        text: this.t('quickPrint:msg:failure')
      });

      this.finishQuickPrint();
    },

    finishQuickPrint: function()
    {
      this.$id('quickPrint')
        .find('input, select, button')
        .prop('disabled', false);

      this.$id('quickPrint-submit')
        .find('.fa')
        .removeClass('fa-spinner fa-spin')
        .addClass('fa-print');

      this.$id('quickPrint-kanbanIds').val('');
    },

    quickPrint: function(layouts, kanbanIds)
    {
      var view = this;
      var idToEntry = {};
      var components = {};
      var supplyAreas = {};

      view.$id('quickPrint')
        .find('input, select, button')
        .prop('disabled', true);

      view.$id('quickPrint-submit')
        .find('.fa')
        .removeClass('fa-print')
        .addClass('fa-spinner fa-spin');

      findEntries(kanbanIds);

      function findEntries(kanbanIds)
      {
        var req = view.ajax({
          url: '/kanban/entries?exclude(updates,changes)&kanbanId=in=(' + kanbanIds + ')'
        });

        req.fail(view.failQuickPrint.bind(view));

        req.done(function(res)
        {
          if (!res.totalCount)
          {
            viewport.msg.show({
              type: 'error',
              time: 2500,
              text: view.t('quickPrint:msg:empty')
            });

            return view.finishQuickPrint();
          }

          var nc12s = {};

          res.collection.forEach(function(entry)
          {
            entry.kanbanId.forEach(function(kanbanId)
            {
              if (kanbanIds.indexOf(kanbanId) !== -1)
              {
                idToEntry[kanbanId] = entry;
                nc12s[entry.nc12] = 1;
                supplyAreas[entry.supplyArea] = 1;
              }
            });
          });

          findComponents(Object.keys(nc12s));
        });
      }

      function findComponents(nc12s)
      {
        var req = view.ajax({
          url: '/kanban/components?exclude(updates,changes)&_id=in=(' + nc12s + ')'
        });

        req.fail(view.failQuickPrint.bind(view));

        req.done(function(res)
        {
          res.collection.forEach(function(component)
          {
            components[component._id] = component;
          });

          findSupplyAreas(Object.keys(supplyAreas));
        });
      }

      function findSupplyAreas(supplyAreaIds)
      {
        var req = view.ajax({
          url: '/kanban/supplyAreas?_id=in=(' + supplyAreaIds + ')'
        });

        req.fail(view.failQuickPrint.bind(view));

        req.done(function(res)
        {
          res.collection.forEach(function(supplyArea)
          {
            supplyAreas[supplyArea._id] = supplyArea;
          });

          view.doQuickPrint(
            layouts,
            idToEntry,
            new KanbanEntryCollection(_.values(idToEntry), {
              supplyAreas: new KanbanSupplyAreaCollection(_.values(supplyAreas)),
              components: new KanbanComponentCollection(_.values(components))
            })
          );
        });
      }
    },

    doQuickPrint: function(layouts, idToEntry, entries)
    {
      var view = this;
      var jobs = [];

      Object.keys(idToEntry).forEach(function(kanbanId)
      {
        var ccn = idToEntry[kanbanId]._id;
        var entry = entries.get(ccn).serialize(entries);
        var jobLayouts = layouts.filter(function(layout)
        {
          return (entry.kind === 'kk' && layout === 'kk')
            || (entry.kind !== 'kk' && layout !== 'kk');
        });

        kanbanId = +kanbanId;

        entry.lines.forEach(function(line, lineIndex)
        {
          var fromIndex = lineIndex * entry.kanbanQtyUser;
          var toIndex = lineIndex * entry.kanbanQtyUser + entry.kanbanQtyUser;
          var storageBin = entry.newStorageBin || entry.storageBin;
          var kanbans = entry.kanbanId.slice(fromIndex, toIndex);

          if (kanbans.indexOf(kanbanId) === -1)
          {
            return;
          }

          jobs.push({
            _id: uuid(),
            line: line,
            kanbans: [kanbanId],
            layouts: jobLayouts,
            data: {
              ccn: entry._id,
              nc12: entry.nc12,
              description: entry.description,
              supplyArea: entry.supplyArea,
              family: entry.family,
              componentQty: entry.componentQty,
              unit: entry.unit,
              storageBin: storageBin,
              minBinQty: entry.minBinQty,
              maxBinQty: entry.maxBinQty,
              replenQty: entry.replenQty,
              workstations: entry.workstations,
              locations: entry.locations
            }
          });
        });
      });

      var req = view.ajax({
        method: 'POST',
        url: '/kanban/printQueues',
        data: JSON.stringify({
          _id: uuid(),
          jobs: jobs
        })
      });

      req.fail(view.failQuickPrint.bind(view));

      req.done(function(queue)
      {
        if (!view.model.get(queue._id))
        {
          view.model.add(queue);
        }

        queue = view.model.get(queue._id);

        view.model.trigger('print:specific', queue, queue.get('jobs'), false);

        view.finishQuickPrint();
      });
    }

  });
});
