define(["underscore","jquery","../core/Collection","./KanbanEntry"],function(e,t,n,i){"use strict";return n.extend({model:i,paginate:!1,rqlQuery:"exclude(changes)",initialize:function(e,t){this.settings=t.settings,this.tableView=t.tableView,this.supplyAreas=t.supplyAreas,this.components=t.components,this.filtered=[],this.filteredMap={},this.tableView&&(this.tableView.on("change:filterMode",this.onFilterModeChange,this),this.tableView.on("change:filter sync",this.onFilterChange,this),this.tableView.on("change:sort",this.onSortChange,this),this.supplyAreas.on("add change remove",this.onSupplyAreaUpdate,this),this.components.on("add change remove",this.onComponentUpdate,this),this.settings.on("change:value",this.onSettingChange,this),this.on("change",this.onEntryChange),this.on("reset",this.onFilterChange),this.onFilterChange())},setUpPubsub:function(e){e.subscribe("kanban.import.success",this.onImport.bind(this)),e.subscribe("kanban.entries.updated",this.onUpdated.bind(this))},onFilterModeChange:function(){this.tableView.hasAnyFilter()&&this.onFilterChange()},onFilterChange:function(e,t){var n=this,i="workCenter"===t,o=n.tableView.createFilter(this);n.filtered=[],n.filteredMap={},n.forEach(function(e){e.split().forEach(function(e){i&&(e.serialized=null),o(e)&&(n.filtered.push(e),n.filteredMap[e.id]=e)})}),n.trigger("filter"),n.onSortChange()},onSortChange:function(){this.filtered.sort(this.tableView.createSort(this)),this.trigger("sort")},onSupplyAreaUpdate:function(e){e=e.get("name"),this.forEach(function(t){t.get("supplyArea")===e&&(t.serialized=null)}),this.onFilterChange()},onComponentUpdate:function(e){this.forEach(function(t){t.get("nc12")===e.id&&(t.serialized=null)}),this.onFilterChange()},onEntryChange:function(e){e.serialized=null;var t=this.tableView;if(t){var n=!1,i=!1;Object.keys(e.changed).forEach(function(e){!n&&t.getFilter(e)?n=!0:!i&&t.getSortOrder(e)&&(i=!0)}),n?this.onFilterChange():i&&this.onSortChange()}},onImport:function(e){if(e.entryCount||e.componentCount){var n=this,i=Date.parse(e.updatedAt),o=[e.entryCount?t.ajax({url:"/kanban/entries?exclude(changes)&updatedAt="+i}):null,e.componentCount?t.ajax({url:"/kanban/components?exclude(changes)&updatedAt="+i}):null];t.when.apply(t,o).done(function(e,t){if(t&&t[0].totalCount){var i=t[0].collection,o={};i.forEach(function(e){o[e._id]=!0}),n.components.set(i,{remove:!1,silent:!0}),n.forEach(function(e){o[e.get("nc12")]&&(e.serialized=null)})}if(e&&e[0].totalCount){var a=e[0].collection;n.set(a,{remove:!1,silent:!0}),a.forEach(function(e){n.get(e._id).serialized=null})}n.onFilterChange()})}},onUpdated:function(t){var n=this.get(t.entryId);if(n){var i={updates:e.clone(n.get("updates"))};-1===t.arrayIndex?(i[t.property]=t.newValue,i.updates[t.property]=t.updates):(i[t.property]=e.clone(n.get(t.property)),i[t.property][t.arrayIndex]=t.newValue,i.updates[t.property+"."+t.arrayIndex]=t.updates),n.set(i)}},onSettingChange:function(e){"kanban.rowColors"===e.id&&(this.forEach(function(e){e.serialized=null}),this.onFilterChange())}})});