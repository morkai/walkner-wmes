define(["underscore","jquery","app/i18n","app/core/View","app/reports/templates/3/tableSummary","datatables","datatables-fixedcolumns"],function(e,t,a,i,n){"use strict";function o(e,t){return"display"!==t&&"filter"!==t||"function"!=typeof e.toLocaleString||(e=e.toLocaleString()),e}var s="function"==typeof Number.prototype.toLocaleString?1.2.toLocaleString().substr(1,1):".";var r=[{name:"division",data:"division",width:"45px"},{name:"_id",data:"_id",width:"100px",class:"is-selectable is-prodLine",createdCell:function(e,t){e.dataset.id=t}},{name:"inventoryNo",data:"inventoryNo",width:"40px"},{name:"totalAvailabilityH",data:"totalAvailabilityH",width:"40px",render:o},{name:"operationalAvailabilityH",data:"operationalAvailabilityH",width:"40px",render:o},{name:"operationalAvailabilityP",data:"operationalAvailabilityP",width:"40px",render:o},{name:"exploitationH",data:"exploitationH",width:"40px",render:o},{name:"exploitationP",data:"exploitationP",width:"40px",render:o},{name:"oee",data:"oee",width:"25px",render:o},{name:"adjustingDuration",data:"adjustingDuration",width:"45px",render:o},{name:"maintenanceDuration",data:"maintenanceDuration",width:"50px",render:o},{name:"renovationDuration",data:"renovationDuration",width:"55px",render:o},{name:"malfunctionDuration",data:"malfunctionDuration",width:"55px",render:o},{name:"malfunctionCount",data:"malfunctionCount",width:"55px",render:o},{name:"majorMalfunctionCount",data:"majorMalfunctionCount",width:"50px",render:o},{name:"mttr",data:"mttr",width:"30px",render:o},{name:"mtbf",data:"mtbf",width:"30px",render:o}],d={},l={};return r.forEach(function(e,t){d[e.name]=t,l[t]=e.name}),i.extend({template:n,events:{"mouseover tbody > tr":function(e){var a=e.currentTarget.parentNode.parentNode.classList.contains("DTFC_Cloned")?this.el.querySelector(".dataTables_scroll tbody"):this.el.querySelector(".DTFC_Cloned tbody");this.hoveredRows.push(a.childNodes[t(e.currentTarget).index()]),this.hoveredRows.push(e.currentTarget);for(var i=0,n=this.hoveredRows.length;i<n;++i)this.hoveredRows[i].classList.add("is-hovered")},"mouseout tbody > tr":function(){for(;this.hoveredRows.length;)this.hoveredRows.shift().classList.remove("is-hovered")},"click td.is-selectable":function(e){e.currentTarget.classList.toggle("is-selected"),this.model.query.toggleProdLineSelection(e.currentTarget.dataset.id,e.currentTarget.classList.contains("is-selected"))}},initialize:function(){this.hoveredRows=[],this.dataTable=null,this.fixedColumns=null,this.loading=0,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:tableSummary",this.onTableSummaryChanged),this.listenTo(this.model.query,"change:columns",this.onColumnVisibilityChanged),this.onResize=e.debounce(this.onResize.bind(this),100),this.onKeyDown=this.onKeyDown.bind(this),this.onKeyUp=this.onKeyUp.bind(this),t(window).resize(this.onResize),t(document.body).keydown(this.onKeyDown).keyup(this.onKeyUp)},destroy:function(){t(window).off("resize",this.onResize),t(document.body).off("keydown",this.onKeyDown).off("keyup",this.onKeyUp),this.dataTable&&this.dataTable.destroy(),this.fixedColumns=null},afterRender:function(){var e=this.$("table");this.dataTable=e.dataTable({autoWidth:!1,info:!1,ordering:!0,orderMulti:!0,order:this.getOrder(),paging:!1,processing:!1,searching:!1,scrollX:!0,scrollY:this.calcScrollY(),scrollCollapse:!1,columns:r.map(function(e){return e.visible=this.model.query.isColumnVisible(e.name),e},this),data:this.model.get("tableSummary"),language:{emptyTable:this.getEmptyTableMessage()}}).DataTable(),this.fixedColumns=new t.fn.dataTable.FixedColumns(this.dataTable,{leftColumns:2,heightMatch:"none"}),e.on("draw.dt",this.onDraw.bind(this)),e.on("order.dt",this.onOrder.bind(this)),this.onDraw()},getEmptyTableMessage:function(){var e=this;function t(){return 1===e.loading?a("core","dataTables:loadingRecords"):-1===e.loading?a("core","dataTables:loadingFailed"):a("core","dataTables:emptyTable")}return t.toString=t,t},getOrder:function(){var e=this.model.query.get("sort"),t=[];return Object.keys(e).forEach(function(a){t.push([d[a],1===e[a]?"asc":"desc"])}),t},calcScrollY:function(){return window.innerWidth<=1328?220:Math.max(window.innerHeight-this.el.offsetTop-125,590)},onResize:function(){if(this.dataTable){var e=this.calcScrollY();this.dataTable.settings()[0].oScroll.sY=e,this.$(".dataTables_scrollBody").css("height",e+"px"),this.dataTable.draw()}},onDraw:function(){var e=this.el.querySelector(".DTFC_Cloned > tbody");this.model.query.getSelectedProdLines().forEach(function(t){var a=e.querySelector('td.is-prodLine[data-id="'+t+'"]');a&&a.classList.add("is-selected")})},onOrder:function(){var e={};this.dataTable.order().forEach(function(t){e[l[t[0]]]="asc"===t[1]?1:-1}),this.model.query.set("sort",e)},onTableSummaryChanged:function(){this.dataTable&&1!==this.loading&&(this.dataTable.clear(),this.dataTable.rows.add(this.model.get("tableSummary")),this.dataTable.draw())},onColumnVisibilityChanged:function(e,t){this.dataTable.column(e+":name").visible(t)},onModelLoading:function(){this.loading=1,this.dataTable&&this.dataTable.clear().draw()},onModelLoaded:function(){this.loading=0,this.dataTable&&(this.dataTable.clear(),this.dataTable.rows.add(this.model.get("tableSummary")),this.dataTable.draw())},onModelError:function(){this.loading=-1,this.dataTable&&(this.dataTable.clear(),this.dataTable.draw())},onKeyDown:function(e){16===e.keyCode&&this.el.classList.add("unselectable")},onKeyUp:function(e){16===e.keyCode&&this.el.classList.remove("unselectable")},serializeToCsv:function(){if(!this.dataTable)return"";var e=[];this.dataTable.columns().header().each(function(t){null!==t.parentNode&&e.push('"'+t.textContent+'"')});var t=e.join(";")+"\r\n";return this.dataTable.rows().nodes().each(function(e){for(var a,i=[],n=0,o=e.childElementCount;n<o;++n){var r=e.children[n].textContent;n<3?r='"'+r+'"':(a=void 0,r=2===(a=r.split(s)).length?a[0].replace(/[^0-9]+/g,"")+s+a[1].replace(/[^0-9]+/g,""):a[0].replace(/[^0-9]+/g,"")),i.push(r)}t+=i.join(";")+"\r\n"}),t}})});