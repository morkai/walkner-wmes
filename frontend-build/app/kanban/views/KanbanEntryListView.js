// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/viewport","app/core/View","app/core/util/idAndLabel","app/data/clipboard","app/planning/util/contextMenu","./KanbanSearchDialog","app/kanban/templates/entryList","app/kanban/templates/entryListColumns","app/kanban/templates/entryListRow","app/kanban/templates/inputEditor","app/kanban/templates/textAreaEditor","app/kanban/templates/filters/numeric","app/kanban/templates/filters/text","app/kanban/templates/filters/select"],function(_,$,viewport,View,idAndLabel,clipboard,contextMenu,KanbanSearchDialog,template,columnsTemplate,rowTemplate,inputEditorTemplate,textAreaEditorTemplate,numericFilterTemplate,textFilterTemplate,selectFilterTemplate){"use strict";var ROW_HEIGHT=25,SCROLLBAR_HEIGHT=17;return View.extend({template:template,events:{contextmenu:function(){return!1},"contextmenu .kanban-td":function(e){return e.currentTarget.classList.contains("kanban-is-with-menu")?this.showColumnMenu(this.idCell(e),e.pageY,e.pageX):this.showCellMenu(this.idCell(e),e.pageY,e.pageX),!1},mousedown:function(e){if(1!==e.which)return!1},"dblclick .kanban-td":function(){return!1},"focus .kanban-td":function(e){var t=this.idCell(e);if(void 0!==t.value){var n=this.focusedCell;n&&n.modelId===t.modelId&&n.columnId===t.columnId&&n.arrayIndex===t.arrayIndex&&(t.clicks=n.clicks),this.focusedCell=t,this.focusCell()}},"click .kanban-is-editable":function(e){this.focusedCell&&this.focusedCell.td===e.currentTarget||(this.focusedCell=this.idCell(e)),this.focusedCell.clicks+=1,this.focusedCell.clicks>1&&this.showCellEditor(this.idCell(e))},"click .kanban-is-with-menu":function(e){this.showColumnMenu(this.idCell(e),e.pageY,e.pageX)},"mouseenter .kanban-td":function(e){this.$(".kanban-is-hovered").removeClass("kanban-is-hovered");var t=e.currentTarget,n='.kanban-td[data-column-id="'+t.dataset.columnId+'"]';t.dataset.arrayIndex&&(n+='[data-array-index="'+t.dataset.arrayIndex+'"]'),this.$(n).addClass("kanban-is-hovered")},"mouseleave .kanban-td":function(){this.$(".kanban-is-hovered").removeClass("kanban-is-hovered")}},initialize:function(){this.editing=null,this.focusedCell=null,this.prevFocusedCell=null,this.lastKeyPressAt={},this.listenTo(this.model.tableView,"change:filter change:order",this.onSortableChange),this.listenTo(this.model.tableView,"change:visibility",this.onVisibilityChange),this.listenTo(this.model.entries,"filter",this.onFilter),this.listenTo(this.model.entries,"sort",this.onSort),this.listenTo(this.model.entries,"change",this.onEntryChange),$(window).on("resize."+this.idPrefix,_.debounce(this.resize.bind(this),8)).on("keydown."+this.idPrefix,this.onWindowKeyDown.bind(this))},destroy:function(){$(window).off("."+this.idPrefix)},getTemplateData:function(){return{height:this.calcHeight()}},afterRender:function(){var e=this;e.$theadInner=e.$(".kanban-thead-innerContainer").on("scroll",e.onTheadScroll.bind(e)),e.$tbodyInner=e.$(".kanban-tbody-innerContainer").on("scroll",e.onTbodyScroll.bind(e)),e.$tbodyOuter=e.$(".kanban-tbody-outerContainer"),e.$scroller=e.$(".kanban-tbody-scroller"),e.$thead=e.$(".kanban-thead-table"),e.$table=e.$(".kanban-tbody-table"),e.$tbody=e.$(".kanban-tbody-tbody"),e.oldScrollTop=0,e.rowCache=null,e.afterRenderRows=null,e.editing=null,e.renderColumns(),e.renderRows()},renderColumns:function(){this.$thead&&(this.columns=this.model.tableView.serializeColumns(),this.$thead.html(columnsTemplate({idPrefix:this.idPrefix,columns:this.columns})))},renderRow:function(e,t){var n=this,i=n.rowCache[e.id];if(i){i.classList.remove("kanban-is-selected");for(var l=i.querySelectorAll(".kanban-is-hovered, .kanban-is-selected"),o=0;o<l.length;++o)l[o].classList.remove("kanban-is-hovered","kanban-is-selected")}else i=n.rowCache[e.id]=$.parseHTML(rowTemplate({idPrefix:n.idPrefix,modelIndex:t,columns:n.columns,entry:e.serialize(n.model)}))[0];return n.rowCache[e.id]},renderRows:function(e,t){var n=this;if(n.$tbody){"number"!=typeof e&&(e=-1),"number"!=typeof t&&(t=-1);var i=n.model.entries.filtered,l=n.$tbody[0],o=n.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT,r=Math.ceil(o/ROW_HEIGHT),a=n.model.entries.filtered.length,d=ROW_HEIGHT*(a+1),s=n.$tbodyInner[0].scrollTop;t>=0&&(e=t*ROW_HEIGHT,e>=s&&e<s+o-2*ROW_HEIGHT?e=-1:(t+r)*ROW_HEIGHT>=d&&(e=d-r*ROW_HEIGHT)),e>=0&&(s=e);var c=Math.max(0,Math.floor(s/ROW_HEIGHT)),u=c+r,f=u-1,h=-1,m=-1;l.childElementCount&&(h=+l.firstElementChild.dataset.modelIndex,m=+l.lastElementChild.dataset.modelIndex);var p=null;if(null===n.rowCache?n.rowCache={}:c>h&&f>m&&c<m-5?p="down":c<h&&f<m&&f>h+5?p="up":c===h&&f===m&&(p="same"),n.$table.css("top",s+"px"),n.$scroller.css("height",d+"px"),e>=0&&(n.$tbodyInner[0].scrollTop=s),"same"===p)return n.finalizeRenderRows();var b,y,v,C,w,I,x=document.createDocumentFragment();if("down"===p){for(y=c-h,b=f-m,v=1;v<=b;++v)w=m+v,(I=i[w])&&x.appendChild(n.renderRow(I,w));for(l.appendChild(x),C=0;C<y;++C)l.removeChild(l.firstElementChild)}else if("up"===p){for(y=m-f,b=h-c,v=0;v<b;++v)w=c+v,(I=i[w])&&x.appendChild(n.renderRow(I,w));for(l.insertBefore(x,l.firstElementChild),C=0;C<y;++C)l.removeChild(l.lastElementChild)}else{var g=i.slice(c,u);g.forEach(function(e,t){x.appendChild(n.renderRow(e,c+t))}),l.innerHTML="",l.appendChild(x)}n.finalizeRenderRows()}},finalizeRenderRows:function(){var e=this,t=e.$tbody;if(e.afterRenderRows)e.afterRenderRows.call(e),e.afterRenderRows=null,e.focusCell();else if(e.focusedCell){var n=e.focusedCell.modelId,i=e.focusedCell.columnId,l=e.focusedCell.arrayIndex,o=t.find('tr[data-model-id="'+n+'"]');if(o.length){var r='td[data-column-id="'+i+'"]';l>=0&&(r+='[data-array-index="'+l+'"]');var a=o.find(r);a[0]===document.activeElement?e.focusCell():document.hasFocus()?a.focus():e.focusCell()}else e.focusCell()}else if(t[0].childElementCount)if(e.prevFocusedCell){var d=e.prevFocusedCell.modelIndex,s=+t[0].firstElementChild.dataset.modelIndex,c=+t[0].lastElementChild.dataset.modelIndex;e.prevFocusedCell.modelIndex<s?d=s:e.prevFocusedCell.modelIndex>c&&(d=c);var u=t.find('tr[data-model-index="'+d+'"]'),f=u.find('td[data-column-id="'+e.prevFocusedCell.columnId+'"]');f.length?f.focus():u[0].children[0].focus()}else t[0].children[0].children[0].focus();if(e.editing){var h=e.editorPositioners[e.editing.columnId];"string"==typeof h&&(h=e.editorPositioners[h]),h&&h.call(e,e.editing)}},calcHeight:function(){return window.innerHeight-(this.el.offsetTop||102)-15},resize:function(){var e=this.calcHeight();this.el.style.height=e+"px",this.$tbodyOuter[0].style.height=e-148+"px",this.renderRows()},idCell:function(e){var t=e.currentTarget,n=t.parentNode,i=n.dataset.modelId,l=t.dataset.columnId,o=parseInt(t.dataset.arrayIndex,10),r=this.model.entries.get(i),a=r?r.serialize(this.model):{},d=a[l];return isNaN(o)&&(o=-1),d&&o>=0&&(d=d[o]),{td:t,tr:n,columnId:l,column:this.columns.map[l],rowIndex:n.rowIndex,arrayIndex:o,modelIndex:parseInt(n.dataset.modelIndex,10),modelId:i,model:r,data:a,value:d,clicks:e.clicks||0}},resolveCell:function(e){if(!this.$tbody)return null;if(e.tr.parentNode)return e;var t=this.$tbody.find('tr[data-model-id="'+e.modelId+'"] > td[data-column-id="'+e.columnId+'"]');return t.length?this.idCell({currentTarget:t[0],clicks:e.clicks}):null},showColumnMenu:function(e,t,n){var i=this,l=i.$theadInner.find('td[data-column-id="'+e.columnId+'"]');if(!t&&!n){var o=l[0].getBoundingClientRect();t=o.top+o.height,n=o.left}var r=e.column,a=i.model.tableView,d=a.getSortOrder(e.columnId),s={menu:[a.getColumnText(e.columnId),{icon:"fa-sort-amount-asc",label:i.t("menu:sort:asc"),handler:i.handleSort.bind(i,e.columnId,1),disabled:!r.sortable||1===d},{icon:"fa-sort-amount-desc",label:i.t("menu:sort:desc"),handler:i.handleSort.bind(i,e.columnId,-1),disabled:!r.sortable||-1===d},"-",{icon:"fa-eye",label:i.t("menu:show"),handler:i.handleShowColumns.bind(i),disabled:!a.hasAnyHiddenColumn()},{icon:"fa-eye-slash",label:i.t("menu:hide"),handler:i.handleHideColumn.bind(i,e.columnId),disabled:"_id"===e.columnId},"-",{icon:"fa-filter",label:i.t("menu:filter:clear"),handler:i.handleClearFilter.bind(i),disabled:!a.hasAnyFilter()},{label:i.t("menu:filter:and"),handler:i.handleFilterMode.bind(i,"and"),disabled:"and"===a.getFilterMode()},{label:i.t("menu:filter:or"),handler:i.handleFilterMode.bind(i,"or"),disabled:"or"===a.getFilterMode()}]},c=i.filters[e.columnId];"string"==typeof c&&(c=i.filters[c]),c&&s.menu.push({template:function(t){return t.columnId=e.columnId,c.template(t)},handler:function(t){c.handler.call(i,e,t),t.find(".kanban-filter-help").popover({container:"body",trigger:"hover",placement:"auto bottom",html:!0,title:i.t("filters:help:title:"+c.type),content:i.t("filters:help:content:"+c.type)})}}),contextMenu.show(i,t,n,s)},showCellMenu:function(e,t,n){if(e.model){var i=this,l={menu:[{icon:"fa-download",label:i.t("menu:export"),handler:i.handleExportTable.bind(i)},{icon:"fa-clipboard",label:i.t("menu:copy:table"),handler:i.handleCopyTable.bind(i)},{label:i.t("menu:copy:row"),handler:i.handleCopyRow.bind(i,e.modelId)},{label:i.t("menu:copy:cell"),handler:i.handleCopyCell.bind(i,e.modelId,e.columnId,e.arrayIndex)}]};if(e.td.classList.contains("kanban-is-editable")&&l.menu.unshift({icon:"fa-pencil",label:i.t("menu:edit"),handler:function(){i.broker.subscribe("planning.contextMenu.hidden",i.showCellEditor.bind(i,i.focusedCell)).setLimit(1)}}),e.td.focus(),!t&&!n){var o=e.td.getBoundingClientRect();t=o.top+o.height/2,n=o.left+o.width/2}contextMenu.show(i,t,n,l)}},handleCopyTable:function(){var e=this,t=[e.columns.list.map(function(t){if(!t.arrayIndex)return e.model.tableView.getColumnText(t._id);for(var n=[],i=0;i<t.arrayIndex;++i)n.push(e.model.tableView.getColumnText(t._id,i));return n.join("\t")}).join("\t")];e.model.entries.filtered.forEach(function(n){t.push(e.exportEntry(n))}),this.handleCopy("table",t)},handleCopyRow:function(e){this.handleCopy("row",[this.exportEntry(this.model.entries.get(e))])},handleCopyCell:function(e,t,n){var i=this.columns.map[t],l=this.model.entries.get(e).serialize(this.model),o=l[t];n>=0&&(o=o[n]),this.handleCopy("cell",[i.exportValue(o,i,n,l)])},handleCopy:function(e,t){var n=this;clipboard.copy(function(i){i.setData("text/plain",t.join("\r\n")),n.$clipboardMsg&&viewport.msg.hide(n.$clipboardMsg,!0),n.$clipboardMsg=viewport.msg.show({type:"info",time:1500,text:n.t("msg:clipboard:"+e)})})},exportEntry:function(e){e=e.serialize();var t=[];return this.columns.list.forEach(function(n){Array.isArray(e[n._id])?e[n._id].forEach(function(i,l){t.push(n.exportValue(i,n,l,e))}):t.push(n.exportValue(e[n._id],n,-1,e))}),t.join("\t")},showCellEditor:function(e){this.editors[e.columnId]&&(this.editing=e,e.td.classList.remove("kanban-is-editable"),e.td.classList.add("kanban-is-editing"),this.editors[e.columnId].call(this,e))},handleFilterMode:function(e){this.model.tableView.setFilterMode(e)},handleClearFilter:function(){this.model.tableView.clearFilters()},handleSort:function(e,t){this.model.tableView.setSortOrder(e,t)},showColumnVisibilityMenu:function(e){var t=this,n={animate:!1,menu:[t.t("menu:show")].concat(t.model.tableView.getHiddenColumns().map(function(n){return{label:t.model.tableView.getColumnText(n),handler:t.handleShowColumn.bind(t,n,e)}}))};this.broker.subscribe("planning.contextMenu.hidden").setLimit(1).on("message",function(){contextMenu.show(t,e.top-5,e.left-1,n)})},handleShowColumns:function(e){this.showColumnVisibilityMenu(e.currentTarget.getBoundingClientRect())},handleShowColumn:function(e,t){this.model.tableView.setVisibility(e,!0),this.model.tableView.hasAnyHiddenColumn()&&this.showColumnVisibilityMenu(t)},handleHideColumn:function(e){this.model.tableView.setVisibility(e,!1)},handleExportTable:function(){var e=this;e.$exportMsg=viewport.msg.show({type:"info",text:e.t("export:progress")});var t=e.model.tableView,n=e.model.entries.filtered,i={},l=[];e.columns.list.forEach(function(e){if(!e.arrayIndex)return void(i[e._id]={type:e.type,width:e.width,headerRotation:e.rotated?90:0,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:t.getColumnText(e._id,-1,!1).replace(/<br>/g,"\r\n")});for(var n=0;n<e.arrayIndex;++n)i[e._id+n]={type:e.type,width:e.width,headerRotation:90,headerAlignmentH:"Center",headerAlignmentV:"Center",caption:t.getColumnText(e._id,n,!1).replace(/<br>/g,"\r\n")}}),n.forEach(function(t){t=t.serialize(e.model);var n={};e.columns.list.forEach(function(e){if(!e.arrayIndex)return void(n[e._id]=e.exportValue(t[e._id],e,-1,t));for(var i=0;i<e.arrayIndex;++i)n[e._id+i]=e.exportValue(t[e._id][i],e,i,t)}),l.push(n)});var o=e.ajax({type:"POST",url:"/xlsxExporter",data:JSON.stringify({filename:e.t("export:fileName"),sheetName:e.t("export:sheetName"),freezeRows:1,freezeColumns:1+(t.getVisibility("nc12")?1:0)+(t.getVisibility("description")?1:0),headerHeight:100,subHeader:!1,columns:i,data:l})});o.fail(function(){viewport.msg.hide(e.$exportMsg,!0),viewport.msg.show({type:"error",time:2500,text:e.t("export:failure")})}),o.done(function(t){window.open("/xlsxExporter/"+t),viewport.msg.hide(e.$exportMsg,!0)})},clearCache:function(){this.rowCache=null},onFilter:function(){this.$tbodyInner&&(this.filtered=!0)},onSort:function(){var e=this,t=e.filtered;if(e.filtered=!1,e.$tbodyInner){e.clearCache();var n=e.$tbodyInner[0],i=e.model.entries,l=e.focusedCell?i.filteredMap[e.focusedCell.model.id]:null,o=e.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT;if(l){var r=i.filtered.indexOf(l),a=r*ROW_HEIGHT;a>=n.scrollTop&&a<n.scrollTop+o-2*ROW_HEIGHT||t?e.renderRows(-1,r):n.scrollTop=a}else e.prevFocusedCell=e.focusedCell,e.focusedCell=null,0===n.scrollTop?e.renderRows(0):t&&e.prevFocusedCell?e.renderRows(n.scrollTop):n.scrollTop=0}},onEntryChange:function(e){if(this.rowCache){delete this.rowCache[e.id];var t=this.$tbody.find('tr[data-model-id="'+e.id+'"]');if(t.length){var n=this.focusedCell&&this.focusedCell.tr===t[0];if(t.replaceWith(this.renderRow(e,+t[0].dataset.modelIndex)),n){t=this.$tbody.find('tr[data-model-id="'+e.id+'"]');var i=t.find('.kanban-td[data-column-id="'+this.focusedCell.columnId+'"]');this.focusedCell.arrayIndex>=0&&(i=i.filter('[data-array-index="'+this.focusedCell.arrayIndex+'"]')),this.focusedCell=this.idCell({currentTarget:i[0],clicks:this.focusedCell.clicks}),this.focusCell()}}}},focusCell:function(){this.$(".kanban-is-selected").removeClass("kanban-is-selected"),this.$tbody.find(".kanban-is-focused").removeClass("kanban-is-focused");var e=this.focusedCell;if(e){e.td&&(e.td.parentNode.classList.add("kanban-is-selected"),e.td.classList.add("kanban-is-focused"));var t='.kanban-td[data-column-id="'+e.columnId+'"]';e.arrayIndex>=0&&(t+='[data-array-index="'+e.arrayIndex+'"]'),this.$(t).addClass("kanban-is-selected")}},onSortableChange:function(e,t){this.renderColumns()},onVisibilityChange:function(e,t){if(this.focusedCell&&t===this.focusedCell.columnId&&!this.model.tableView.getVisibility(t)){var n=this.focusedCell.td;do{n=n.previousElementSibling}while(n&&n.dataset.columnId===t);n&&(n.parentNode.parentNode?n.focus():this.focusedCell=this.idCell({currentTarget:n}))}this.clearCache(),this.renderColumns(),this.renderRows()},onTheadScroll:function(){this.$tbodyInner[0].scrollLeft=this.$theadInner[0].scrollLeft},onTbodyScroll:function(){this.$theadInner[0].scrollLeft=this.$tbodyInner[0].scrollLeft;var e=this.$tbodyInner[0].scrollTop;this.oldScrollTop!==e&&(this.oldScrollTop=e,this.renderRows())},onWindowKeyDown:function(e){var t=e.target.tagName;"INPUT"!==t&&"SELECT"!==t&&"TEXTAREA"!==t&&(this.focusedCell||this.$tbody.find("tr:first-child > td:first-child").focus(),this.handleTdKeyDown(e,this.focusedCell))},handleTdKeyDown:function(e,t){var n=e.originalEvent.key;if(1===n.length&&(n=n.toUpperCase()),this.keyHandlers[n]){if(e.preventDefault(),this.editing)return;this.lastKeyPressAt[n]||(this.lastKeyPressAt[n]=Number.MIN_VALUE),this.keyHandlers[n].call(this,e,t),this.lastKeyPressAt[n]=e.timeStamp}},keyHandlers:{ArrowUp:function(e,t){var n=this;if(0===t.modelIndex)return void(t.tr.parentNode||(n.$tbodyInner[0].scrollTop=0));var i=t.tr.previousElementSibling;if(i)return void i.cells[t.td.cellIndex].focus();n.afterRenderRows=function(e,t){var i=n.$table.find('tr[data-model-index="'+e+'"]')[0];i&&i.cells[t]&&i.cells[t].focus()}.bind(null,t.modelIndex-1,t.td.cellIndex),t.tr.parentNode?n.$tbodyInner[0].scrollTop-=ROW_HEIGHT:n.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT-ROW_HEIGHT},ArrowDown:function(e,t){var n=this,i=t.tr.nextElementSibling;if(t.modelIndex===n.model.entries.filtered.length-1)return void(t.tr.parentNode||(n.$tbodyInner[0].scrollTop=n.$tbodyInner[0].scrollHeight));if(t.tr.parentNode&&t.tr.rowIndex<t.tr.parentNode.childElementCount-1){if(i.offsetTop+i.offsetHeight<=n.$tbodyInner[0].offsetHeight-SCROLLBAR_HEIGHT)return void i.cells[t.td.cellIndex].focus()}n.afterRenderRows=function(e,t){var i=n.$table.find('tr[data-model-index="'+e+'"]')[0];i&&i.cells[t]&&i.cells[t].focus()}.bind(null,t.modelIndex+1,t.td.cellIndex),t.tr.parentNode?n.$tbodyInner[0].scrollTop+=ROW_HEIGHT*(i?1:2):n.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT+ROW_HEIGHT},ArrowRight:function(e,t){var n=t.td.nextElementSibling;if(t.tr.parentNode)return void("filler2"!==n.dataset.columnId&&n.focus());var i=this;i.afterRenderRows=function(e,t){var n=i.$table.find('tr[data-model-index="'+e+'"]')[0];if(n){var l=n.cells[t];"filler2"===l.dataset.columnId?l.previousElementSibling.focus():l.focus()}}.bind(null,t.modelIndex,t.td.cellIndex+1),i.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT},ArrowLeft:function(e,t){var n=t.td.previousElementSibling;if(t.tr.parentNode)return void(n&&n.focus());var i=this;i.afterRenderRows=function(e,t){var n=i.$table.find('tr[data-model-index="'+e+'"]')[0];n&&n.cells[Math.max(0,t)].focus()}.bind(null,t.modelIndex,t.td.cellIndex-1),i.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT},Tab:function(e,t){var n=this;return e.shiftKey?n.keyHandlers.ShiftTab.call(n,e,t):-1!==t.td.nextElementSibling.tabIndex?t.td.nextElementSibling.focus():+t.tr.dataset.modelIndex==n.model.entries.filtered.length-1?(n.lastKeyPressAt.Home=e.timeStamp,n.keyHandlers.Home.call(n,e,t)):(t.tr.firstElementChild.focus(),void n.keyHandlers.ArrowDown.call(n,e,n.focusedCell))},ShiftTab:function(e,t){var n=this;return t.tr.firstElementChild!==t.td?t.td.previousElementSibling.focus():"0"===t.tr.dataset.modelIndex?(n.lastKeyPressAt.End=e.timeStamp,n.keyHandlers.End.call(n,e,t)):(t.tr.lastElementChild.previousElementSibling.focus(),void n.keyHandlers.ArrowUp.call(n,e,n.focusedCell))},PageUp:function(e,t){var n=this,i=n.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT,l=Math.ceil(i/ROW_HEIGHT),o=Math.max(0,t.modelIndex-l),r=n.$tbody.find('tr[data-model-index="'+o+'"]');if(r.length)return r.find('td[data-column-id="'+t.columnId+'"]').focus();n.afterRenderRows=function(){var e=n.$tbody[0].rows;(e[t.rowIndex]||e[0]).cells[t.td.cellIndex].focus()},n.$tbodyInner[0].scrollTop-=l*ROW_HEIGHT},PageDown:function(e,t){var n=this,i=n.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT,l=Math.ceil(i/ROW_HEIGHT),o=Math.min(n.model.entries.filtered.length-1,t.modelIndex+l),r=n.$tbody.find('tr[data-model-index="'+o+'"]');if(r.length)return r.find('td[data-column-id="'+t.columnId+'"]').focus();n.afterRenderRows=function(){var e=n.$tbody[0].rows;(e[t.rowIndex]||e[e.length-1]).cells[t.td.cellIndex].focus()},n.$tbodyInner[0].scrollTop+=l*ROW_HEIGHT},Home:function(e,t){var n=this;if(e.timeStamp-n.lastKeyPressAt.Home<500){if("0"===n.$tbody[0].firstElementChild.dataset.modelIndex)return void n.$tbody[0].firstElementChild.firstElementChild.focus();n.afterRenderRows=function(){n.$tbody[0].firstElementChild.firstElementChild.focus()},n.$tbodyInner[0].scrollTop=0}else t.tr.firstElementChild.focus()},End:function(e,t){var n=this;if(e.timeStamp-n.lastKeyPressAt.End<500){if(n.$tbody[0].lastElementChild.dataset.modelIndex===n.model.entries.filtered.length-1)return void n.$tbody[0].lastElementChild.lastElementChild.previousElementSibling.focus();n.afterRenderRows=function(){n.$tbody[0].lastElementChild.lastElementChild.previousElementSibling.focus()},n.$tbodyInner[0].scrollTop=n.$tbodyInner[0].scrollHeight}else t.tr.lastElementChild.previousElementSibling.focus()},Escape:function(){contextMenu.hide(this)}," ":function(){},Enter:function(e,t){e.altKey&&this.showCellMenu(t),!e.altKey&&t.td.classList.contains("kanban-is-editable")&&this.showCellEditor(t)},C:function(e,t){if(e.ctrlKey){var n=this;e.timeStamp-n.lastKeyPressAt.CtrlA<1e3?n.handleCopyTable():e.timeStamp-n.lastKeyPressAt.C<500?n.handleCopyRow(t.modelId):n.handleCopyCell(t.modelId,t.columnId,t.arrayIndex)}},S:function(e){e.ctrlKey&&this.handleExportTable()},A:function(e){e.ctrlKey&&(this.lastKeyPressAt.CtrlA=e.timeStamp)},F:function(e){if(e.ctrlKey&&!viewport.currentDialog){var t=this,n=new KanbanSearchDialog({model:t.model});return t.editing=t.focusedCell,viewport.showDialog(n),t.listenToOnce(n,"found",function(e,n){if("component"===e)t.model.tableView.setFilters({nc12:{type:"text",data:n.id}});else if("entry"===e){var i=t.$tbody.find('tr[data-model-id="'+n.id+'"]');if(i.length)return i[0].firstElementChild.focus();if(t.model.entries.filteredMap[n.id]||t.model.tableView.clearFilters(),i=t.$tbody.find('tr[data-model-id="'+n.id+'"]'),i.length)return i[0].firstElementChild.focus();t.afterRenderRows=function(){t.$tbody.find('tr[data-model-id="'+n.id+'"]')[0].firstElementChild.focus()},t.$tbodyInner[0].scrollTop=t.model.entries.filtered.indexOf(n)*ROW_HEIGHT}}),$(".viewport-dialog").removeClass("fade"),t.broker.subscribe("viewport.dialog.hidden").setLimit(1).on("message",function(){t.editing=null,$(".viewport-dialog").addClass("fade")}),!1}}},handleEditorValue:function(e,t,n,i){var l=this,o=l.columns.map[t];if(o){var r=l.model.entries.get(e);if(r){var a=r.serialize(),d=a[t];if(n>=0&&(d=d[n]),i!==d){var s=l.$tbody.find('tr[data-model-id="'+e+'"]'),c=s.find('td[data-column-id="'+t+'"]');n>=0&&(c=c.filter('[data-array-index="'+n+'"]')),c.attr("class","kanban-td "+o.tdClassName(i,o,n,a)).find(".kanban-td-value").html(o.renderValue(i,o,n,a)),c.focus();l.ajax({method:"PATCH",url:r.url(),data:JSON.stringify({property:t,arrayIndex:n,newValue:i})}).fail(function(){viewport.msg.show({type:"error",time:2500,text:l.t("msg:update:failure")});var e=r.serialize();c.attr("class","kanban-td "+o.tdClassName(d,o,n,e)).find(".kanban-td-value").html(o.renderValue(d,o,n,e)),l.focusedCell&&l.focusedCell.td!==c[0]||c.focus()})}}}},afterEdit:function(){this.$tbody.find(".kanban-is-editing").removeClass("kanban-is-editing").addClass("kanban-is-editable"),this.editing=null},editors:{input:function(e,t,n,i){function l(){var t=e.column.parseValue(a.$id("editor-input").val(),e.column,e.arrayIndex,e.model.serialize());return a.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,t),o(),!1}function o(){a.$id("editor-backdrop").remove(),a.$id("editor-form").remove(),a.afterEdit()}function r(e){"Escape"===e.originalEvent.key&&o()}var a=this,d=e.model.serialize();$(document.body).append(inputEditorTemplate({idPrefix:a.idPrefix,columnId:e.columnId,maxLength:t,pattern:n,placeholder:i,value:e.column.editorValue(e.arrayIndex>=0?d[e.columnId][e.arrayIndex]:d[e.columnId],e.column,e.arrayIndex,d)})),a.$id("editor-backdrop").one("click",o),a.$id("editor-form").on("submit",l),a.$id("editor-input").on("blur",o).on("keydown",r).select(),a.editorPositioners.input.call(a,e)},textArea:function(e){function t(){var t=e.column.parseValue(l.$id("editor-input").val(),e.column,e.arrayIndex,e.model.serialize());return l.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,t),n(),!1}function n(){l.$id("editor-backdrop").remove(),l.$id("editor-form").remove(),l.afterEdit()}function i(e){if("Enter"===e.key){if(e.shiftKey||e.ctrlKey||e.altKey){var i=l.$id("editor-input")[0],o=i.selectionStart;return i.value=i.value.substring(0,o)+"\n"+i.value.substring(i.selectionEnd),i.selectionStart=o+1,i.selectionEnd=o+1,!1}return t()}"Escape"===e.key&&n()}var l=this,o=e.model.serialize();$(document.body).append(textAreaEditorTemplate({idPrefix:l.idPrefix,columnId:e.columnId,value:e.column.editorValue(e.arrayIndex>=0?o[e.columnId][e.arrayIndex]:o[e.columnId],e.column,e.arrayIndex,o)})),l.$id("editor-backdrop").one("click",n),l.$id("editor-input").on("blur",n).on("keydown",i).select(),l.editorPositioners.textArea.call(l,e)},kind:function(e){var t=this,n=e.td.getBoundingClientRect(),i=e.model.get("kind"),l=[];["kk","pk",null].forEach(function(n){l.push({label:t.t("kind:"+n),handler:t.handleEditorValue.bind(t,e.modelId,e.columnId,e.arrayIndex,n),disabled:i===n})}),contextMenu.show(t,n.top,n.left,l),t.broker.subscribe("planning.contextMenu.hidden",t.afterEdit.bind(t)).setLimit(1)},discontinued:function(e){this.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,!e.model.get("discontinued")),this.afterEdit()},workstations:function(e){this.editors.input.call(this,e,3,"^([0-9]|[1-9][0-9]|[0-9](.|,)5)$")},locations:function(e){this.editors.input.call(this,e,3,"^[A-Za-z]([0-9][0-9])$","X00")},comment:function(e){this.editors.textArea.call(this,e)}},editorPositioners:{contextMenu:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect();contextMenu.position(this,n.top,n.left)}},input:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect();this.$id("editor-form").css({top:n.top+"px",left:n.left+"px"})}},textArea:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect(),i=n.top,l=n.left,o=this.$id("editor-input").outerHeight();i+o>=window.innerHeight-15&&(i+=window.innerHeight-(i+o)-15),l+n.width>=window.innerWidth-15&&(l+=window.innerWidth-(l+n.width)-15),this.$id("editor-form").css({top:i+"px",left:l+"px"})}},kind:"contextMenu",workstations:"input",locations:"input",comment:"textArea"},handleFilterValue:function(e,t,n){contextMenu.hide(this);var i=null;return t&&(i={type:t,data:n}),this.model.tableView.setFilter(e,i),!1},filters:{numeric:{type:"numeric",template:numericFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim().replace(/and/gi,"&&").replace(/or/gi,"||").replace(/=+/g,"=");if(""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if(/^[0-9]+$/.test(newData))return view.handleFilterValue(cell.columnId,"numeric",newData);var code=newData;-1===newData.indexOf("$")&&(code="$"+code),code=code.replace(/([^<>])=/g,"$1==").replace(/<>/g,"!=");try{var result=eval("(function($) { return "+code+"; })(666);");if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return $data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"numeric",newData)})}},text:{type:"text",template:textFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim();if(""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if(!/^\/.*?\/$/.test(newData))return newData.replace(/[^A-Za-z0-9]+/g,"").length?view.handleFilterValue(cell.columnId,"text",newData):($data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1);var code=newData+"i.test($)";try{var result=eval("(function($) { return "+code+'; })("abc");');if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return $data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"text",newData)})}},select:function(e,t,n,i){var l=this,o=t.find(".form-control").prop("multiple",!1!==i),r=(l.model.tableView.getFilter(e.columnId)||{data:[]}).data;t.find("select").html(n.map(function(e){return'<option value="'+e.id+'" '+(_.includes(r,e.id)?"selected":"")+">"+_.escape(e.text)+"</option>"}).join("")),t.find('.btn[data-action="clear"]').on("click",function(){l.handleFilterValue(e.columnId)}),t.find("form").on("submit",function(){var t=o.val();return Array.isArray(t)||(t=[t]),l.handleFilterValue(e.columnId,"select",0===t.length?null:t)})},_id:"numeric",kanbanQtyUser:"numeric",componentQty:"numeric",kanbanIdEmpty:"numeric",kanbanIdFull:"numeric",lineCount:"numeric",emptyFullCount:"numeric",stock:"numeric",maxBinQty:"numeric",minBinQty:"numeric",replenQty:"numeric",nc12:"text",description:"text",storageBin:"text",supplyArea:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,this.model.entries.getSupplyAreas())}},family:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")}].concat(this.model.supplyAreas.getFamilies()))}},kind:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")},{id:"kk",text:this.t("kind:kk")},{id:"pk",text:this.t("kind:pk")}])}},workstations:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"valid",text:this.t("filters:value:valid")},{id:"invalid",text:this.t("filters:value:invalid")}],!1)}},locations:"workstations",discontinued:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"true",text:this.t("core","BOOL:true")},{id:"false",text:this.t("core","BOOL:false")}],!1)}}}})});