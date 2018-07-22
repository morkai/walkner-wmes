// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/data/orgUnits","app/core/util/idAndLabel","app/core/views/FormView","app/kanbanSupplyAreas/templates/form"],function(t,e,i,n,s){"use strict";return n.extend({template:s,events:t.assign({"input #-_id":"validateId","click #-addLine":function(){this.addLine("-")},'click .btn[data-action="up"]':function(t){var e=this.$(t.currentTarget).closest("tr");e.prev().length&&(e.insertBefore(e.prev()),this.recountLines())},'click .btn[data-action="down"]':function(t){var e=this.$(t.currentTarget).closest("tr");e.next().length&&(e.insertAfter(e.next()),this.recountLines())},'click .btn[data-action="remove"]':function(t){this.$(t.currentTarget).closest("tr").remove(),this.recountLines()}},n.prototype.events),initialize:function(){n.prototype.initialize.apply(this,arguments),this.validateId=t.debounce(this.validateId.bind(this),500),this.prodLines=[{id:"-",text:this.t("lines:reserved")}].concat(e.getAllByType("prodLine").filter(function(t){return!t.get("deactivatedAt")}).map(i))},afterRender:function(){this.$lineRow=this.$id("lines").children().first().detach(),n.prototype.afterRender.apply(this,arguments),this.options.editMode?(this.model.get("lines").forEach(this.addLine,this),this.$id("_id").prop("readonly",!0),this.$id("name").focus()):(this.addLine("-"),this.$id("_id").focus())},addLine:function(t){var e=this.$id("lines"),i=this.$lineRow.clone();i[0].children[0].textContent=e[0].childElementCount+1+".",i.find("input").val(t).select2({data:this.prodLines}),e.append(i)},recountLines:function(){this.$id("lines").children().each(function(t){this.children[0].textContent=t+1+"."})},validateId:function(){var t=this,e=t.$id("_id"),i=t.ajax({method:"HEAD",url:"/kanban/supplyAreas/"+e.val()});i.fail(function(){e[0].setCustomValidity("")}),i.done(function(){e[0].setCustomValidity(200===i.status?t.t("FORM:ERROR:alreadyExists"):"")})}})});