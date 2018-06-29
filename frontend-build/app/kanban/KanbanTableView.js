// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../user","../core/Model"],function(t,e,n,r){"use strict";var a=function(t){if(null==t)return"";var e=typeof t;if("number"===e)return(Math.round(1e3*t)/1e3).toString();if("boolean"===e)return t?"1":"0";if("object"===e)return JSON.stringify(t);var n=t.toString();return-1===n.indexOf("\t")?n:'"'+n.replace(/"/g,'""')+'"'},i=function(t){return t},s=function(t){return t},o=function(){return""},u=function(t){return t},l=function(t){return t?"":"kanban-is-invalid"},c={_id:{exportValue:function(t){return'"'+t+'"'}},nc12:{renderValue:function(t,e,n,r){return r.description?'<a href="#kanban/components/'+t+'" target="_blank">'+t+"</a>":t},exportValue:function(t){return'"'+t+'"'}},description:{tdClassName:l},supplyArea:{tdClassName:l,renderValue:function(t,e,n,r){return r.family?'<a href="#kanban/supplyAreas/'+t+'" target="_blank">'+t+"</a>":t}},family:{tdClassName:l},kanbanQtyUser:{rotated:!0},componentQty:{rotated:!0,tdClassName:l},storageBin:{rotated:!0,tdClassName:l},kanbanIdEmpty:{tdClassName:l},kanbanIdFull:{tdClassName:l},lineCount:{rotated:!0},emptyFullCount:{rotated:!0},stock:{rotated:!0},maxBinQty:{rotated:!0,tdClassName:l},minBinQty:{rotated:!0,tdClassName:l},replenQty:{rotated:!0,tdClassName:l},kind:{rotated:!0,tdClassName:function(t){var e=l(t);return(this.state.auth.manage||this.state.auth.processEngineer)&&(e+=" kanban-is-editable"),e},renderValue:function(t){return e("kanban","kind:"+t+":short")},exportValue:function(t){return e("kanban","kind:"+t+":short")}},workstations:{rowSpan:1,colSpan:6,sortable:!1,tdClassName:function(t,e,n,r){var a=!r.workstationsTotal||!t&&r.locations[n]?"kanban-is-invalid":"";return(this.state.auth.manage||this.state.auth.processEngineer)&&(a+=" kanban-is-editable"),a},parseValue:function(t){return Math.min(99,Math.max(0,parseInt(t,10)||0))}},locations:{rowSpan:1,colSpan:6,sortable:!1,tdClassName:function(t,e,n,r){var a=!r.workstationsTotal||!t&&r.workstations[n]?"kanban-is-invalid":"";return(this.state.auth.manage||this.state.auth.processEngineer)&&(a+=" kanban-is-editable"),a},parseValue:function(t){return t=String(t).toUpperCase(),/^[A-Z][0-9][0-9]$/.test(t)?t:""}},discontinued:{rotated:!0,tdClassName:function(){return this.state.auth.manage||this.state.auth.processEngineer?"kanban-is-editable":""},renderValue:function(t){return'<i class="fa fa-'+(t?"check":"times")+'"></i>'}}};return r.extend({urlRoot:"/kanban/tableViews",clientUrlRoot:"#kanban/tableViews",topicPrefix:"kanban.tableViews",privilegePrefix:"KANBAN",nlsDomain:"kanban",defaults:function(){return{name:"",columns:{},filterMode:"and",filters:{},sort:{_id:1}}},initialize:function(t,e){this.state=e.state},setUpPubsub:function(t){var e=this;t.subscribe("kanban.tableViews.edited",function(t){t.model._id===e.id&&e.handleEditMessage(t.model)})},getHiddenColumns:function(){return Object.keys(this.attributes.columns)},hasAnyHiddenColumn:function(){return this.getHiddenColumns().length>0},getVisibility:function(t){return!1!==this.attributes.columns[t]},setVisibility:function(t,e){e?delete this.attributes.columns[t]:this.attributes.columns[t]=!1,this.trigger("change:visibility",this,t,{}),this.trigger("change:columns",this,this.attributes.columns,{}),this.trigger("change",this,{save:!0})},getFilterMode:function(){return this.get("filterMode")},setFilterMode:function(t){this.set("filterMode",t,{save:!0})},hasAnyFilter:function(){return Object.keys(this.attributes.filters).length>0},getFilter:function(t){return this.attributes.filters[t]||null},setFilter:function(t,e){this.attributes.filters[t]=e,this.trigger("change:filter",this,t,{}),this.trigger("change:filters",this,this.attributes.filters,{}),this.trigger("change",this,{save:!0})},clearFilters:function(){var t=this,e=t.attributes.filters;t.attributes.filters={},Object.keys(e).forEach(function(e){t.trigger("change:filter",t,e,{})}),t.trigger("change:filters",t,t.attributes.filters,{}),t.trigger("change",t,{save:!0})},getSortOrder:function(t){return this.attributes.sort[t]||0},setSortOrder:function(t,e){var n=this,r=n.attributes.sort;n.attributes.sort={},Object.keys(r).forEach(function(t){n.trigger("change:order",n,t,{})}),n.attributes.sort[t]=e,n.trigger("change:order",n,t,{}),n.trigger("change:sort",n,n.attributes.sort,{}),n.trigger("change",n,{save:!0})},getColumnText:function(t){return(e.has("kanban","column:"+t+":title")?e("kanban","column:"+t+":title"):e("kanban","column:"+t)).replace(/\n/g," ").replace(/<br>/g," ").replace(/\s+/," ")},serializeColumns:function(){var t=this,e={list:[],map:[]};return Object.keys(c).forEach(function(n){var r=t.serializeColumn(n);r.visible&&e.list.push(r),e.map[n]=r}),e},serializeColumn:function(n){var r=t.assign({state:this.state,_id:n,thClassName:"",labelClassName:"",tdClassName:o,valueClassName:o,rowSpan:2,colSpan:1,visible:this.getVisibility(n),sortOrder:this.getSortOrder(n),filter:this.getFilter(n),rotated:!1,sortable:!0,withMenu:!0,label:e.bound("kanban","column:"+n),title:e.has("kanban","column:"+n+":title")?e.bound("kanban","column:"+n+":title"):"",renderValue:u,exportValue:a,editorValue:s,parseValue:i},c[n]),l=[],d=[];return r.withMenu&&l.push("kanban-is-with-menu"),r.filter&&l.push("kanban-is-filtered"),r.sortOrder&&l.push("kanban-is-"+(1===r.sortOrder?"asc":"desc")),r.rotated&&d.push("kanban-is-rotated"),r.thClassName=l.join(" "),r.labelClassName=d.join(" "),r},createSort:function(t){var e=Object.keys(this.attributes.sort)[0],n=this.attributes.sort[e];return function(r,a){if(r=r.serialize(t)[e],a=a.serialize(t)[e],null===r)return null===a?0:1===n?-1:1;if(null===a)return 1===n?1:-1;var i=typeof r;return"object"===i?0:"number"===i?1===n?r-a:a-r:"string"===i?1===n?r.localeCompare(a||""):(a||"").localeCompare(r):0}},createFilter:function(t){this.get("filterMode"),this.get("filters");return function(e){return e=e.serialize(t),!0}},handleEditMessage:function(t){}})});