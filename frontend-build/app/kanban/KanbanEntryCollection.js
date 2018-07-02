// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../core/Collection","./KanbanEntry"],function(e,t,n,i){"use strict";return n.extend({model:i,paginate:!1,rqlQuery:"exclude(changes)",initialize:function(e,t){this.tableView=t.tableView,this.supplyAreas=t.supplyAreas,this.components=t.components,this.filtered=[],this.filteredMap={},this.tableView&&(this.tableView.on("change:filterMode",this.onFilterModeChange,this),this.tableView.on("change:filter sync",this.onFilterChange,this),this.tableView.on("change:sort",this.onSortChange,this),this.supplyAreas.on("add change remove",this.onSupplyAreaUpdate,this),this.components.on("add change remove",this.onComponentUpdate,this),this.on("change",this.onEntryChange),this.on("reset",this.onFilterChange),this.onFilterChange())},setUpPubsub:function(e){e.subscribe("kanban.import.success",this.onImport.bind(this)),e.subscribe("kanban.entries.updated",this.onUpdated.bind(this))},getSupplyAreas:function(){var e={};return this.forEach(function(t){e[t.get("supplyArea")]=1}),this.supplyAreas.forEach(function(t){e[t.id]=1}),Object.keys(e).sort().map(function(e){return{id:e,text:e}})},onFilterModeChange:function(){this.tableView.hasAnyFilter()&&this.onFilterChange()},onFilterChange:function(){var e=this.tableView.createFilter(this);this.filtered=[],this.filteredMap={};for(var t=0;t<this.length;++t){var n=this.models[t];e(n)&&(this.filtered.push(n),this.filteredMap[n.id]=n)}this.trigger("filter"),this.onSortChange()},onSortChange:function(){this.filtered.sort(this.tableView.createSort(this)),this.trigger("sort")},onSupplyAreaUpdate:function(e){this.forEach(function(t){t.get("supplyArea")===e.id&&(t.serialized=null)}),this.onFilterChange()},onComponentUpdate:function(e){this.forEach(function(t){t.get("nc12")===e.id&&(t.serialized=null)}),this.onFilterChange()},onEntryChange:function(e){e.serialized=null;var t=this.tableView;if(t){var n=!1,i=!1;Object.keys(e.changed).forEach(function(e){!n&&t.getFilter(e)?n=!0:!i&&t.getSortOrder(e)&&(i=!0)}),n?this.onFilterChange():i&&this.onSortChange()}},onImport:function(e){if(e.entryCount||e.componentCount){var n=this,i=e.timestamp,o=[e.entryCount?t.ajax({url:"/kanban/entries?exclude(changes)&updatedAt="+i}):null,e.componentCount?t.ajax({url:"/kanban/components?exclude(changes)&updatedAt="+i}):null];t.when.apply(t,o).done(function(e,t){e&&e[0].totalCount&&(n.set(e[0].collection,{remove:!1,silent:!0}),e[0].collection.forEach(function(e){n.get(e._id).serialized=null})),t&&t[0].totalCount&&n.components.set(t[0].collection,{remove:!1,silent:!0}),n.onFilterChange()})}},onUpdated:function(t){var n=this.get(t.entryId);if(n){var i={updates:e.clone(n.get("updates"))};-1===t.arrayIndex?(i[t.property]=t.newValue,i.updates[t.property]=t.updates):(i[t.property]=e.clone(n.get(t.property)),i[t.property][t.arrayIndex]=t.newValue,i.updates[t.property+"."+t.arrayIndex]=t.updates),n.set(i)}}})});