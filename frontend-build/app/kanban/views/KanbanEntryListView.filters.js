define(["underscore","app/core/util/idAndLabel","../KanbanSettingCollection","app/kanban/templates/filters/numeric","app/kanban/templates/filters/text","app/kanban/templates/filters/select"],function(_,idAndLabel,KanbanSettingCollection,numericFilterTemplate,textFilterTemplate,selectFilterTemplate){"use strict";return{numeric:{type:"numeric",template:numericFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim().replace(/and/gi,"&&").replace(/or/gi,"||");if(""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if("!"===newData)return view.handleFilterValue(cell.columnId,"notEmpty","!");if(/^[0-9]+$/.test(newData))return view.handleFilterValue(cell.columnId,"numeric",newData);var code=newData;-1===newData.indexOf("$$")&&(-1===newData.indexOf("$")&&(code="$"+code),code=code.replace(/=+/g,"=").replace(/([^<>])=/g,"$1==").replace(/<>/g,"!="));try{var o=view.model.entries.at(0).serialize(view.model),v=cell.arrayIndex>=0?o[cell.columnId][cell.arrayIndex]:o[cell.columnId],result=eval("(function($, $$) { return "+code+"; })("+JSON.stringify(v)+", "+JSON.stringify(o)+");");if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return console.error(e),$data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"numeric",newData)})}},text:{type:"text",template:textFilterTemplate,handler:function(cell,$filter){var view=this,$data=$filter.find(".form-control"),oldData=(view.model.tableView.getFilter(cell.columnId)||{data:""}).data;$data.val(oldData).on("input",function(){this.setCustomValidity("")}),$filter.find('.btn[data-action="clear"]').on("click",function(){view.handleFilterValue(cell.columnId)}),$filter.find("form").on("submit",function(){var newData=$data.val().trim();if(cell.column.prepareFilter&&(newData=cell.column.prepareFilter(newData,cell),$data.val(newData)),""===newData)return view.handleFilterValue(cell.columnId);if("?"===newData)return view.handleFilterValue(cell.columnId,"empty","?");if("!"===newData)return view.handleFilterValue(cell.columnId,"notEmpty","!");if(!/^\/.*?\/$/.test(newData)&&-1===newData.indexOf("$$"))return newData.replace(/[^A-Za-z0-9]+/g,"").length?view.handleFilterValue(cell.columnId,"text",newData):($data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1);var code=newData+(-1===newData.indexOf("$$")?"i.test($)":"");try{var o=view.model.entries.at(0).serialize(view.model),v=cell.arrayIndex>=0?o[cell.columnId][cell.arrayIndex]:o[cell.columnId],result=eval("(function($, $$) { return "+code+"; })("+JSON.stringify(v)+", "+JSON.stringify(o)+");");if("boolean"!=typeof result)throw new Error("Invalid result type. Expected boolean, got "+typeof result+".")}catch(e){return console.error(e),$data[0].setCustomValidity(view.t("filters:invalid")),view.timers.revalidate=setTimeout(function(){$filter.find(".btn-primary").click()},1),!1}return view.handleFilterValue(cell.columnId,"text",newData)})}},select:function(e,t,l,i){var a=this,n=t.find(".form-control").prop("multiple",!1!==i),r=(a.model.tableView.getFilter(e.columnId)||{data:[]}).data;t.find("select").html(l.map(function(e){return'<option value="'+e.id+'" '+(_.includes(r,e.id)?"selected":"")+">"+_.escape(e.text)+"</option>"}).join("")),t.find('.btn[data-action="clear"]').on("click",function(){a.handleFilterValue(e.columnId)}),t.find("form").on("submit",function(){var t=n.val();return Array.isArray(t)||(t=[t]),a.handleFilterValue(e.columnId,"select",0===t.length?null:t)})},_id:"text",storingPosition:"text",kanbanQtyUser:"numeric",componentQty:"numeric",kanbanId:"text",kanbanIdCount:"numeric",lineCount:"numeric",emptyFullCount:"numeric",stock:"numeric",maxBinQty:"numeric",minBinQty:"numeric",replenQty:"numeric",storageType:"numeric",nc12:"text",description:"text",storageBin:"text",kanbanStorageBin:"text",comment:"text",unit:"text",supplyArea:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,this.model.supplyAreas.getNames())}},workCenter:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){var l=[{id:"",text:this.t("filters:value:empty")}].concat(this.model.supplyAreas.getWorkCenters([]));this.filters.select.call(this,e,t,l)}},family:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){var l=[{id:"",text:this.t("filters:value:empty")}].concat(this.model.supplyAreas.getFamilies([]));this.filters.select.call(this,e,t,l)}},kind:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")},{id:"kk",text:this.t("kind:kk")},{id:"pk",text:this.t("kind:pk")}])}},container:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")}].concat(this.model.containers.map(idAndLabel)))}},workstations:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"valid",text:this.t("filters:value:valid")},{id:"invalid",text:this.t("filters:value:invalid")}],!1)}},locations:"workstations",discontinued:{type:"select-one",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"true",text:this.t("core","BOOL:true")},{id:"false",text:this.t("core","BOOL:false")}],!1)}},markerColor:{type:"select-multi",template:selectFilterTemplate,handler:function(e,t){this.filters.select.call(this,e,t,[{id:"",text:this.t("filters:value:empty")}].concat(KanbanSettingCollection.getMarkerColors()))}}}});