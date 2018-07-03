// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/viewport","app/core/View","app/core/util/idAndLabel","app/data/clipboard","app/planning/util/contextMenu","app/kanban/templates/entryList","app/kanban/templates/entryListColumns","app/kanban/templates/entryListRow","app/kanban/templates/inputEditor","app/kanban/templates/filters/numeric","app/kanban/templates/filters/text","app/kanban/templates/filters/select"],function(_,$,viewport,View,idAndLabel,clipboard,contextMenu,template,columnsTemplate,rowTemplate,inputEditorTemplate,numericFilterTemplate,textFilterTemplate,selectFilterTemplate){"use strict";var ROW_HEIGHT=25,SCROLLBAR_HEIGHT=17;return View.extend({template:template,events:{contextmenu:function(){return!1},mousedown:function(e){if(1!==e.which)return!1},"dblclick .kanban-td":function(){return!1},"focus .kanban-td":function(e){var t=this.idCell(e);if(void 0!==t.value){this.$tbody.find(".kanban-is-selected").removeClass("kanban-is-selected"),this.$tbody.find(".kanban-is-focused").removeClass("kanban-is-focused"),t.td.classList.add("kanban-is-focused"),t.tr.classList.add("kanban-is-selected");var n=this.focusedCell;n&&n.modelId===t.modelId&&n.columnId===t.columnId&&n.arrayIndex===t.arrayIndex&&(t.clicks=n.clicks),this.focusedCell=t}},"click .kanban-is-editable":function(e){this.focusedCell&&this.focusedCell.td===e.currentTarget||(this.focusedCell=this.idCell(e)),this.focusedCell.clicks+=1,this.focusedCell.clicks>1&&this.showCellEditor(this.idCell(e))},"click .kanban-is-with-menu":function(e){this.showColumnMenu(this.idCell(e),e.pageY,e.pageX)}},initialize:function(){this.editing=null,this.focusedCell=null,this.prevFocusedCell=null,this.lastKeyPressAt={},this.listenTo(this.model.tableView,"change:filter change:order",this.onSortableChange),this.listenTo(this.model.tableView,"change:visibility",this.onVisibilityChange),this.listenTo(this.model.entries,"filter",this.onFilter),this.listenTo(this.model.entries,"sort",this.onSort),this.listenTo(this.model.entries,"change",this.onEntryChange),$(window).on("resize."+this.idPrefix,_.debounce(this.resize.bind(this),8)).on("keydown."+this.idPrefix,this.onWindowKeyDown.bind(this))},destroy:function(){$(window).off("."+this.idPrefix)},getTemplateData:function(){return{height:this.calcHeight()}},afterRender:function(){var e=this;e.$theadInner=e.$(".kanban-thead-innerContainer").on("scroll",e.onTheadScroll.bind(e)),e.$tbodyInner=e.$(".kanban-tbody-innerContainer").on("scroll",e.onTbodyScroll.bind(e)),e.$tbodyOuter=e.$(".kanban-tbody-outerContainer"),e.$scroller=e.$(".kanban-tbody-scroller"),e.$thead=e.$(".kanban-thead-table"),e.$table=e.$(".kanban-tbody-table"),e.$tbody=e.$(".kanban-tbody-tbody"),e.oldScrollTop=0,e.rowCache=null,e.afterRenderRows=null,e.editing=null,e.renderColumns(),e.renderRows()},renderColumns:function(){this.$thead&&(this.columns=this.model.tableView.serializeColumns(),this.$thead.html(columnsTemplate({idPrefix:this.idPrefix,columns:this.columns})))},renderRow:function(e,t){var n=this;return n.rowCache[e.id]||(n.rowCache[e.id]=$.parseHTML(rowTemplate({idPrefix:n.idPrefix,modelIndex:t,columns:n.columns,entry:e.serialize(n.model)}))[0]),n.rowCache[e.id]},renderRows:function(e,t){var n=this;if(n.$tbody){"number"!=typeof e&&(e=-1),"number"!=typeof t&&(t=-1);var i=n.model.entries.filtered,l=n.$tbody[0],o=n.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT,a=Math.ceil(o/ROW_HEIGHT),d=n.model.entries.filtered.length,r=ROW_HEIGHT*(d+1),s=n.$tbodyInner[0].scrollTop;t>=0&&(e=t*ROW_HEIGHT,e>=s&&e<s+o-2*ROW_HEIGHT?e=-1:(t+a)*ROW_HEIGHT>=r&&(e=r-a*ROW_HEIGHT)),e>=0&&(s=e);var c=Math.max(0,Math.floor(s/ROW_HEIGHT)),u=c+a,f=u-1,h=-1,m=-1;l.childElementCount&&(h=+l.firstElementChild.dataset.modelIndex,m=+l.lastElementChild.dataset.modelIndex);var p=null;if(null===n.rowCache?n.rowCache={}:c>h&&f>m&&c<m-5?p="down":c<h&&f<m&&f>h+5?p="up":c===h&&f===m&&(p="same"),n.$table.css("top",s+"px"),n.$scroller.css("height",r+"px"),e>=0&&(n.$tbodyInner[0].scrollTop=s),"same"===p)return n.finalizeRenderRows();var b,y,v,I,w,C,x=document.createDocumentFragment();if("down"===p){for(y=c-h,b=f-m,v=1;v<=b;++v)w=m+v,(C=i[w])&&x.appendChild(n.renderRow(C,w));for(l.appendChild(x),I=0;I<y;++I)l.removeChild(l.firstElementChild)}else if("up"===p){for(y=m-f,b=h-c,v=0;v<b;++v)w=c+v,(C=i[w])&&x.appendChild(n.renderRow(C,w));for(l.insertBefore(x,l.firstElementChild),I=0;I<y;++I)l.removeChild(l.lastElementChild)}else{var g=i.slice(c,u);g.forEach(function(e,t){x.appendChild(n.renderRow(e,c+t))}),l.innerHTML="",l.appendChild(x)}n.finalizeRenderRows()}},finalizeRenderRows:function(){var e=this,t=e.$tbody;if(e.afterRenderRows)e.afterRenderRows.call(e),e.afterRenderRows=null;else if(e.focusedCell){var n=e.focusedCell.modelId,i=e.focusedCell.columnId,l=e.focusedCell.arrayIndex,o=t.find('tr[data-model-id="'+n+'"]'),a='td[data-column-id="'+i+'"]';l>=0&&(a+='[data-array-index="'+l+'"]');var d=o.find(a);d[0]!==document.activeElement&&(document.hasFocus()?d.focus():(e.$tbody.find(".kanban-is-selected").removeClass("kanban-is-selected"),e.$tbody.find(".kanban-is-focused").removeClass("kanban-is-focused"),o.addClass("kanban-is-selected"),d.addClass("kanban-is-focused")))}else if(t[0].childElementCount)if(e.prevFocusedCell){var r=e.prevFocusedCell.modelIndex,s=+t[0].firstElementChild.dataset.modelIndex,c=+t[0].lastElementChild.dataset.modelIndex;e.prevFocusedCell.modelIndex<s?r=s:e.prevFocusedCell.modelIndex>c&&(r=c);var u=t.find('tr[data-model-index="'+r+'"]'),f=u.find('td[data-column-id="'+e.prevFocusedCell.columnId+'"]');f.length?f.focus():u[0].children[0].focus()}else t[0].children[0].children[0].focus();e.editing&&e.editorPositioners[e.editing.columnId]&&e.editorPositioners[e.editing.columnId].call(e,e.editing)},calcHeight:function(){return window.innerHeight-(this.el.offsetTop||102)-15},resize:function(){var e=this.calcHeight();this.el.style.height=e+"px",this.$tbodyOuter[0].style.height=e-148+"px",this.renderRows()},idCell:function(e){var t=e.currentTarget,n=t.parentNode,i=n.dataset.modelId,l=t.dataset.columnId,o=parseInt(t.dataset.arrayIndex,10),a=this.model.entries.get(i),d=a?a.serialize(this.model):{},r=d[l];return isNaN(o)&&(o=-1),r&&o>=0&&(r=r[o]),{td:t,tr:n,columnId:l,column:this.columns.map[l],rowIndex:n.rowIndex,arrayIndex:o,modelIndex:parseInt(n.dataset.modelIndex,10),modelId:i,model:a,data:d,value:r,clicks:e.clicks||0}},resolveCell:function(e){if(!this.$tbody)return null;if(e.tr.parentNode)return e;var t=this.$tbody.find('tr[data-model-id="'+e.modelId+'"] > td[data-column-id="'+e.columnId+'"]');return t.length?this.idCell({currentTarget:t[0],clicks:e.clicks}):null},showColumnMenu:function(e,t,n){var i=this,l=i.$theadInner.find('td[data-column-id="'+e.columnId+'"]');if(!t&&!n){var o=l[0].getBoundingClientRect();t=o.top+o.height,n=o.left}var a=e.column,d=i.model.tableView,r=d.getSortOrder(e.columnId),s={menu:[d.getColumnText(e.columnId),{icon:"fa-sort-amount-asc",label:i.t("menu:sort:asc"),handler:i.handleSort.bind(i,e.columnId,1),disabled:!a.sortable||1===r},{icon:"fa-sort-amount-desc",label:i.t("menu:sort:desc"),handler:i.handleSort.bind(i,e.columnId,-1),disabled:!a.sortable||-1===r},"-",{icon:"fa-eye",label:i.t("menu:show"),handler:i.handleShowColumns.bind(i),disabled:!d.hasAnyHiddenColumn()},{icon:"fa-eye-slash",label:i.t("menu:hide"),handler:i.handleHideColumn.bind(i,e.columnId),disabled:"_id"===e.columnId},"-",{icon:"fa-filter",label:i.t("menu:filter:clear"),handler:i.handleClearFilter.bind(i),disabled:!d.hasAnyFilter()},{label:i.t("menu:filter:and"),handler:i.handleFilterMode.bind(i,"and"),disabled:"and"===d.getFilterMode()},{label:i.t("menu:filter:or"),handler:i.handleFilterMode.bind(i,"or"),disabled:"or"===d.getFilterMode()}]},c=i.filters[e.columnId];"string"==typeof c&&(c=i.filters[c]),c&&s.menu.push({template:function(t){return t.columnId=e.columnId,c.template(t)},handler:function(t){c.handler.call(i,e,t),t.find(".kanban-filter-help").popover({container:"body",trigger:"hover",placement:"auto bottom",html:!0,title:i.t("filters:help:title:"+c.type),content:i.t("filters:help:content:"+c.type)})}}),contextMenu.show(i,t,n,s)},showCellEditor:function(e){this.editors[e.columnId]&&(this.editing=e,e.td.classList.remove("kanban-is-editable"),e.td.classList.add("kanban-is-editing"),this.editors[e.columnId].call(this,e))},handleFilterMode:function(e){this.model.tableView.setFilterMode(e)},handleClearFilter:function(){this.model.tableView.clearFilters()},handleSort:function(e,t){this.model.tableView.setSortOrder(e,t)},showColumnVisibilityMenu:function(e){var t=this,n={animate:!1,menu:[t.t("menu:show")].concat(t.model.tableView.getHiddenColumns().map(function(n){return{label:t.model.tableView.getColumnText(n),handler:t.handleShowColumn.bind(t,n,e)}}))};this.broker.subscribe("planning.contextMenu.hidden").setLimit(1).on("message",function(){contextMenu.show(t,e.top-5,e.left-1,n)})},handleShowColumns:function(e){this.showColumnVisibilityMenu(e.currentTarget.getBoundingClientRect())},handleShowColumn:function(e,t){this.model.tableView.setVisibility(e,!0),this.model.tableView.hasAnyHiddenColumn()&&this.showColumnVisibilityMenu(t)},handleHideColumn:function(e){this.model.tableView.setVisibility(e,!1)},clearCache:function(){this.rowCache=null},onFilter:function(){this.$tbodyInner&&(this.filtered=!0)},onSort:function(){var e=this,t=e.filtered;if(e.filtered=!1,e.$tbodyInner){e.clearCache();var n=e.$tbodyInner[0],i=e.model.entries,l=e.focusedCell?i.filteredMap[e.focusedCell.model.id]:null,o=e.$tbodyOuter.outerHeight()-SCROLLBAR_HEIGHT;if(l){var a=i.filtered.indexOf(l),d=a*ROW_HEIGHT;d>=n.scrollTop&&d<n.scrollTop+o-2*ROW_HEIGHT||t?e.renderRows(-1,a):n.scrollTop=d}else e.prevFocusedCell=e.focusedCell,e.focusedCell=null,0===n.scrollTop?e.renderRows(0):t&&e.prevFocusedCell?e.renderRows(n.scrollTop):n.scrollTop=0}},onEntryChange:function(e){if(this.rowCache){delete this.rowCache[e.id];var t=this.$tbody.find('tr[data-model-id="'+e.id+'"]');if(t.length){var n=this.focusedCell&&this.focusedCell.tr===t[0];if(t.replaceWith(this.renderRow(e,+t[0].dataset.modelIndex)),n){t=this.$tbody.find('tr[data-model-id="'+e.id+'"]');var i=t.find('.kanban-td[data-column-id="'+this.focusedCell.columnId+'"]');this.focusedCell.arrayIndex>=0&&(i=i.filter('[data-array-index="'+this.focusedCell.arrayIndex+'"]')),this.focusedCell=this.idCell({currentTarget:i[0],clicks:this.focusedCell.clicks}),this.$tbody.find(".kanban-is-selected").removeClass("kanban-is-selected"),this.$tbody.find(".kanban-is-focused").removeClass("kanban-is-focused"),t.addClass("kanban-is-selected"),i.addClass("kanban-is-focused")}}}},onSortableChange:function(e,t){this.renderColumns()},onVisibilityChange:function(e,t){if(this.focusedCell&&t===this.focusedCell.columnId&&!this.model.tableView.getVisibility(t)){var n=this.focusedCell.td;do{n=n.previousElementSibling}while(n&&n.dataset.columnId===t);n&&(n.parentNode.parentNode?n.focus():this.focusedCell=this.idCell({currentTarget:n}))}this.clearCache(),this.renderColumns(),this.renderRows()},onTheadScroll:function(){this.$tbodyInner[0].scrollLeft=this.$theadInner[0].scrollLeft},onTbodyScroll:function(){this.$theadInner[0].scrollLeft=this.$tbodyInner[0].scrollLeft;var e=this.$tbodyInner[0].scrollTop;this.oldScrollTop!==e&&(this.oldScrollTop=e,this.renderRows())},onWindowKeyDown:function(e){var t=e.target.tagName;"INPUT"!==t&&"SELECT"!==t&&"TEXTAREA"!==t&&(this.focusedCell||this.$tbody.find("tr:first-child > td:first-child").focus(),this.handleTdKeyDown(e,this.focusedCell))},handleTdKeyDown:function(e,t){var n=e.originalEvent.key;if(1===n.length&&(n=n.toUpperCase()),this.keyHandlers[n]){if(e.preventDefault(),this.editing)return;this.lastKeyPressAt[n]||(this.lastKeyPressAt[n]=Number.MIN_VALUE),this.keyHandlers[n].call(this,e,t),this.lastKeyPressAt[n]=e.timeStamp}},keyHandlers:{ArrowUp:function(e,t){var n=this;if(0===t.modelIndex)return void(t.tr.parentNode||(n.$tbodyInner[0].scrollTop=0));var i=t.tr.previousElementSibling;if(i)return void i.cells[t.td.cellIndex].focus();n.afterRenderRows=function(e,t){var i=n.$table.find('tr[data-model-index="'+e+'"]')[0];i&&i.cells[t]&&i.cells[t].focus()}.bind(null,t.modelIndex-1,t.td.cellIndex),t.tr.parentNode?n.$tbodyInner[0].scrollTop-=ROW_HEIGHT:n.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT-ROW_HEIGHT},ArrowDown:function(e,t){var n=this,i=t.tr.nextElementSibling;if(t.modelIndex===n.model.entries.filtered.length-1)return void(t.tr.parentNode||(n.$tbodyInner[0].scrollTop=n.$tbodyInner[0].scrollHeight));if(t.tr.parentNode&&t.tr.rowIndex<t.tr.parentNode.childElementCount-1){if(i.offsetTop+i.offsetHeight<=n.$tbodyInner[0].offsetHeight-SCROLLBAR_HEIGHT)return void i.cells[t.td.cellIndex].focus()}n.afterRenderRows=function(e,t){var i=n.$table.find('tr[data-model-index="'+e+'"]')[0];i&&i.cells[t]&&i.cells[t].focus()}.bind(null,t.modelIndex+1,t.td.cellIndex),t.tr.parentNode?n.$tbodyInner[0].scrollTop+=ROW_HEIGHT*(i?1:2):n.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT+ROW_HEIGHT},ArrowRight:function(e,t){var n=t.td.nextElementSibling;if(t.tr.parentNode)return void("filler"!==n.dataset.columnId&&n.focus());var i=this;i.afterRenderRows=function(e,t){var n=i.$table.find('tr[data-model-index="'+e+'"]')[0];if(n){var l=n.cells[t];"filler"===l.dataset.columnId?l.previousElementSibling.focus():l.focus()}}.bind(null,t.modelIndex,t.td.cellIndex+1),i.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT},ArrowLeft:function(e,t){var n=t.td.previousElementSibling;if(t.tr.parentNode)return void(n&&n.focus());var i=this;i.afterRenderRows=function(e,t){var n=i.$table.find('tr[data-model-index="'+e+'"]')[0];n&&n.cells[Math.max(0,t)].focus()}.bind(null,t.modelIndex,t.td.cellIndex-1),i.$tbodyInner[0].scrollTop=t.modelIndex*ROW_HEIGHT},Tab:function(e,t){},PageUp:function(e,t){},PageDown:function(e,t){},Home:function(e,t){},End:function(e,t){},Escape:function(){contextMenu.hide(this)}," ":function(){},Enter:function(e,t){t.td.classList.contains("kanban-is-editable")&&this.showCellEditor(t)},C:function(e,t){function n(e){e=e.serialize(),i=[],l.columns.list.forEach(function(t){Array.isArray(e[t._id])?e[t._id].forEach(function(n,l){i.push(t.exportValue(n,t,l,e))}):i.push(t.exportValue(e[t._id],t,-1,e))}),o.push(i.join("\t"))}if(e.ctrlKey){var i,l=this,o=[],a="cell";e.timeStamp-l.lastKeyPressAt.CtrlA<1e3?(l.model.entries.filtered.forEach(n),a="table"):e.timeStamp-l.lastKeyPressAt.C<500?(n(t.model),a="row"):t.arrayIndex>=0?o.push(t.column.exportValue(t.model.serialize()[t.columnId][t.arrayIndex],t.column,t.arrayIndex,t.model.serialize())):o.push(t.column.exportValue(t.model.serialize()[t.columnId],t.column,-1,t.model.serialize())),clipboard.copy(function(e){e.setData("text/plain",o.join("\r\n")),l.$clipboardMsg&&viewport.msg.hide(l.$clipboardMsg,!0),l.$clipboardMsg=viewport.msg.show({type:"info",time:1500,text:l.t("msg:clipboard:"+a)})})}},A:function(e){e.ctrlKey&&(this.lastKeyPressAt.CtrlA=e.timeStamp)}},handleEditorValue:function(e,t,n,i){var l=this,o=l.columns.map[t];if(o){var a=l.model.entries.get(e);if(a){var d=a.serialize(),r=d[t];if(n>=0&&(r=r[n]),i!==r){var s=l.$tbody.find('tr[data-model-id="'+e+'"]'),c=s.find('td[data-column-id="'+t+'"]');n>=0&&(c=c.filter('[data-array-index="'+n+'"]')),c.attr("class","kanban-td "+o.tdClassName(i,o,n,d)).find(".kanban-td-value").html(o.renderValue(i,o,n,d)),c.focus();l.ajax({method:"PATCH",url:a.url(),data:JSON.stringify({property:t,arrayIndex:n,newValue:i})}).fail(function(){viewport.msg.show({type:"error",time:2500,text:l.t("msg:update:failure")});var e=a.serialize();c.attr("class","kanban-td "+o.tdClassName(r,o,n,e)).find(".kanban-td-value").html(o.renderValue(r,o,n,e)),l.focusedCell&&l.focusedCell.td!==c[0]||c.focus()})}}}},afterEdit:function(){this.$tbody.find(".kanban-is-editing").removeClass("kanban-is-editing").addClass("kanban-is-editable"),this.editing=null},editors:{input:function(e,t,n,i){function l(){var t=e.column.parseValue(d.$id("editor-input").val(),e.column,e.arrayIndex,e.model.serialize());return d.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,t),o(),!1}function o(){d.$id("editor-backdrop").remove(),d.$id("editor-form").remove(),d.afterEdit()}function a(e){"Escape"===e.originalEvent.key&&o()}var d=this,r=e.td.getBoundingClientRect(),s=e.model.serialize();$(document.body).append(inputEditorTemplate({idPrefix:d.idPrefix,columnId:e.columnId,maxLength:t,pattern:n,placeholder:i,value:e.column.editorValue(e.arrayIndex>=0?s[e.columnId][e.arrayIndex]:s[e.columnId],e.column,e.arrayIndex,s)})),d.$id("editor-backdrop").one("click",o),d.$id("editor-form").on("submit",l).css({top:r.top+"px",left:r.left+"px"}),d.$id("editor-input").on("blur",o).on("keydown",a).select()},kind:function(e){var t=this,n=e.td.getBoundingClientRect(),i=e.model.get("kind"),l=[];["kk","pk",null].forEach(function(n){l.push({label:t.t("kind:"+n),handler:t.handleEditorValue.bind(t,e.modelId,e.columnId,e.arrayIndex,n),disabled:i===n})}),contextMenu.show(t,n.top,n.left,l),t.broker.subscribe("planning.contextMenu.hidden",t.afterEdit.bind(t)).setLimit(1)},discontinued:function(e){this.handleEditorValue(e.modelId,e.columnId,e.arrayIndex,!e.model.get("discontinued")),this.afterEdit()},workstations:function(e){this.editors.input.call(this,e,3,"^([0-9]|[1-9][0-9]|[0-9](.|,)5)$")},locations:function(e){this.editors.input.call(this,e,3,"^[A-Za-z]([0-9][0-9])$","X00")}},editorPositioners:{contextMenu:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect();contextMenu.position(this,n.top,n.left)}},inputEditor:function(e){var t=this.resolveCell(e);if(t){var n=t.td.getBoundingClientRect();this.$id("editor-form").css({top:n.top+"px",left:n.left+"px"})}},kind:function(){this.editorPositioners.contextMenu.apply(this,arguments)},workstations:function(){this.editorPositioners.inputEditor.apply(this,arguments)},locations:function(){this.editorPositioners.inputEditor.apply(this,arguments)}},handleFilterValue:function(e,t,n){contextMenu.hide(this);var i=null;return t&&(i={type:t,data:n}),this.model.tableView.setFilter(e,i),!1},filters:{numeric:{type:"numeric",template:numericFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim().replace(/and/gi,"&&").replace(/or/gi,"||").replace(/=+/g,"=");if(""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if(/^[0-9]+$/.test(newData))return view.handleFilterValue(cell.columnId,"numeric",newData);var code=newData;-1===newData.indexOf("$")&&(code="$"+code),code=code.replace(/([^<>])=/g,"$1==").replace(/<>/g,"!=");try{var result=eval("(function($) { return "+code+"; })(666);");if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return $data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"numeric",newData)})}},text:{type:"text",template:textFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim();if(""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if(!/^\/.*?\/$/.test(newData))return newData.replace(/[^A-Za-z0-9]+/g,"").length?view.handleFilterValue(cell.columnId,"text",newData):($data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1);var code=newData+"i.test($)";try{var result=eval("(function($) { return "+code+'; })("abc");');if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return $data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"text",newData)})}},select:function(e,t,n,i){var l=this,o=t.find(".form-control").prop("multiple",!1!==i),a=(l.model.tableView.getFilter(e.columnId)||{data:[]}).data;t.find("select").html(n.map(function(e){return'<option value="'+e.id+'" '+(_.includes(a,e.id)?"selected":"")+">"+_.escape(e.text)+"</option>"}).join("")),t.find('.btn[data-action="clear"]').on("click",function(){l.handleFilterValue(e.columnId)}),t.find("form").on("submit",function(){var t=o.val();return Array.isArray(t)||(t=[t]),l.handleFilterValue(e.columnId,"select",0===t.length?null:t)})},_id:"numeric",kanbanQtyUser:"numeric",componentQty:"numeric",kanbanIdEmpty:"numeric",kanbanIdFull:"numeric",lineCount:"numeric",emptyFullCount:"numeric",stock:"numeric",maxBinQty:"numeric",minBinQty:"numeric",replenQty:"numeric",nc12:"text",description:"text",storageBin:"text",supplyArea:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,this.model.entries.getSupplyAreas())}},family:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")}].concat(this.model.supplyAreas.getFamilies()))}},kind:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")},{id:"kk",text:this.t("kind:kk")},{id:"pk",text:this.t("kind:pk")}])}},workstations:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"valid",text:this.t("filters:value:valid")},{id:"invalid",text:this.t("filters:value:invalid")}],!1)}},locations:"workstations",discontinued:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"true",text:this.t("core","BOOL:true")},{id:"false",text:this.t("core","BOOL:false")}],!1)}}}})});