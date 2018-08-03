// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/viewport","app/core/View","app/core/util/uuid","app/core/util/ExpandableSelect","../KanbanPrintQueueBuilder","app/kanban/templates/builder/builder"],function(e,t,n,i,o,s,r,a){"use strict";return i.extend({template:a,events:{submit:function(){return this.submit(),!1},"click #-hide":function(){return this.hide(),!1},"click #-clear":function(){this.model.builder.reset([])},'click .btn[data-action="remove"]':function(e){var t=this.model.builder.at(this.$(e.currentTarget).closest("tr").prop("rowIndex"));t&&this.model.builder.remove(t),this.lastRemoveClickAt=e.timeStamp},'click .btn[data-action="layout"]':function(e){this.model.builder.toggleLayout(e.currentTarget.value)},"click .kanban-builder-ccn":function(e){var t=this.model.entries.get(e.currentTarget.textContent.trim());t&&this.trigger("find","entry",t)},"keydown select":function(e){if("Enter"===e.key||" "===e.key)return e.currentTarget.blur(),!1},"change select":function(t){var n=e.pluck(t.currentTarget.selectedOptions,"value"),i=this.model.builder.at(this.$(t.currentTarget).closest("tr").prop("rowIndex"));i&&i.set("lines",n)},"mousedown #-dragHandle":function(e){e=e.originalEvent;var n=e.currentTarget.getBoundingClientRect(),i={top:n.y-e.pageY,left:n.x-e.pageX};t(window).on("mouseup."+this.idPrefix,this.handleDragEnd.bind(this,i)).on("mousemove."+this.idPrefix,this.handleDrag.bind(this,i))},"resize #-tbody":function(){this.saveCss()},"click #-lines":function(){var n=this;if(n.$id("lines").find("select").length)return!1;var i={};n.model.builder.forEach(function(e){var t=n.model.entries.get(e.get("ccn")).serialize().lines,o=e.get("lines");t.forEach(function(e){i[e]=-1!==o.indexOf(e)})});var o=Object.keys(i).sort(function(e,t){return e.localeCompare(t,void 0,{ignorePunctuation:!0,numeric:!0})}),s=t('<select class="form-control is-expandable" multiple></select>');o.forEach(function(t){var n=i[t];t=e.escape(t),s.append('<option value="'+t+'" '+(n?"selected":"")+">"+t+"</option>")}),n.$id("lines").append(s),s.expandableSelect({expandedLength:Math.min(o.length,10)}).focus(),s.on("blur",function(){s.remove()}),s.on("change",function(){var i={};(s.val()||[]).forEach(function(e){i[e]=!0}),n.$rows.find("select").each(function(){var o=t(this).closest("tr"),s=n.model.builder.at(o[0].rowIndex),r=[];e.forEach(this.options,function(e){e.selected=i[e.value],e.selected&&r.push(e.value)}),s.attributes.lines=r,n.recountRow(s,o)}),n.model.builder.store(),n.recountTotals(),n.validate()})}},initialize:function(){var e=this,t=e.model.entries,n=e.model.builder;e.shown=!1,e.listenTo(t,"change",e.onEntryChange),e.listenTo(n,"focus",e.onFocus),e.listenTo(n,"reset",e.onReset),e.listenTo(n,"add",e.onAdd),e.listenTo(n,"multiAdd",e.onMultiAdd),e.listenTo(n,"remove",e.onRemove),e.listenTo(n,"change:layouts",e.onLayoutsChange),e.listenTo(n,"change:lines",e.onLinesChange)},destroy:function(){t(window).off("."+this.idPrefix),this.$(".is-expandable").expandableSelect("destroy")},getTemplateData:function(){var e=this.model.builder.layouts;return{layouts:r.LAYOUTS.map(function(t){return{id:t,active:-1!==e.indexOf(t)}})}},afterRender:function(){this.$tbody=this.$id("tbody"),this.$rows=this.$id("rows"),this.$row=this.$rows.find("tr").detach(),this.addRows(this.model.builder.models),this.recountTotals()},handleDragEnd:function(e,n){t(window).off("."+this.idPrefix),this.position(n.originalEvent.pageX,n.originalEvent.pageY,e),this.saveCss()},handleDrag:function(e,t){this.position(t.originalEvent.pageX,t.originalEvent.pageY,e)},position:function(e,t,n){this.$el.css({top:Math.max(0,Math.min(Math.max(0,t+n.top),window.innerHeight-100))+"px",left:Math.max(0,Math.min(Math.max(0,e+n.left),window.innerWidth-200))+"px"})},saveCss:function(){localStorage.setItem("WMES_KANBAN_BUILDER_CSS",JSON.stringify({top:this.el.offsetTop,left:this.el.offsetLeft,height:this.$id("tbody")[0].clientHeight}))},show:function(){this.shown=!0;var e=JSON.parse(localStorage.getItem("WMES_KANBAN_BUILDER_CSS")||"null")||{top:100,left:window.innerWidth/2-309,height:165};this.$tbody.css({height:e.height+"px"}),this.position(e.left,e.top,{left:0,top:0}),this.$el.removeClass("hidden"),this.$tbody[0].scrollTop=this.$tbody[0].scrollHeight,this.trigger("shown")},hide:function(){this.shown=!1,this.$el.addClass("hidden"),this.trigger("hidden")},recountNos:function(){this.$rows.children().each(function(e){this.children[0].textContent=e+1+"."})},recountTotals:function(){var e=this,t=e.model.builder.length,n={};e.model.builder.forEach(function(e){e.get("lines").forEach(function(e){n[e]=1})}),e.$id("totals-no").text(t),e.$id("totals-lines").text(Object.keys(n).length),r.LAYOUTS.forEach(function(t){var n=0;e.$('.kanban-builder-layout[data-layout="'+t+'"]').each(function(){n+=parseInt(this.textContent,10)}),e.$id("totals-"+t).text(n)})},recountRow:function(e,t){var n=t&&t.length?t[0]:this.$rows[0].rows[this.model.builder.models.indexOf(e)],i=this.model.entries.get(e.get("ccn")).serialize(),o=i.kanbanQtyUser,s=e.get("lines").length,a=this.model.builder.layouts;r.LAYOUTS.forEach(function(e,t){var r=0;-1!==a.indexOf(e)&&("kk"===i.kind?r="kk"===e?o*s:0:"pk"===i.kind&&(r="kk"===e?0:o*s)),n.cells[3+t].textContent=r.toString()})},addRows:function(n){var i=this,o=t(document.createDocumentFragment()),s=i.$rows[0].childElementCount;n.forEach(function(t){var n=i.model.entries.get(t.get("ccn"));if(n){++s;var r=i.model.supplyAreas.get(n.get("supplyArea")),a=i.$row.clone(),l=a[0].children,d=l[2].firstElementChild,c=[],u=t.get("lines");l[0].textContent=s+".",l[1].textContent=n.id,(r?r.get("lines"):[]).forEach(function(t){var n=-1===u.indexOf(t)?"":"selected";t=e.escape(t),c.push('<option value="'+t+'" '+n+">"+t+"</option>")}),d.innerHTML=c.join(""),i.recountRow(t,a),o.append(a)}}),o.find("select").expandableSelect(),i.$rows.append(o),1===n.length&&i.$rows[0].lastElementChild.querySelector("select").focus()},validate:function(){var n=this,i=n.model.builder,o="",s=[];i.layouts.length||(o=n.t("builder:error:noLayout")),n.$id("layoutError")[0].setCustomValidity(o),n.$rows.children().each(function(e){var o=i.at(e),r=n.model.entries.get(o.get("ccn")).serialize();if(!r.kind)return void s.push(n.t("builder:error:noKind"));for(var a=o.get("lines"),l=0;l<a.length;++l){var d=a[l],c=r.lines.indexOf(d);if(-1!==c)for(var u=c*r.kanbanQtyUser,h=c*r.kanbanQtyUser+r.kanbanQtyUser,f=u;f<h;++f)if(!(r.kanbanId[f]>0))return void s.push(n.t("builder:error:noKanbanId",{line:d,i:f+1}))}var g=0;t(this).find(".kanban-builder-layout").each(function(){g+=parseInt(this.textContent,10)}),s.push(0===g?n.t("builder:error:noKanbans"):"")});var r=n.$rows.find("select");return s.forEach(function(e,t){r[t].setCustomValidity(e)}),""===o&&e.all(s,function(e){return""===e})},submit:function(){var e=this;if(!e.validate())return void setTimeout(function(){e.$id("submit").click()},1);n.msg.saving();var t=e.$("button, select, input").prop("disabled",!0),i=e.$id("newStorageBin").prop("checked"),s=[];e.model.builder.forEach(function(t){var n=e.model.entries.get(t.get("ccn")).serialize(),r=e.model.builder.layouts.filter(function(e){return"kk"===n.kind&&"kk"===e||"kk"!==n.kind&&"kk"!==e});t.get("lines").forEach(function(e){var t=n.lines.indexOf(e),a=t*n.kanbanQtyUser,l=t*n.kanbanQtyUser+n.kanbanQtyUser,d=n.storageBin;i&&n.newStorageBin&&(d=n.newStorageBin),s.push({_id:o(),line:e,kanbans:n.kanbanId.slice(a,l),layouts:r,data:{ccn:n._id,nc12:n.nc12,description:n.description,supplyArea:n.supplyArea,family:n.family,componentQty:n.componentQty,storageBin:d,minBinQty:n.minBinQty,maxBinQty:n.maxBinQty,replenQty:n.replenQty,workstations:n.workstations,locations:n.locations}})})}),s.sort(function(e,t){return e.line.localeCompare(t.line,void 0,{numeric:!0,ignorePunctuation:!0})});var r=e.ajax({method:"POST",url:"/kanban/printQueues",data:JSON.stringify({_id:o(),jobs:s})});r.fail(function(){n.msg.savingFailed()}),r.done(function(){n.msg.saved(),e.model.builder.reset([])}),r.always(function(){t.prop("disabled",!1)})},onEntryChange:function(e){var t=this.model.builder.findWhere({ccn:e.id});t&&(this.recountRow(t),this.recountTotals(),this.validate())},onFocus:function(e){var t=this.model.builder.models.indexOf(e);-1!==t&&this.$rows[0].rows[t].querySelector("select").focus()},onReset:function(){this.render(),0===this.model.builder.length&&this.hide()},onAdd:function(e,t,n){n&&n.multi||this.onMultiAdd([e.id])},onMultiAdd:function(e){this.addRows(e.map(function(e){return this.model.builder.get(e)},this)),this.recountTotals(),this.validate()},onRemove:function(e,t,n){this.$(this.$rows[0].rows[n.index]).remove(),this.recountNos(),this.recountTotals(),0===this.model.builder.length&&this.hide()},onLayoutsChange:function(e,t){this.$('.btn[value="'+e+'"]').toggleClass("active",t),this.model.builder.forEach(function(e){this.recountRow(e)},this),this.recountTotals(),this.validate()},onLinesChange:function(e){this.recountRow(e),this.recountTotals(),this.validate()}})});