// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kanban/entries',

    clientUrlRoot: '#kanban/entries',

    topicPrefix: 'kanban.entries',

    privilegePrefix: 'KANBAN',

    nlsDomain: 'kanban',

    initialize: function()
    {
      this.serialized = null;
    },

    serialize: function(options)
    {
      if (this.serialized)
      {
        return this.serialized;
      }

      var entry = this.toJSON();
      var workCenterFilter = options.tableView.getFilter('workCenter');
      var supplyArea = options.supplyAreas.findByWorkCenters(
        entry.supplyArea,
        workCenterFilter ? workCenterFilter.data : []
      );
      var component = options.components.get(entry.nc12);

      entry.rowClassName = entry.discontinued ? 'kanban-is-discontinued' : '';

      if (component)
      {
        entry.description = component.get('description');
        entry.storageBin = component.get('storageBin');
        entry.newStorageBin = component.get('newStorageBin');
        entry.minBinQty = component.get('minBinQty');
        entry.maxBinQty = component.get('maxBinQty');
        entry.replenQty = component.get('replenQty');
        entry.markerColor = component.get('markerColor');
      }
      else
      {
        entry.description = '';
        entry.storageBin = '';
        entry.newStorageBin = '';
        entry.minBinQty = 0;
        entry.maxBinQty = 0;
        entry.replenQty = 0;
        entry.markerColor = null;
      }

      if (supplyArea)
      {
        entry.supplyAreaId = supplyArea.id;
        entry.workCenter = supplyArea.get('workCenter');
        entry.family = supplyArea.get('family');
        entry.lineCount = supplyArea.get('lineCount');
        entry.lines = supplyArea.get('lines');
      }
      else
      {
        entry.supplyAreaId = null;
        entry.workCenter = '';
        entry.family = '';
        entry.lineCount = 0;
        entry.lines = [];
      }

      entry.workstationsTotal = 0;
      entry.invalidWorkstations = false;
      entry.invalidLocations = false;

      for (var i = 0; i < 6; ++i)
      {
        var workstations = entry.workstations[i];
        var location = entry.locations[i];

        entry.workstationsTotal += workstations;
        entry.invalidWorkstations = entry.invalidWorkstations || (!workstations && !!location);
        entry.invalidLocations = entry.invalidLocations || (!location && !!workstations);
      }

      if (!entry.workstationsTotal)
      {
        entry.invalidWorkstations = true;
        entry.invalidLocations = true;
      }

      entry.kanbanQtyUser = entry.workstationsTotal * 2;

      entry.emptyFullCount = entry.lineCount * entry.kanbanQtyUser;

      entry.stock = entry.emptyFullCount * entry.componentQty;

      entry.kanbanIdCount = entry.kanbanId.length;

      return this.serialized = entry;
    }

  });
});
