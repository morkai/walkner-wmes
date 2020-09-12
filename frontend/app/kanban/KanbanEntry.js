// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
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

    split: function()
    {
      var parent = this;
      var KanbanEntry = parent.constructor;
      var result = [parent];
      var children = parent.get('children') || [];

      children.forEach(function(child, i)
      {
        result.push(new KanbanEntry(_.defaults(
          {
            _id: parseFloat(parent.id + '.' + (i + 1)),
            changes: [],
            children: []
          },
          child,
          parent.attributes
        )));
      });

      return result;
    },

    serialize: function(options)
    {
      if (this.serialized)
      {
        return this.serialized;
      }

      var entry = this.toJSON();
      var supplyArea = options.supplyAreas.findByWorkCenters(
        entry.supplyArea,
        entry.workCenter ? [entry.workCenter] : []
      );
      var component = options.components.get(entry.nc12);

      entry.rowClassName = entry.discontinued ? 'kanban-is-discontinued' : '';

      if (component)
      {
        entry.description = component.get('description');
        entry.minBinQty = component.get('minBinQty');
        entry.maxBinQty = component.get('maxBinQty');
        entry.replenQty = component.get('replenQty');
        entry.unit = component.get('unit');

        if (entry.storageType === 153)
        {
          entry.storageBin = '';
          entry.newStorageBin = '';
        }
        else
        {
          entry.storageBin = component.get('storageBin');
          entry.newStorageBin = component.get('newStorageBin');
        }
      }
      else
      {
        entry.description = '';
        entry.storageBin = '';
        entry.newStorageBin = '';
        entry.minBinQty = 0;
        entry.maxBinQty = 0;
        entry.replenQty = 0;
        entry.unit = 'PCE';
      }

      if (entry.storageBin)
      {
        entry.storageBinRow = entry.storageBin.substr(1, 1);
        entry.markerColor = options.settings.getRowColor(entry.storageBinRow);
      }
      else
      {
        entry.storageBinRow = '';
        entry.markerColor = null;
      }

      if (entry.newStorageBin)
      {
        entry.newStorageBinRow = entry.newStorageBin.substr(1, 1);
        entry.newMarkerColor = options.settings.getRowColor(entry.newStorageBinRow);
      }
      else
      {
        entry.newStorageBinRow = '';
        entry.newMarkerColor = null;
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
        entry.family = '';
        entry.lineCount = 0;
        entry.lines = [];
      }

      entry.workstationsTotal = 0;
      entry.invalidWorkstations = false;
      entry.invalidLocations = false;

      for (var i = 0; i < entry.workstations.length; ++i)
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
