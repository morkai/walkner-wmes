// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/core/View","app/kanban/templates/list","datatables","datatables-fixedcolumns"],function(a,t,e,n){"use strict";function d(a,t,e,n){n.discontinued||(!n.workstationsTotal||!n.workstations[a]&&n.locations[a])&&t.classList.add("kanban-is-empty")}function s(a,t,e,n){n.discontinued||(!n.workstationsTotal||!n.locations[a]&&n.workstations[a])&&t.classList.add("kanban-is-empty")}var i=[{name:"_id",data:"_id",width:"50px",className:"dt-center"},{name:"nc12",data:"nc12",width:"95px",className:"dt-center"},{name:"description",data:"description",width:"315px",className:"dt-head-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"supplyArea",data:"supplyArea",width:"85px",className:"dt-head-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"family",data:"family",width:"85px",className:"dt-head-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"kanbanQtyUser",data:"kanbanQtyUser",width:"45px",className:"dt-body-center"},{name:"componentQty",data:"componentQty",width:"45px",className:"dt-body-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"storageBin",data:"storageBin",width:"75px",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"kanbanIdEmpty",data:"kanbanIdEmpty",width:"55px",className:"dt-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"kanbanIdFull",data:"kanbanIdFull",width:"55px",className:"dt-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"lineCount",data:"lineCount",width:"30px",className:"dt-body-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"emptyFullCount",data:"emptyFullCount",width:"40px",className:"dt-body-center"},{name:"stock",data:"stock",width:"40px",className:"dt-body-center"},{name:"maxBinQty",data:"maxBinQty",width:"55px",className:"dt-body-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"minBinQty",data:"minBinQty",width:"55px",className:"dt-body-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"replenQty",data:"replenQty",width:"55px",className:"dt-body-center",createdCell:function(a,t){t||a.classList.add("kanban-is-empty")}},{name:"kind",data:"kind",width:"30px",className:"dt-body-center"},{name:"workstations.0",data:"workstations.0",width:"25px",className:"dt-body-center",createdCell:d.bind(null,0)},{name:"workstations.1",data:"workstations.1",width:"25px",className:"dt-body-center",createdCell:d.bind(null,1)},{name:"workstations.2",data:"workstations.2",width:"25px",className:"dt-body-center",createdCell:d.bind(null,2)},{name:"workstations.3",data:"workstations.3",width:"25px",className:"dt-body-center",createdCell:d.bind(null,3)},{name:"workstations.4",data:"workstations.4",width:"25px",className:"dt-body-center",createdCell:d.bind(null,4)},{name:"workstations.5",data:"workstations.5",width:"25px",className:"dt-body-center",createdCell:d.bind(null,5)},{name:"locations.0",data:"locations.0",width:"35px",className:"dt-body-center",createdCell:s.bind(null,0)},{name:"locations.1",data:"locations.1",width:"35px",className:"dt-body-center",createdCell:s.bind(null,1)},{name:"locations.2",data:"locations.2",width:"35px",className:"dt-body-center",createdCell:s.bind(null,2)},{name:"locations.3",data:"locations.3",width:"35px",className:"dt-body-center",createdCell:s.bind(null,3)},{name:"locations.4",data:"locations.4",width:"35px",className:"dt-body-center",createdCell:s.bind(null,4)},{name:"locations.5",data:"locations.5",width:"35px",className:"dt-body-center",createdCell:s.bind(null,5)},{name:"discontinued",data:"discontinued",width:"25px",className:"dt-body-center",render:function(a){return a?"1":"0"}},{name:"filler",data:"filler",render:function(){return""}}];return e.extend({template:n,events:{"click tbody td":function(a){var t=a.currentTarget,e=this.dataTable.cell(t).index(),n=this.dataTable.column(e.column).dataSrc(),d=this.dataTable.row(e.row).data();switch(n){case"discontinued":d.discontinued=!d.discontinued,t.textContent=d.discontinued?1:0}this.dataTable.row(e.row).data(d)}},initialize:function(){t(window).on("resize."+this.idPrefix,a.debounce(this.resize.bind(this),16))},destroy:function(){t(window).off("."+this.idPrefix)},getTemplateData:function(){return{entries:[]}},afterRender:function(){var a=this,e=a.$("table");a.dataTable=e.dataTable({autoWidth:!1,info:!1,ordering:!1,orderMulti:!1,orderClasses:!1,order:a.getTableOrder(),paging:!1,processing:!1,searching:!1,scrollX:!0,scrollY:a.calcScrollY(),scrollCollapse:!1,rowId:"_id",columns:i.map(function(a){return a.visible=!0,a}),data:this.model.entries.serialize({supplyAreas:this.model.supplyAreas,components:this.model.components}),language:{emptyTable:this.getEmptyTableMessage()},createdRow:function(a,t){t.discontinued&&a.classList.add("kanban-is-discontinued")}}).DataTable(),a.fixedColumns=new t.fn.dataTable.FixedColumns(a.dataTable,{leftColumns:3,heightMatch:"none"})},getEmptyTableMessage:function(){function a(){return t.model.isLoading()?t.t("core","dataTables:loadingRecords"):t.t("core","dataTables:emptyTable")}var t=this;return a.toString=a,a},getTableOrder:function(){return[[0,"asc"]]},calcScrollY:function(){return window.innerHeight-this.el.offsetTop-157},resize:function(){if(this.dataTable){var a=this.calcScrollY();this.dataTable.settings()[0].oScroll.sY=a,this.$(".dataTables_scrollBody").css("height",a+"px"),this.dataTable.draw()}}})});