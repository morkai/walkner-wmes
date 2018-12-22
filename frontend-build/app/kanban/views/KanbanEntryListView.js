define(["underscore","jquery","app/viewport","app/core/View","app/core/util/idAndLabel","app/data/clipboard","app/planning/util/contextMenu","../KanbanSettingCollection","./KanbanSearchDialogView","app/kanban/templates/entryList","app/kanban/templates/entryListColumns","app/kanban/templates/entryListRow","app/kanban/templates/editors/input","app/kanban/templates/editors/select","app/kanban/templates/editors/textArea","app/kanban/templates/filters/numeric","app/kanban/templates/filters/text","app/kanban/templates/filters/select"],function(_,$,viewport,View,idAndLabel,clipboard,contextMenu,KanbanSettingCollection,KanbanSearchDialogView,template,columnsTemplate,rowTemplate,inputEditorTemplate,selectEditorTemplate,textAreaEditorTemplate,numericFilterTemplate,textFilterTemplate,selectFilterTemplate){"use strict";var ROW_HEIGHT=25,SCROLLBAR_HEIGHT=17;return View.extend({template,localTopics:{"planning.contextMenu.hiding":function(e){e.$menu.find('[aria-describedby^="popover"]').popover("destroy")}},events:{contextmenu:function(){return!1},"contextmenu .kanban-td":function(e){return e.currentTarget.classList.contains("kanban-is-with-menu")?this.showColumnMenu(this.idCell(e),e.pageY,e.pageX):this.showCellMenu(this.idCell(e),e.pageY,e.pageX),!1},mousedown:function(e){if(1!==e.which)return!1},"click .kanban-td":function(e){e.ctrlKey&&this.handleQueuePrint(e.currentTarget.parentNode.dataset.modelId)},"dblclick .kanban-td":function(){return!1},"focus .kanban-td":function(e){var t=this.idCell(e);if(void 0!==t.value){var n=this.focusedCell;n&&n.modelId===t.modelId&&n.columnId===t.columnId&&n.arrayIndex===t.arrayIndex&&(t.clicks=n.clicks),this.focusedCell=t,this.focusCell()}},"click .kanban-is-editable":function(e){if(!e.shiftKey&&!e.ctrlKey){var t=this.idCell(e);if(e.altKey)return t.column.handleAltClick&&t.column.handleAltClick(t),!1;this.focusedCell&&this.focusedCell.td===e.currentTarget||(this.focusedCell=t),this.focusedCell.clicks+=1,this.focusedCell.clicks>1&&this.showCellEditor(this.focusedCell)}},"click .kanban-is-with-menu":function(e){e.shiftKey||e.ctrlKey||e.altKey||this.showColumnMenu(this.idCell(e),e.pageY,e.pageX)},"mouseenter .kanban-td":function(e){this.$(".kanban-is-hovered").removeClass("kanban-is-hovered");var t=e.currentTarget,n='.kanban-td[data-column-id="'+t.dataset.columnId+'"]';t.dataset.arrayIndex&&(n+='[data-array-index="'+t.dataset.arrayIndex+'"]'),this.hovered=n,this.$(n).addClass("kanban-is-hovered");var i=this.columns.map[t.dataset.columnId];i&&t.parentNode.dataset.modelId&&(i.expand>=0?this.expandTdValue(t):i.popover&&this.showTdPopover(t))},"mouseleave .kanban-td":function(){this.hovered=null,this.$(".kanban-is-hovered").removeClass("kanban-is-hovered"),this.collapseTdValue(),this.hideTdPopover()}},initialize:function(){this.editing=null,this.focusedCell=null,this.prevFocusedCell=null,this.lastKeyPressAt={},this.listenTo(this.model.tableView,"change:filter change:order",this.onSortableChange),this.listenTo(this.model.tableView,"change:visibility",this.onVisibilityChange),this.listenTo(this.model.entries,"filter",this.onFilter),this.listenTo(this.model.entries,"sort",this.onSort),this.listenTo(this.model.entries,"change",this.onEntryChange),$(window).on("resize."+this.idPrefix,_.debounce(this.resize.bind(this),8)).on("keydown."+this.idPrefix,this.onWindowKeyDown.bind(this))},destroy:function(){$(window).off("."+this.idPrefix)},getTemplateData:function(){return{height:this.calcHeight()}},afterRender:function(){this.$theadInner=this.$(".kanban-thead-innerContainer").on("scroll",this.onTheadScroll.bind(this)),this.$tbodyInner=this.$(".kanban-tbody-innerContainer").on("scroll",this.onTbodyScroll.bind(this)),this.$tbodyOuter=this.$(".kanban-tbody-outerContainer"),this.$scroller=this.$(".kanban-tbody-scroller"),this.$thead=this.$(".kanban-thead-table"),this.$table=this.$(".kanban-tbody-table"),this.$tbody=this.$(".kanban-tbody-tbody"),this.oldScrollTop=0,this.rowCache=null,this.afterRenderRows=null,this.editing=null,this.renderColumns(),this.renderRows()},renderColumns:function(){this.$thead&&(this.columns=this.model.tableView.serializeColumns(),this.$thead.html(columnsTemplate({idPrefix:this.idPrefix,columns:this.columns})))},renderRow:function(e,t){var n=this.rowCache[e.id];if(n){n.classList.remove("kanban-is-selected");for(var i=n.querySelectorAll(".kanban-is-hovered, .kanban-is-selected"),l=0;l<i.length;++l)i[l].classList.remove("kanban-is-hovered","kanban-is-selected")}else n=this.rowCache[e.id]=$.parseHTML(rowTemplate({idPrefix:this.idPrefix,modelIndex:t,columns:this.columns,entry:e.serialize(this.model)}))[0];return this.hovered&&n.querySelector(this.hovered).classList.add("kanban-is-hovered"),this.rowCache[e.id]},renderRows:function(e,t){var n=this;if(n.$tbody){"number"!=typeof e&&(e=-1),"number"!=typeof t&&(t=-1);var i=n.model.entries.filtered,l=n.$tbody[0],o=n.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT,a=Math.ceil(o/ROW_HEIGHT),r=n.model.entries.filtered.length,d=ROW_HEIGHT*(r+1),s=n.$tbodyInner[0].scrollTop;t>=0&&((e=t*ROW_HEIGHT)>=s&&e<s+o-2*ROW_HEIGHT?e=-1:(t+a)*ROW_HEIGHT>=d&&(e=d-a*ROW_HEIGHT)),e>=0&&(s=e);var c=Math.max(0,Math.floor(s/ROW_HEIGHT)),u=c+a,h=u-1,m=-1,f=-1;l.childElementCount&&(m=+l.firstElementChild.dataset.modelIndex,f=+l.lastElementChild.dataset.modelIndex);var p=null;if(null===n.rowCache?n.rowCache={}:c>m&&h>f&&c<f-5?p="down":c<m&&h<f&&h>m+5?p="up":c===m&&h===f&&(p="same"),n.$table.css("top",s+"px"),n.$scroller.css("height",d+"px"),e>=0&&(n.$tbodyInner[0].scrollTop=s),"same"===p)return n.finalizeRenderRows();var b,y,v,g,w,C,I=document.createDocumentFragment();if("down"===p){for(y=c-m,b=h-f,v=1;v<=b;++v)(C=i[w=f+v])&&I.appendChild(n.renderRow(C,w));for(l.appendChild(I),g=0;g<y;++g)l.removeChild(l.firstElementChild)}else if("up"===p){for(y=f-h,b=m-c,v=0;v<b;++v)(C=i[w=c+v])&&I.appendChild(n.renderRow(C,w));for(l.insertBefore(I,l.firstElementChild),g=0;g<y;++g)l.removeChild(l.lastElementChild)}else{i.slice(c,u).forEach(function(e,t){I.appendChild(n.renderRow(e,c+t))}),l.innerHTML="",l.appendChild(I)}n.finalizeRenderRows()}},finalizeRenderRows:function(){var e=this.$tbody;if(this.afterRenderRows)this.afterRenderRows.call(this),this.afterRenderRows=null,this.focusCell();else if(this.focusedCell){var t=this.focusedCell.modelId,n=this.focusedCell.columnId,i=this.focusedCell.arrayIndex,l=e.find('tr[data-model-id="'+t+'"]');if(l.length){var o='td[data-column-id="'+n+'"]';i>=0&&(o+='[data-array-index="'+i+'"]');var a=l.find(o);a[0]===document.activeElement?this.focusCell():document.hasFocus()?a.focus():this.focusCell()}else this.focusCell()}else if(e[0].childElementCount)if(this.prevFocusedCell){var r=this.prevFocusedCell.modelIndex,d=+e[0].firstElementChild.dataset.modelIndex,s=+e[0].lastElementChild.dataset.modelIndex;this.prevFocusedCell.modelIndex<d?r=d:this.prevFocusedCell.modelIndex>s&&(r=s);var c=e.find('tr[data-model-index="'+r+'"]'),u=c.find('td[data-column-id="'+this.prevFocusedCell.columnId+'"]');u.length?u.focus():c[0].children[0].focus()}else e[0].children[0].children[0].focus();if(this.editing){var h=this.editorPositioners[this.editing.columnId];"string"==typeof h&&(h=this.editorPositioners[h]),h&&h.call(this,this.editing)}},calcHeight:function(){return window.innerHeight-(this.el.offsetTop||102)-15},resize:function(){if(this.$tbodyOuter&&this.$tbodyOuter.length){var e=this.calcHeight();this.el.style.height=e+"px",this.$tbodyOuter[0].style.height=e-148+"px",this.renderRows()}},idCell:function(e){var t=e.currentTarget,n=t.parentNode,i=n.dataset.modelId,l=t.dataset.columnId,o=parseInt(t.dataset.arrayIndex,10),a=this.model.entries.get(i),r=a?a.serialize(this.model):{},d=r[l];return isNaN(o)&&(o=-1),d&&o>=0&&(d=d[o]),{td:t,tr:n,columnId:l,column:this.columns.map[l],rowIndex:n.rowIndex,arrayIndex:o,modelIndex:parseInt(n.dataset.modelIndex,10),modelId:i,model:a,data:r,value:d,clicks:e.clicks||0}},resolveCell:function(e){if(!this.$tbody)return null;if(e.tr.parentNode)return e;var t=this.$tbody.find('tr[data-model-id="'+e.modelId+'"] > td[data-column-id="'+e.columnId+'"]');return t.length?this.idCell({currentTarget:t[0],clicks:e.clicks}):null},showColumnMenu:function(e,t,n){var i=this,l=i.$theadInner.find('td[data-column-id="'+e.columnId+'"]');if(!t&&!n){var o=l[0].getBoundingClientRect();t=o.top+o.height,n=o.left}var a=e.column,r=i.model.tableView,d=r.getSortOrder(e.columnId),s={menu:[r.getColumnText(e.columnId),{icon:"fa-sort-amount-asc",label:i.t("menu:sort:asc"),handler:i.handleSort.bind(i,e.columnId,1),disabled:!a.sortable||1===d},{icon:"fa-sort-amount-desc",label:i.t("menu:sort:desc"),handler:i.handleSort.bind(i,e.columnId,-1),disabled:!a.sortable||-1===d},"-",{icon:"fa-eye",label:i.t("menu:show"),handler:i.handleShowColumns.bind(i),disabled:!r.hasAnyHiddenColumn()},{icon:"fa-eye-slash",label:i.t("menu:hide"),handler:i.handleHideColumn.bind(i,e.columnId),disabled:"_id"===e.columnId},"-",{icon:"fa-filter",label:i.t("menu:filter:clear"),handler:i.handleClearFilter.bind(i),disabled:!r.hasAnyFilter()},{label:i.t("menu:filter:and"),handler:i.handleFilterMode.bind(i,"and"),disabled:"and"===r.getFilterMode()},{label:i.t("menu:filter:or"),handler:i.handleFilterMode.bind(i,"or"),disabled:"or"===r.getFilterMode()}]};_.forEach(a.filters,function(t,n){s.menu.push({label:i.t("filters:"+n),handler:i.handleFilterValue.bind(i,e.columnId,"eval",t)})});var c=i.filters[e.columnId];"string"==typeof c&&(c=i.filters[c]),c&&s.menu.push({template:function(t){return t.columnId=e.columnId,c.template(t)},handler:function(t){c.handler.call(i,e,t),t.find(".kanban-filter-help").popover({container:"body",trigger:"hover",placement:"auto bottom",html:!0,title:i.t("filters:help:title:"+c.type),content:i.t("filters:help:content:"+c.type)})}}),contextMenu.show(i,t,n,s)},showCellMenu:function(e,t,n){if(e.model){var i=this,l={menu:[{icon:"fa-download",label:i.t("menu:export"),handler:i.handleExportTable.bind(i)},{icon:"fa-clipboard",label:i.t("menu:copy:table"),handler:i.handleCopyTable.bind(i)},{label:i.t("menu:copy:row"),handler:i.handleCopyRow.bind(i,e.modelId)},{label:i.t("menu:copy:cell"),handler:i.handleCopyCell.bind(i,e.modelId,e.columnId,e.arrayIndex)}]};if(e.model.get("discontinued")||l.menu.unshift({icon:"fa-print",label:i.t("menu:queuePrint"),handler:i.handleQueuePrint.bind(i,e.modelId)}),"container"===e.column._id){var o=this.model.containers.get(e.model.get("container"));o&&o.get("image")&&l.menu.unshift({icon:"fa-image",label:i.t("menu:containerImage"),handler:function(){e.column.handleAltClick(e)}})}if(e.td.classList.contains("kanban-is-editable")&&l.menu.unshift({icon:"fa-pencil",label:i.t("menu:edit"),handler:function(){i.broker.subscribe("planning.contextMenu.hidden",i.showCellEditor.bind(i,i.focusedCell)).setLimit(1)}}),e.td.focus(),!t&&!n){var a=e.td.getBoundingClientRect();t=a.top+a.height/2,n=a.left+a.width/2}contextMenu.show(i,t,n,l)}},handleQueuePrint:function(e){var t=this.model.entries.get(e);if(t)return t.get("discontinued")?viewport.msg.show({type:"warning",time:2500,text:this.t("msg:discontinued",{id:e})}):void this.model.builder.addFromEntry(t.serialize(this.model))},handleCopyTable:function(){var e=this,t=[e.columns.list.map(function(t){if(!t.arrayIndex)return e.model.tableView.getColumnText(t._id);for(var n=[],i=0;i<t.arrayIndex;++i)n.push(e.model.tableView.getColumnText(t._id,i));return n.join("\t")}).join("\t")];e.model.entries.filtered.forEach(function(n){t.push(e.exportEntry(n))}),this.handleCopy("table",t)},handleCopyRow:function(e){this.handleCopy("row",[this.exportEntry(this.model.entries.get(e))])},handleCopyCell:function(e,t,n){var i=this.columns.map[t],l=this.model.entries.get(e).serialize(this.model),o=l[t];n>=0&&(o=o[n]),this.handleCopy("cell",[i.exportValue(o,i,n,l)])},handleCopy:function(e,t){var n=this;clipboard.copy(function(i){i.setData("text/plain",t.join("\r\n")),n.$clipboardMsg&&viewport.msg.hide(n.$clipboardMsg,!0),n.$clipboardMsg=viewport.msg.show({type:"info",time:1500,text:n.t("msg:clipboard:"+e)})})},exportEntry:function(e){e=e.serialize(this.model);var t=[];return this.columns.list.forEach(function(n){n.arrayIndex?e[n._id].forEach(function(i,l){t.push(n.exportValue(i,n,l,e))}):t.push(n.exportValue(e[n._id],n,-1,e))}),t.join("\t")},showCellEditor:function(e){var t=this.editors[e.columnId];t&&(this.editing=e,e.td.classList.remove("kanban-is-editable"),e.td.classList.add("kanban-is-editing"),"string"==typeof t&&(t=this.editors[t]),t.call(this,e))},handleFilterMode:function(e){this.model.tableView.setFilterMode(e)},handleClearFilter:function(){this.model.tableView.clearFilters()},handleSort:function(e,t){this.model.tableView.setSortOrder(e,t)},showColumnVisibilityMenu:function(e){var t=this,n={animate:!1,menu:[t.t("menu:show")].concat(t.model.tableView.getHiddenColumns().map(function(n){return{label:t.model.tableView.getColumnText(n),handler:t.handleShowColumn.bind(t,n,e)}}))};this.broker.subscribe("planning.contextMenu.hidden").setLimit(1).on("message",function(){contextMenu.show(t,e.top-5,e.left-1,n)})},handleShowColumns:function(e){this.showColumnVisibilityMenu(e.currentTarget.getBoundingClientRect())},handleShowColumn:function(e,t){this.model.tableView.setVisibility(e,!0),this.model.tableView.hasAnyHiddenColumn()&&this.showColumnVisibilityMenu(t)},handleHideColumn:function(e){this.model.tableView.setVisibility(e,!1)},handleExportTable:function(){var e=this;e.$exportMsg=viewport.msg.show({type:"info",text:e.t("export:progress")});var t=e.model.tableView,n=e.model.entries.filtered,i={},l=[],o=e.columns.map.kanbanId.visible,a=e.columns.map.container.visible;e.columns.list.forEach(function(n){if(!n.arrayIndex)return i[n._id]={type:n.type,width:n.width,headerRotation:n.rotated?90:0,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:t.getColumnText(n._id,-1,!1).replace(/<br>/g,"\r\n")},void(o&&"family"===n._id?(i.line={type:"string",width:10,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:e.t("column:line")},i.workstations={type:"string",width:4,headerRotation:90,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:e.t("column:workstations")},i.locations={type:"string",width:4,headerRotation:90,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:e.t("column:locations")}):a&&"container"===n._id&&(i.containerLength={type:"integer",width:4,headerRotation:90,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:e.t("kanbanContainers","PROPERTY:length")},i.containerWidth={type:"integer",width:4,headerRotation:90,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:e.t("kanbanContainers","PROPERTY:width")},i.containerHeight={type:"integer",width:4,headerRotation:90,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:e.t("kanbanContainers","PROPERTY:height")}));for(var l=0;l<n.arrayIndex;++l)i[n._id+l]={type:n.type,width:n.width,headerRotation:90,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:t.getColumnText(n._id,l,!1).replace(/<br>/g,"\r\n")}}),n.forEach(function(t){if(t=t.serialize(e.model),i.kanbanId){var n=-1;t.lines.forEach(function(e){t.workstations.forEach(function(i,l){for(var o=2*i,a=t.locations[l],r=0;r<o;++r)c(t,e,t.kanbanId[++n],n,"ST"+(l+1),a)})}),t.workstations.forEach(function(e,i){var l=2*e,o=t.locations[i];t.lines.forEach(function(e){for(var a=0;a<l;++a)c(t,e,t.kanbanId[++n],n,"ST"+(i+1),o)})})}else c(t)});var r={filename:e.t("export:fileName"),sheetName:e.t("export:sheetName"),freezeRows:1,freezeColumns:1+(t.getVisibility("nc12")?1:0)+(t.getVisibility("description")?1:0),headerHeight:100,subHeader:!1,columns:i},d=new FormData;d.append("meta",new Blob([JSON.stringify(r)],{type:"application/json"}),"KANABN_META.json"),d.append("data",new Blob([l.map(function(e){return JSON.stringify(e)}).join("\n")],{type:"text/plain"}),"KANBAN_DATA.txt");var s=e.ajax({type:"POST",url:"/xlsxExporter",processData:!1,contentType:!1,data:d});function c(t,n,i,o,a,r){var d={};e.columns.list.forEach(function(l){if("kanbanId"!==l._id){if(l.arrayIndex)for(var s=0;s<l.arrayIndex;++s)d[l._id+s]=l.exportValue(t[l._id][s],l,s,t);else if(d[l._id]=l.exportValue(t[l._id],l,-1,t),o>=0&&"family"===l._id)d.line=n,d.workstations=a,d.locations=r;else if("container"===l._id){var c=e.model.containers.get(t.container);c?(d.containerLength=c.get("length"),d.containerWidth=c.get("width"),d.containerHeight=c.get("height")):(d.containerLength=0,d.containerWidth=0,d.containerHeight=0)}}else d[l._id]=i}),l.push(d)}s.fail(function(){viewport.msg.hide(e.$exportMsg,!0),viewport.msg.show({type:"error",time:2500,text:e.t("export:failure")})}),s.done(function(t){window.open("/xlsxExporter/"+t),viewport.msg.hide(e.$exportMsg,!0)})},clearCache:function(){this.rowCache=null},onFilter:function(){this.$tbodyInner&&(this.filtered=!0)},onSort:function(){var e=this.filtered;if(this.filtered=!1,this.$tbodyInner){this.clearCache();var t=this.$tbodyInner[0],n=this.model.entries,i=this.focusedCell?n.filteredMap[this.focusedCell.model.id]:null,l=this.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT;if(i){var o=n.filtered.indexOf(i),a=o*ROW_HEIGHT;a>=t.scrollTop&&a<t.scrollTop+l-2*ROW_HEIGHT||e?this.renderRows(-1,o):t.scrollTop=a}else this.prevFocusedCell=this.focusedCell,this.focusedCell=null,0===t.scrollTop?this.renderRows(0):e&&this.prevFocusedCell?this.renderRows(t.scrollTop):t.scrollTop=0}},onEntryChange:function(e){if(this.rowCache){delete this.rowCache[e.id];var t=this.$tbody.find('tr[data-model-id="'+e.id+'"]');if(t.length){var n=this.focusedCell&&this.focusedCell.tr===t[0];if(t.replaceWith(this.renderRow(e,+t[0].dataset.modelIndex)),n){var i=(t=this.$tbody.find('tr[data-model-id="'+e.id+'"]')).find('.kanban-td[data-column-id="'+this.focusedCell.columnId+'"]');this.focusedCell.arrayIndex>=0&&(i=i.filter('[data-array-index="'+this.focusedCell.arrayIndex+'"]')),this.focusedCell=this.idCell({currentTarget:i[0],clicks:this.focusedCell.clicks}),this.focusCell()}}}},focusCell:function(){this.$(".kanban-is-selected").removeClass("kanban-is-selected"),this.$tbody.find(".kanban-is-focused").removeClass("kanban-is-focused");var e=this.focusedCell;if(e){e.td&&(e.td.parentNode.classList.add("kanban-is-selected"),e.td.classList.add("kanban-is-focused"));var t='.kanban-td[data-column-id="'+e.columnId+'"]';e.arrayIndex>=0&&(t+='[data-array-index="'+e.arrayIndex+'"]'),this.$(t).addClass("kanban-is-selected")}},onSortableChange:function(){this.renderColumns()},onVisibilityChange:function(e,t){if(this.focusedCell&&t===this.focusedCell.columnId&&!this.model.tableView.getVisibility(t)){var n=this.focusedCell.td;do{n=n.previousElementSibling}while(n&&n.dataset.columnId===t);n&&(n.parentNode.parentNode?n.focus():this.focusedCell=this.idCell({currentTarget:n}))}this.clearCache(),this.renderColumns(),this.renderRows()},onTheadScroll:function(){this.$tbodyInner[0].scrollLeft=this.$theadInner[0].scrollLeft},onTbodyScroll:function(){this.$theadInner[0].scrollLeft=this.$tbodyInner[0].scrollLeft;var e=this.$tbodyInner[0].scrollTop;this.oldScrollTop!==e&&(this.oldScrollTop=e,this.renderRows())},onWindowKeyDown:function(e){if(this.$tbody){var t=e.target.tagName;"INPUT"!==t&&"SELECT"!==t&&"TEXTAREA"!==t&&(this.focusedCell||this.$tbody.find("tr:first-child > td:first-child").focus(),this.handleTdKeyDown(e,this.focusedCell))}},handleTdKeyDown:function(e,t){var n=e.originalEvent.key;if(1===n.length&&(n=n.toUpperCase()),this.keyHandlers[n]){if(e.preventDefault(),this.editing)return;this.lastKeyPressAt[n]||(this.lastKeyPressAt[n]=Number.MIN_VALUE),this.keyHandlers[n].call(this,e,t),this.lastKeyPressAt[n]=e.timeStamp}},keyHandlers:{ArrowUp:function(e,t){var n=this;if(0!==t.modelIndex){var i=t.tr.previousElementSibling;i?i.cells[t.td.cellIndex].focus():(n.afterRenderRows=function(e,t){var i=n.$table.find('tr[data-model-index="'+e+'"]')[0];i&&i.cells[t]&&i.cells[t].focus()}.bind(null,t.modelIndex-1,t.td.cellIndex),t.tr.parentNode?n.$tbodyInner[0].scrollTop-=ROW_HEIGHT:n.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT-ROW_HEIGHT)}else t.tr.parentNode||(n.$tbodyInner[0].scrollTop=0)},ArrowDown:function(e,t){var n=this,i=t.tr.nextElementSibling;if(t.modelIndex!==n.model.entries.filtered.length-1){if(t.tr.parentNode&&t.tr.rowIndex<t.tr.parentNode.childElementCount-1)if(i.offsetTop+i.offsetHeight<=n.$tbodyInner[0].offsetHeight-SCROLLBAR_HEIGHT)return void i.cells[t.td.cellIndex].focus();n.afterRenderRows=function(e,t){var i=n.$table.find('tr[data-model-index="'+e+'"]')[0];i&&i.cells[t]&&i.cells[t].focus()}.bind(null,t.modelIndex+1,t.td.cellIndex),t.tr.parentNode?n.$tbodyInner[0].scrollTop+=ROW_HEIGHT*(i?1:2):n.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT+ROW_HEIGHT}else t.tr.parentNode||(n.$tbodyInner[0].scrollTop=n.$tbodyInner[0].scrollHeight)},ArrowRight:function(e,t){var n=t.td.nextElementSibling;if(t.tr.parentNode)"filler2"!==n.dataset.columnId&&n.focus();else{var i=this;i.afterRenderRows=function(e,t){var n=i.$table.find('tr[data-model-index="'+e+'"]')[0];if(n){var l=n.cells[t];"filler2"===l.dataset.columnId?l.previousElementSibling.focus():l.focus()}}.bind(null,t.modelIndex,t.td.cellIndex+1),i.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT}},ArrowLeft:function(e,t){var n=t.td.previousElementSibling;if(t.tr.parentNode)n&&n.focus();else{var i=this;i.afterRenderRows=function(e,t){var n=i.$table.find('tr[data-model-index="'+e+'"]')[0];n&&n.cells[Math.max(0,t)].focus()}.bind(null,t.modelIndex,t.td.cellIndex-1),i.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT}},Tab:function(e,t){return e.shiftKey?this.keyHandlers.ShiftTab.call(this,e,t):-1!==t.td.nextElementSibling.tabIndex?t.td.nextElementSibling.focus():+t.tr.dataset.modelIndex==this.model.entries.filtered.length-1?(this.lastKeyPressAt.Home=e.timeStamp,this.keyHandlers.Home.call(this,e,t)):(t.tr.firstElementChild.focus(),void this.keyHandlers.ArrowDown.call(this,e,this.focusedCell))},ShiftTab:function(e,t){return t.tr.firstElementChild!==t.td?t.td.previousElementSibling.focus():"0"===t.tr.dataset.modelIndex?(this.lastKeyPressAt.End=e.timeStamp,this.keyHandlers.End.call(this,e,t)):(t.tr.lastElementChild.previousElementSibling.focus(),void this.keyHandlers.ArrowUp.call(this,e,this.focusedCell))},PageUp:function(e,t){var n=this,i=n.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT,l=Math.ceil(i/ROW_HEIGHT),o=Math.max(0,t.modelIndex-l),a=n.$tbody.find('tr[data-model-index="'+o+'"]');if(a.length)return a.find('td[data-column-id="'+t.columnId+'"]').focus();n.afterRenderRows=function(){var e=n.$tbody[0].rows;(e[t.rowIndex]||e[0]).cells[t.td.cellIndex].focus()},n.$tbodyInner[0].scrollTop-=l*ROW_HEIGHT},PageDown:function(e,t){var n=this,i=n.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT,l=Math.ceil(i/ROW_HEIGHT),o=Math.min(n.model.entries.filtered.length-1,t.modelIndex+l),a=n.$tbody.find('tr[data-model-index="'+o+'"]');if(a.length)return a.find('td[data-column-id="'+t.columnId+'"]').focus();n.afterRenderRows=function(){var e=n.$tbody[0].rows;(e[t.rowIndex]||e[e.length-1]).cells[t.td.cellIndex].focus()},n.$tbodyInner[0].scrollTop+=l*ROW_HEIGHT},Home:function(e,t){var n=this;if(e.timeStamp-n.lastKeyPressAt.Home<500){if("0"===n.$tbody[0].firstElementChild.dataset.modelIndex)return void n.$tbody[0].firstElementChild.firstElementChild.focus();n.afterRenderRows=function(){n.$tbody[0].firstElementChild.firstElementChild.focus()},n.$tbodyInner[0].scrollTop=0}else t.tr.firstElementChild.focus()},End:function(e,t){var n=this;if(e.timeStamp-n.lastKeyPressAt.End<500){if(+n.$tbody[0].lastElementChild.dataset.modelIndex==n.model.entries.filtered.length-1)return void n.$tbody[0].lastElementChild.lastElementChild.previousElementSibling.focus();n.afterRenderRows=function(){n.$tbody[0].lastElementChild.lastElementChild.previousElementSibling.focus()},n.$tbodyInner[0].scrollTop=n.$tbodyInner[0].scrollHeight}else t.tr.lastElementChild.previousElementSibling.focus()},Escape:function(){contextMenu.hide(this)}," ":function(){},Enter:function(e,t){e.altKey&&this.showCellMenu(t),!e.altKey&&t.td.classList.contains("kanban-is-editable")&&this.showCellEditor(t)},C:function(e,t){if(e.ctrlKey&&""===window.getSelection().toString()){e.timeStamp-this.lastKeyPressAt.CtrlA<1e3?this.handleCopyTable():e.timeStamp-this.lastKeyPressAt.C<500?this.handleCopyRow(t.modelId):this.handleCopyCell(t.modelId,t.columnId,t.arrayIndex)}},S:function(e){e.ctrlKey&&this.handleExportTable()},A:function(e){e.ctrlKey&&(this.lastKeyPressAt.CtrlA=e.timeStamp)},F:function(e){if(e.ctrlKey&&!viewport.currentDialog){var t=this,n=new KanbanSearchDialogView({model:t.model});return t.listenToOnce(n,"found",t.find.bind(t)),viewport.showDialog(n),$(".viewport-dialog").removeClass("fade"),t.broker.subscribe("viewport.dialog.hidden").setLimit(1).on("message",function(){t.editing=null,$(".viewport-dialog").addClass("fade")}),t.editing=t.focusedCell,!1}}},find:function(e,t){var n=this;if("component"===e)n.model.tableView.setFilters({nc12:{type:"text",data:t.id}});else if("entry"===e){var i=n.$tbody.find('tr[data-model-id="'+t.id+'"]');if(i.length)return i[0].firstElementChild.focus();if(n.model.entries.filteredMap[t.id]||n.model.tableView.clearFilters(),(i=n.$tbody.find('tr[data-model-id="'+t.id+'"]')).length)return i[0].firstElementChild.focus();n.afterRenderRows=function(){n.$tbody.find('tr[data-model-id="'+t.id+'"]')[0].firstElementChild.focus()},n.$tbodyInner[0].scrollTop=n.model.entries.filtered.indexOf(t)*ROW_HEIGHT}},handleEditorValue:function(e,t,n,i){var l=this,o=l.columns.map[t];if(o){var a=l.model.entries.get(e);if(a){var r=a.serialize(l.model),d=r[t];if(n>=0&&(d=d[n]),i!==d){var s=l.$tbody.find('tr[data-model-id="'+e+'"]').find('td[data-column-id="'+t+'"]');n>=0&&(s=s.filter('[data-array-index="'+n+'"]')),s.attr("class","kanban-td "+o.tdClassName(i,o,n,r)).find(".kanban-td-value").html(o.renderValue(i,o,n,r)),s.focus(),l.updateEditorValue(a,o,n,i).fail(function(){viewport.msg.show({type:"error",time:2500,text:l.t("msg:update:failure")});var e=a.serialize(l.model);s.attr("class","kanban-td "+o.tdClassName(d,o,n,e)).find(".kanban-td-value").html(o.renderValue(d,o,n,e)),l.focusedCell&&l.focusedCell.td!==s[0]||s.focus()})}}}},updateEditorValue:function(e,t,n,i){var l=e.serialize(this.model);return"markerColor"===t._id?this.model.settings.updateRowColor(l.storageBinRow,i):"newMarkerColor"===t._id?this.model.settings.updateRowColor(l.newStorageBinRow,i):this.ajax({method:"PATCH",url:e.url(),data:JSON.stringify({property:t._id,arrayIndex:n,newValue:i})})},afterEdit:function(){this.$tbody.find(".kanban-is-editing").removeClass("kanban-is-editing").addClass("kanban-is-editable"),this.editing=null},editors:{input:function(e,t,n,i){var l=this,o=e.model.serialize(l.model);function a(){l.$id("editor-backdrop").remove(),l.$id("editor-form").remove(),l.afterEdit()}$(document.body).append(inputEditorTemplate({idPrefix:l.idPrefix,columnId:e.columnId,maxLength:t,pattern:n,placeholder:i,value:e.column.editorValue(e.arrayIndex>=0?o[e.columnId][e.arrayIndex]:o[e.columnId],e.column,e.arrayIndex,o)})),l.$id("editor-backdrop").one("click",a),l.$id("editor-form").on("submit",function(){var t=e.column.parseValue(l.$id("editor-input").val(),e.column,e.arrayIndex,e.model.serialize(l.model));return l.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,t),a(),!1}),l.$id("editor-input").on("blur",a).on("keydown",function(e){"Escape"===e.originalEvent.key&&a()}).select(),l.editorPositioners.input.call(l,e)},select:function(e,t,n,i){var l=this,o=Number.MAX_VALUE;function a(){var t=e.column.parseValue(l.$id("editor-input").val(),e.column,e.arrayIndex,e.model.serialize(l.model));return l.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,t),r(),!1}function r(){l.$id("editor-backdrop").remove(),l.$id("editor-form").remove(),l.afterEdit()}$(document.body).append(selectEditorTemplate({idPrefix:l.idPrefix,columnId:e.columnId,multiple:t,options:n.map(function(e){return e.selected=-1!==i.indexOf(e.id),e})})),l.$id("editor-backdrop").one("click",r),l.$id("editor-form").on("submit",a),l.$id("editor-input").on("blur",r).on("keydown",function(e){"Escape"===e.originalEvent.key?r():"Enter"===e.originalEvent.key&&a()}).on("click",function(){var e=Date.now()-o;e>=0&&e<50&&a()}).on("change",function(){o=Date.now()}).focus(),l.editorPositioners.input.call(l,e)},textArea:function(e){var t=this,n=e.model.serialize(t.model);$(document.body).append(textAreaEditorTemplate({idPrefix:t.idPrefix,columnId:e.columnId,value:e.column.editorValue(e.arrayIndex>=0?n[e.columnId][e.arrayIndex]:n[e.columnId],e.column,e.arrayIndex,n)})),t.$id("editor-backdrop").one("click",l);var i=t.$id("editor-input").on("blur",l).on("keydown",function(n){if("Enter"===n.key){if(n.shiftKey||n.ctrlKey||n.altKey){var i=t.$id("editor-input")[0],o=i.selectionStart;return i.value=i.value.substring(0,o)+"\n"+i.value.substring(i.selectionEnd),i.selectionStart=o+1,i.selectionEnd=o+1,!1}return a=e.column.parseValue(t.$id("editor-input").val(),e.column,e.arrayIndex,e.model.serialize(t.model)),t.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,a),l(),!1}var a;"Escape"===n.key&&l()})[0];function l(){t.$id("editor-backdrop").remove(),t.$id("editor-form").remove(),t.afterEdit()}i.selectionStart=i.value.length,i.selectionEnd=i.value.length,i.focus(),t.editorPositioners.textArea.call(t,e)},kind:function(e){var t=this,n=e.td.getBoundingClientRect(),i=e.model.get("kind"),l=[];["kk","pk",null].forEach(function(n){l.push({label:t.t("kind:"+n),handler:t.handleEditorValue.bind(t,e.modelId,e.columnId,e.arrayIndex,n),disabled:i===n})}),contextMenu.show(t,n.top,n.left,l),t.broker.subscribe("planning.contextMenu.hidden",t.afterEdit.bind(t)).setLimit(1)},container:function(e){var t=[{id:null,text:this.t("container:null")}].concat(this.model.containers.map(idAndLabel)),n=[e.model.get("container")];this.editors.select.call(this,e,!1,t,n)},workCenter:function(e){var t=[e.model.get("supplyArea")],n=[{id:"",text:this.t("workCenter:null")}].concat(this.model.supplyAreas.getWorkCenters(t)),i=[e.model.get("workCenter")];this.editors.select.call(this,e,!1,n,i)},discontinued:function(e){this.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,!e.model.get("discontinued")),this.afterEdit()},workstations:function(e){this.editors.input.call(this,e,3,"^([0-9]|[1-9][0-9]|[0-9](.|,)5)$")},locations:function(e){this.editors.input.call(this,e,3,"^[A-Za-z]([0-9][0-9])$","X00")},comment:function(e){this.editors.textArea.call(this,e)},markerColor:function(e){var t=e.model.serialize(this.model),n=[{id:"",text:this.t("color:null")}].concat(KanbanSettingCollection.getMarkerColors()),i=[t[e.columnId]||""];this.editors.select.call(this,e,!1,n,i)},newMarkerColor:"markerColor"},editorPositioners:{contextMenu:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect();contextMenu.position(this,n.top,n.left)}},input:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect();this.$id("editor-form").css({top:n.top+"px",left:n.left+"px"})}},textArea:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect(),i=n.top,l=n.left,o=this.$id("editor-input").outerHeight();i+o>=window.innerHeight-15&&(i+=window.innerHeight-(i+o)-15),l+n.width>=window.innerWidth-15&&(l+=window.innerWidth-(l+n.width)-15),this.$id("editor-form").css({top:i+"px",left:l+"px"})}},kind:"contextMenu",workstations:"input",locations:"input",comment:"textArea"},handleFilterValue:function(e,t,n){contextMenu.hide(this);var i=null;return t&&(i={type:t,data:n}),this.model.tableView.setFilter(e,i),!1},expandTdValue:function(e){var t=e.firstElementChild,n=t.firstElementChild;if(n.textContent.trim().length){var i=e.getBoundingClientRect(),l=n.getBoundingClientRect(),o=window.innerWidth-15-SCROLLBAR_HEIGHT,a=window.innerHeight-15-SCROLLBAR_HEIGHT;if(!(l.left+l.width<o&&l.width<=i.width)){var r=this.columns.map[e.dataset.columnId].expand||i.width;t.style.width=r+"px",i.left+r>o&&(t.style.left=o-(i.left+r)+"px"),e.classList.add("kanban-is-expanded"),(l=t.getBoundingClientRect()).top+l.height>a&&(t.style.top=a-(l.top+l.height)+"px")}}},collapseTdValue:function(){var e=this.$tbody.find(".kanban-is-expanded");e.length&&e.removeClass("kanban-is-expanded").find(".kanban-td-value").css({top:"",left:"",width:""})},showTdPopover:function(e){this.hideTdPopover();var t=this.idCell({currentTarget:e});this.$popover=t.column.popover(t)},hideTdPopover:function(){this.$popover&&(this.$popover.popover("destroy"),this.$popover=null)},filters:{numeric:{type:"numeric",template:numericFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim().replace(/and/gi,"&&").replace(/or/gi,"||");if(""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if("!"===newData)return view.handleFilterValue(cell.columnId,"notEmpty","!");if(/^[0-9]+$/.test(newData))return view.handleFilterValue(cell.columnId,"numeric",newData);var code=newData;-1===newData.indexOf("$$")&&(-1===newData.indexOf("$")&&(code="$"+code),code=code.replace(/=+/g,"=").replace(/([^<>])=/g,"$1==").replace(/<>/g,"!="));try{var o=view.model.entries.at(0).serialize(view.model),v=cell.arrayIndex>=0?o[cell.columnId][cell.arrayIndex]:o[cell.columnId],result=eval("(function($, $$) { return "+code+"; })("+JSON.stringify(v)+", "+JSON.stringify(o)+");");if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return $data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"numeric",newData)})}},text:{type:"text",template:textFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim();if(""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if("!"===newData)return view.handleFilterValue(cell.columnId,"notEmpty","!");if(!/^\/.*?\/$/.test(newData)&&-1===newData.indexOf("$$"))return newData.replace(/[^A-Za-z0-9]+/g,"").length?view.handleFilterValue(cell.columnId,"text",newData):($data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1);var code=newData+(-1===newData.indexOf("$$")?"i.test($)":"");try{var o=view.model.entries.at(0).serialize(view.model),v=cell.arrayIndex>=0?o[cell.columnId][cell.arrayIndex]:o[cell.columnId],result=eval("(function($, $$) { return "+code+"; })("+JSON.stringify(v)+", "+JSON.stringify(o)+");");if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return $data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"text",newData)})}},select:function(e,t,n,i){var l=this,o=t.find(".form-control").prop("multiple",!1!==i),a=(l.model.tableView.getFilter(e.columnId)||{data:[]}).data;t.find("select").html(n.map(function(e){return'<option value="'+e.id+'" '+(_.includes(a,e.id)?"selected":"")+">"+_.escape(e.text)+"</option>"}).join("")),t.find('.btn[data-action="clear"]').on("click",function(){l.handleFilterValue(e.columnId)}),t.find("form").on("submit",function(){var t=o.val();return Array.isArray(t)||(t=[t]),l.handleFilterValue(e.columnId,"select",0===t.length?null:t)})},_id:"numeric",kanbanQtyUser:"numeric",componentQty:"numeric",kanbanId:"text",kanbanIdCount:"numeric",lineCount:"numeric",emptyFullCount:"numeric",stock:"numeric",maxBinQty:"numeric",minBinQty:"numeric",replenQty:"numeric",storageType:"numeric",nc12:"text",description:"text",storageBin:"text",newStorageBin:"text",comment:"text",supplyArea:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,this.model.supplyAreas.getNames())}},workCenter:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){var n=[{id:"",text:this.t("filters:value:empty")}].concat(this.model.supplyAreas.getWorkCenters([]));this.filters.select.call(this,e,t,n)}},family:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){var n=[{id:"",text:this.t("filters:value:empty")}].concat(this.model.supplyAreas.getFamilies([]));this.filters.select.call(this,e,t,n)}},kind:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")},{id:"kk",text:this.t("kind:kk")},{id:"pk",text:this.t("kind:pk")}])}},container:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")}].concat(this.model.containers.map(idAndLabel)))}},workstations:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"valid",text:this.t("filters:value:valid")},{id:"invalid",text:this.t("filters:value:invalid")}],!1)}},locations:"workstations",discontinued:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"true",text:this.t("core","BOOL:true")},{id:"false",text:this.t("core","BOOL:false")}],!1)}},markerColor:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")}].concat(KanbanSettingCollection.getMarkerColors()))}},newMarkerColor:"markerColor"}})});