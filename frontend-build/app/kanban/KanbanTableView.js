// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../i18n","../user","../core/Model","../core/util/transliterate","../core/util/parseNumber","app/kanban/templates/popover","app/kanban/templates/containerPopover"],function(_,$,t,user,Model,transliterate,parseNumber,popoverTemplate,containerPopoverTemplate){"use strict";var defaultValueExporter=function(t){if(null==t)return"";var e=typeof t;if("number"===e)return(Math.round(1e3*t)/1e3).toString();if("boolean"===e)return t?"1":"0";if("object"===e)return JSON.stringify(t);var n=t.toString();return-1===n.indexOf("\t")?n:'"'+n.replace(/"/g,'""')+'"'},defaultValueParser=function(t){return t},defaultEditorValue=function(t){return t},defaultTdClassName=function(){return""},defaultTdValueRenderer=function(t){return t},invalidTdClassName=function(t){return t?"":"kanban-is-invalid"},VALIDATION_FILTER_PROPERTIES={workstations:"invalidWorkstations",locations:"invalidLocations"},COLUMNS={_id:{width:7},nc12:{width:13,renderValue:function(t,e,n,r){return r.description?'<a href="#kanban/components/'+t+'" target="_blank">'+t+"</a>":t}},description:{width:45,tdClassName:invalidTdClassName},supplyArea:{width:12,tdClassName:invalidTdClassName,renderValue:function(t,e,n,r){return r.family?'<a href="#kanban/supplyAreas/'+t+'" target="_blank">'+t+"</a>":t}},family:{width:10,tdClassName:invalidTdClassName},kanbanQtyUser:{type:"integer",width:6,rotated:!0,renderValue:function(t){return t.toLocaleString().replace(/\s+/g,"")}},componentQty:{type:"integer",width:9,rotated:!0,tdClassName:invalidTdClassName},storageBin:{width:10,rotated:!0,tdClassName:invalidTdClassName},newStorageBin:{width:10,rotated:!0},kanbanId:{width:10,expand:186,tdClassName:function(t){return 0===t.length?"kanban-is-invalid":""},renderValue:function(t){return t.join(" ")},exportValue:function(t){return t.join(",")}},kanbanIdCount:{type:"integer",width:6,rotated:!0,tdClassName:function(t,e,n,r){return t===r.emptyFullCount?"":t<r.emptyFullCount?"kanban-is-invalid":"kanban-is-warning"},filters:{"kanbanIds:invalid":"$$.emptyFullCount == 0 || $ < $$.emptyFullCount || $ > $$.emptyFullCount","kanbanIds:tooMany":"$$.emptyFullCount > 0 && $ > $$.emptyFullCount","kanbanIds:tooFew":"$$.emptyFullCount != 0 && $ < $$.emptyFullCount"}},lineCount:{type:"integer",width:3,rotated:!0},emptyFullCount:{type:"integer",width:7,rotated:!0},stock:{type:"integer",width:7,rotated:!0},maxBinQty:{type:"integer",width:7,rotated:!0,tdClassName:invalidTdClassName},minBinQty:{type:"integer",width:7,rotated:!0,tdClassName:invalidTdClassName},replenQty:{type:"integer",width:7,rotated:!0,tdClassName:invalidTdClassName},kind:{width:3,rotated:!0,tdClassName:function(t){var e=invalidTdClassName(t);return(this.state.auth.manage||this.state.auth.processEngineer)&&(e+=" kanban-is-editable"),e},renderValue:function(e){return t("kanban","kind:"+e+":short")},exportValue:function(e){return t("kanban","kind:"+e+":short")}},workstations:{width:5,type:"decimal",rowSpan:1,colSpan:6,arrayIndex:6,sortable:!1,tdClassName:function(t,e,n,r){var i=!r.workstationsTotal||!t&&r.locations[n]?"kanban-is-invalid":"";return(this.state.auth.manage||this.state.auth.processEngineer)&&(i+=" kanban-is-editable"),i},renderValue:function(t){return t.toLocaleString()},editorValue:function(t){return t.toLocaleString().replace(/\s+/g,"")},exportValue:function(t){return this.editorValue(t)},parseValue:function(t){return Math.min(99,Math.max(0,parseNumber(t)))}},container:{width:10,tdClassName:function(){return this.state.auth.manage||this.state.auth.processEngineer?"kanban-is-editable":""},renderValue:function(t){return t?'<a href="#kanban/containers/'+encodeURIComponent(t)+'" target="_blank">'+_.escape(t)+"</a>":""},popover:function(t){if(!t.value)return null;var e=this.state.containers.get(t.value);return $(t.td).popover({container:"body",placement:"auto left",trigger:"manual",html:!0,title:e.get("name"),template:popoverTemplate({type:"container"}),content:containerPopoverTemplate({container:e.toJSON()})}).popover("show")},handleAltClick:function(t){t.value&&window.open("/kanban/containers/"+encodeURIComponent(t.value)+".jpg")}},locations:{width:4,rowSpan:1,colSpan:6,arrayIndex:6,sortable:!1,tdClassName:function(t,e,n,r){var i=!r.workstationsTotal||!t&&r.workstations[n]?"kanban-is-invalid":"";return(this.state.auth.manage||this.state.auth.processEngineer||this.state.auth.leader)&&(i+=" kanban-is-editable"),i},parseValue:function(t){return t=String(t).toUpperCase(),/^[A-Z][0-9][0-9]$/.test(t)?t:""}},discontinued:{width:3,rotated:!0,tdClassName:function(){return this.state.auth.manage||this.state.auth.processEngineer?"kanban-is-editable":""},renderValue:function(t){return'<i class="fa fa-'+(t?"check":"times")+'"></i>'},exportValue:function(t){return t?"1":"0"}},comment:{width:40,sortable:!1,expand:0,tdClassName:function(){return this.state.auth.manage||this.state.auth.processEngineer||this.state.auth.leader?"kanban-is-editable":""},renderValue:function(t){return _.escape(t)},parseValue:function(t){return String(t).trim()}}};return Model.extend({urlRoot:"/kanban/tableViews",clientUrlRoot:"#kanban/tableViews",topicPrefix:"kanban.tableViews",privilegePrefix:"KANBAN",nlsDomain:"kanban",defaults:function(){return{name:"",columns:{},filterMode:"and",filters:{},sort:{_id:1}}},initialize:function(t,e){this.state=e.state},setUpPubsub:function(t){var e=this;t.subscribe("kanban.tableViews.edited",function(t){t.model._id===e.id&&e.handleEditMessage(t.model)})},getHiddenColumns:function(){return Object.keys(this.attributes.columns)},hasAnyHiddenColumn:function(){return this.getHiddenColumns().length>0},getVisibility:function(t){return!1!==this.attributes.columns[t]},setVisibility:function(t,e){e?delete this.attributes.columns[t]:this.attributes.columns[t]=!1,this.trigger("change:visibility",this,t,{}),this.trigger("change:columns",this,this.attributes.columns,{}),this.trigger("change",this,{save:!0})},getFilterMode:function(){return this.get("filterMode")},setFilterMode:function(t){this.set("filterMode",t,{save:!0})},hasAnyFilter:function(){return Object.keys(this.attributes.filters).length>0},getFilter:function(t){return this.attributes.filters[t]||null},setFilter:function(t,e){e?this.attributes.filters[t]=e:delete this.attributes.filters[t],this.trigger("change:filter",this,t,{}),this.trigger("change:filters",this,this.attributes.filters,{}),this.trigger("change",this,{save:!0})},setFilters:function(t){var e=this,n=e.attributes.filters;e.attributes.filters=t,Object.keys(n).forEach(function(n){t[n]||e.trigger("change:filter",e,n,{})}),Object.keys(t).forEach(function(t){e.trigger("change:filter",e,t,{})}),e.trigger("change:filters",e,e.attributes.filters,{}),e.trigger("change",e,{save:!0})},clearFilters:function(){var t=this,e=t.attributes.filters;t.attributes.filters={},Object.keys(e).forEach(function(e){t.trigger("change:filter",t,e,{})}),t.trigger("change:filters",t,t.attributes.filters,{}),t.trigger("change",t,{save:!0})},getSortOrder:function(t){return this.attributes.sort[t]||0},setSortOrder:function(t,e){var n=this,r=n.attributes.sort;n.attributes.sort={},Object.keys(r).forEach(function(t){n.trigger("change:order",n,t,{})}),n.attributes.sort[t]=e,n.trigger("change:order",n,t,{}),n.trigger("change:sort",n,n.attributes.sort,{}),n.trigger("change",n,{save:!0})},getColumnText:function(e,n,r){var i=0;n>=0&&(i=n+1,e+="N");var a=!1!==r&&t.has("kanban","column:"+e+":title")?t("kanban","column:"+e+":title",{n:i}):t("kanban","column:"+e,{n:i});return!1===r?a:a.replace(/\n/g,"<br>").replace(/<br>/g," ").replace(/\s+/," ")},serializeColumns:function(){var t=this,e={list:[],map:[]};return Object.keys(COLUMNS).forEach(function(n){var r=t.serializeColumn(n);r.visible&&e.list.push(r),e.map[n]=r}),e},serializeColumn:function(e){var n=_.assign({state:this.state,_id:e,type:"string",thClassName:"",labelClassName:"",tdClassName:defaultTdClassName,valueClassName:defaultTdClassName,arrayIndex:0,rowSpan:2,colSpan:1,visible:this.getVisibility(e),sortOrder:this.getSortOrder(e),filter:this.getFilter(e),rotated:!1,sortable:!0,withMenu:!0,label:t.bound("kanban","column:"+e),title:t.has("kanban","column:"+e+":title")?t.bound("kanban","column:"+e+":title"):"",renderValue:defaultTdValueRenderer,exportValue:defaultValueExporter,editorValue:defaultEditorValue,parseValue:defaultValueParser},COLUMNS[e]),r=[],i=[];return n.withMenu&&r.push("kanban-is-with-menu"),n.filter&&r.push("kanban-is-filtered"),n.sortOrder&&r.push("kanban-is-"+(1===n.sortOrder?"asc":"desc")),n.rotated&&i.push("kanban-is-rotated"),n.thClassName=r.join(" "),n.labelClassName=i.join(" "),n},createSort:function(t){function e(t,i,a){if(t===n.length)return 0;var s=n[t],o=r[t],l=i[s],u=a[s];if(null===l)return null===u?e(t+1,i,a):1===o?-1:1;if(null===u)return 1===o?1:-1;var c=typeof l,d=0;return"number"===c?d=1===o?l-u:u-l:"string"===c&&(d=1===o?l.localeCompare(u||""):(u||"").localeCompare(l)),0===d?e(t+1,i,a):d}var n=_.keys(this.attributes.sort),r=_.values(this.attributes.sort);return _.includes(n,"_id")||(n.push("_id"),r.push(1)),function(n,r){return e(0,n.serialize(t),r.serialize(t))}},createFilter:function(t){var e="and"===this.get("filterMode"),n=this.compileFilters(this.get("filters"));return 0===n.length?function(){return!0}:function(r){r=r.serialize(t);var i,a;if(e){for(i=0;i<n.length;++i)if(a=n[i],!a.check(r[a.columnId],r))return!1;return!0}for(i=0;i<n.length;++i)if(a=n[i],a.check(r[a.columnId],r))return!0;return!1}},compileFilters:function(t){var e=this,n=[];return _.forEach(t,function(t,r){n.push({columnId:r,check:e.compileFilter(r,t)})}),n},compileFilter:function(t,e){return e.check||(e.check=this.filterCompilers[e.type](e.data,t)),e.check},filterCompilers:{empty:function(){return function(t){return void 0===t||null===t||0===t||""===t}},notEmpty:function(){return function(t){return void 0!==t&&null!==t&&0!==t&&""!==t}},eval:function(code){if("?"===code)return this.empty();if("!"===code)return this.notEmpty();var evalFilter=function(){return!0};try{eval("evalFilter = function($, $$) { return "+code+"; }")}catch(t){}return evalFilter},numeric:function(code){if("?"===code)return this.empty();if("!"===code)return this.notEmpty();if(-1!==code.indexOf("$$"))return this.eval(code);var numericFilter=function(){return!0};/^[0-9]+$/.test(code)&&(code="="+code),-1===code.indexOf("$")&&(code="$"+code),code=code.replace(/={2,}/g,"=").replace(/([^<>])=/g,"$1==").replace(/<>/g,"!=");try{eval("numericFilter = function($) { return "+code+"; }")}catch(t){}return numericFilter},text:function(code){if("?"===code)return this.empty();if("!"===code)return this.notEmpty();if(-1!==code.indexOf("$$"))return this.eval(code);var textFilter=function(){return!0};if(/^\/.*?\/$/.test(code))code="return "+code+"i.test($)";else{var words=transliterate(code).replace(/[^A-Za-z0-9 ]+/g,"").toUpperCase().split(" ").filter(function(t){return t.length>0});if(!words.length)return textFilter;code='$ = String($).replace(/[^A-Za-z0-9]+/g, "").toUpperCase(); return '+words.map(function(t){return"$.indexOf("+JSON.stringify(t)+") !== -1"}).join(" && ")}try{eval("textFilter = function($) { "+code+"; }")}catch(t){}return textFilter},select:function(t,e){var n=VALIDATION_FILTER_PROPERTIES[e];if(n){var r="invalid"===t[0];return function(t,e){return e[n]===r}}return function(e){return-1!==t.indexOf(void 0==e?"":String(e))}}},handleEditMessage:function(t){}})});