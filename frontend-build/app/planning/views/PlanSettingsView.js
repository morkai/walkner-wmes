// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","Sortable","app/i18n","app/time","app/user","app/viewport","app/data/orgUnits","app/data/orderStatuses","app/core/views/FormView","app/core/util/decimalSeparator","app/mrpControllers/util/setUpMrpSelect2","app/orderStatuses/util/renderOrderStatusLabel","app/planning/templates/planSettings","app/planning/templates/planSettingsGroup"],function(e,t,i,r,n,a,s,l,o,d,c,p,u,h,m){"use strict";function f(e,t,i){return e=e.toUpperCase(),i.id.toUpperCase().indexOf(e)>=0||i.text.toUpperCase().indexOf(e)>=0}return d.extend({template:h,events:e.extend({"change [data-object]":function(e){var t=e.currentTarget.dataset.object,i=e.currentTarget.name;this.updateProperty(t,i)},"change #-mrp":function(t){var i=t.added?t.added.id:null,r=e.result(this.$id("mrpLine").select2("data"),"id");r||(r=e.result(this.$id("line").select2("data"),"id"));var n=this.model.mrps.get(i);n?n.lines.get(r)||(r=e.result(n.lines.first(),"id")):r=e.result(this.model.lines.find(function(t){return e.includes(t.get("mrpPriority"),i)}),"id"),this.selectMrp(i,r||null)},"change #-mrpLine":function(e){var t=this.model.mrps.get(this.$id("mrp").val());this.selectMrpLine(t,e.added?e.added.id:null,!1)},"blur #-schedulingRate":function(e){e.target.value=this.formatSchedulingRate(this.model.get("schedulingRate"))},"click #-addGroup":function(){this.addGroup({splitOrderQuantity:0,lines:[],components:[]})},'click .btn[name="removeGroup"]':function(e){var t=this,i=t.$(e.currentTarget).closest("tr");i.fadeOut("fast",function(){i.find('[name="group.lines"]').select2("destroy"),i.find('[name="group.components"]').select2("destroy"),i.remove(),t.updateProperty("mrp","group")})}},d.prototype.events),remoteTopics:{"planning.generator.finished":function(e){e.date===this.model.id&&this.onGeneratorFinished()},"planning.settings.updated":function(e){e.date===this.model.id&&(0===e.changes.length?this.onGeneratorFinished():this.model.applyChanges(e.changes))}},initialize:function(){var t=this;d.prototype.initialize.apply(t,arguments),t.sortables=[],t.maxLineLength=0,t.lines=l.getAllByType("prodLine").filter(function(e){return!e.get("deactivatedAt")}).map(function(i){return i.id.length>t.maxLineLength&&(t.maxLineLength=i.id.length),{id:i.id,text:e.escape(i.get("description"))}}).sort(function(e,t){return e.id.localeCompare(t.id,void 0,{numeric:!0})}),t.stopListening(t.model,"change"),t.listenTo(t.model,"change",e.after(2,t.onSettingChange.bind(t))),t.listenTo(t.model,"changed",t.onSettingsChanged)},destroy:function(){for(var e=0,t=this.sortables.length;e<t;++e)this.sortables[e].destroy();this.sortables=[]},afterRender:function(){d.prototype.afterRender.call(this),this.setUpOrderStatusSelect2("requiredStatuses"),this.setUpOrderStatusSelect2("ignoredStatuses"),this.setUpComponentsSelect2(this.$id("hardComponents")),this.setUpLine(),this.setUpMrpSelect2(),this.setUpMrpLineSelect2(),this.setUpOrderPrioritySelect2(),this.selectMrp(null),this.model.isEditable()||this.$id("submit").prop("disabled",!0)},setUpOrderStatusSelect2:function(t){this.$id(t).select2({allowClear:!0,multiple:!0,data:o.map(function(e){return{id:e.id,text:e.get("label")}}),matcher:f,formatSelection:function(e){return e.id},formatResult:function(t){return u(t.id)+" "+e.escape(t.text)}})},setUpComponentsSelect2:function(e){e.select2({width:"100%",placeholder:"12NC...",allowClear:!0,multiple:!0,data:[],formatNoMatches:null,minimumResultsForSearch:1,dropdownCssClass:"hidden",tokenizer:function(e,t,i){var r=e,n={};return t.forEach(function(e){n[e.id]=!0}),(e.match(/([0-9]{12}|[A-Z]{3}[A-Z0-9]{4})/gi)||[]).forEach(function(e){r=r.replace(e,""),e=e.toUpperCase(),n[e]||(i({id:e,text:e}),n[e]=!0)}),e===r?null:r.replace(/\s+/," ").trim()}})},setUpLine:function(){var n=this,a=n.$id("line"),s=n.$id("mrpPriority");a.select2({width:"100%",placeholder:r("planning","settings:line:placeholder"),allowClear:!0,data:this.lines,matcher:f,formatSelection:function(t){return e.escape(t.id+": "+t.text)},formatResult:function(e){for(var t=e.id;t.length<n.maxLineLength;)t+=" ";return'<span class="text-mono">'+t.replace(/ /g,"&nbsp;")+"</span>: "+e.text}}),p(s,{width:"100%",placeholder:r("planning","settings:mrpPriority:placeholder")});var l=s.select2("container").find(".select2-choices")[0];this.sortables.push(new i(l,{draggable:".select2-search-choice",filter:".select2-search-choice-close",onStart:function(){s.select2("onSortStart")},onEnd:function(e){s.select2("onSortEnd").select2("focus"),n.saveMrpPriority(),n.selectMrp(t(e.target).data("select2-data").id,a.val()||null)}})),a.on("change",function(e,t){void 0===t&&(t=e.added),n.selectLine(t?t.id:null)}),s.on("change",function(e){n.saveMrpPriority(),e.added?n.selectMrp(e.added.id,a.val()||null):e.removed&&n.selectMrp(null)}),s.select2("enable",!1),n.$id("activeTime").prop("disabled",!0)},setUpMrpSelect2:function(){var t=0,i={};this.model.lines.forEach(function(e){e.get("mrpPriority").forEach(function(e){i[e]=1,e.length>t&&(t=e.length)})}),this.$id("mrp").select2({width:"100%",placeholder:r("planning","settings:mrp:placeholder"),allowClear:!0,data:Object.keys(i).map(function(e){var t=l.getByTypeAndId("mrpController",e);return{id:e,text:t?t.get("description"):""}}),matcher:f,formatSelection:function(t){return e.escape(t.id+": "+t.text)},formatResult:function(e){for(var i=e.id;i.length<t;)i+=" ";return'<span class="text-mono">'+i.replace(/ /g,"&nbsp;")+"</span>: "+e.text}})},setUpMrpLineSelect2:function(){var t=this.$id("mrp").select2("data"),i=0,n={};this.model.lines.forEach(function(r){t&&e.includes(r.get("mrpPriority"),t.id)&&(n[r.id]=1,r.id.length>i&&(i=r.id.length))});var a=Object.keys(n).map(function(e){var t=l.getByTypeAndId("prodLine",e);return{id:e,text:t?t.get("description"):""}});this.$id("mrpLine").select2({width:"100%",placeholder:r("planning","settings:mrpLine:placeholder"),allowClear:!0,data:a,matcher:f,formatSelection:function(t){return e.escape(t.id+": "+t.text)},formatResult:function(e){for(var t=e.id;t.length<i;)t+=" ";return'<span class="text-mono">'+t.replace(/ /g,"&nbsp;")+"</span>: "+e.text}}).select2("enable",a.length>0)},setUpOrderPrioritySelect2:function(){var e=this,t=e.$id("orderPriority").select2({allowClear:!0,multiple:!0,data:[{id:"small",text:r("planning","orderPriority:small")},{id:"easy",text:r("planning","orderPriority:easy")},{id:"hard",text:r("planning","orderPriority:hard")}]}),n=t.select2("container").find(".select2-choices")[0];e.sortables.push(new i(n,{draggable:".select2-search-choice",filter:".select2-search-choice-close",onStart:function(){t.select2("onSortStart")},onEnd:function(){t.select2("onSortEnd").select2("focus"),e.saveOrderPriority()}})),t.on("change",function(){e.saveOrderPriority()})},selectLine:function(t){var i=this,r=!t,n="",a=i.$id("mrpPriority");if(r)a.select2("enable",!1).select2("val",""),i.selectMrp(null,null);else{var s=t,l=i.model.lines.get(s);l||(l=i.model.lines.add({_id:s}).get(s));var o=l?l.get("mrpPriority"):[];a.select2("enable",!0).select2("data",o.map(function(e){return{id:e,text:e}}));var d=i.$id("mrp").select2("data");if(l.get("mrpPriority").length){var c=l.get("mrpPriority");d=d&&e.includes(c,d.id)?d.id:c[0],n=i.buildActiveTime(l.get("activeTime"))}else d=null,s=null;i.selectMrp(d,s)}i.$id("activeTime").val(n).prop("disabled",r)},selectMrp:function(e,t){var i=this;i.$id("mrp").select2("val",e||"");var r=i.model.mrps,n=r.get(e),a=!!i.$id("mrp").select2("data"),s=!a;a&&!n&&(n=r.add({_id:e}).get(e)),(n?n.get("extraShiftSeconds"):[0,0,0]).forEach(function(e,t){i.$id("extraShiftSeconds-"+(t+1)).val(s?"":e).prop("disabled",s)}),["extraOrderSeconds","bigOrderQuantity","hardOrderManHours","splitOrderQuantity","maxSplitLineCount"].forEach(function(e){i.$id(e).val(s?"":n.get(e)).prop("disabled",s)}),i.$id("hardComponents").select2("data",s?[]:(n.get("hardComponents")||[]).map(function(e){return{id:e,text:e}})).select2("enable",a),i.removeGroups(),n&&n.get("groups").forEach(i.addGroup,i),i.$id("addGroup").prop("disabled",s),i.setUpMrpLineSelect2(),i.selectMrpLine(n,t,s)},selectMrpLine:function(e,t,i){var r=this,n=e?e.lines.get(t):null;r.$id("mrpLine").select2("val",t||"").select2("enable",!i),i=i||!r.$id("mrpLine").select2("data"),i||n||(n=e.lines.add({_id:t}).get(t)),r.$id("workerCount").val(i?"":n.get("workerCount")).prop("disabled",i),r.$id("orderPriority").select2("val",i?[]:n.get("orderPriority")).prop("disabled",i)},saveMrpPriority:function(){var e=this.$id("line").val(),t=this.$id("mrpPriority").val().split(",").filter(function(e){return e.length}),i=this.model.lines,r=i.get(e);r?r.set("mrpPriority",t):i.add({_id:e,mrpPriority:t,activeTime:this.parseActiveTime(this.$id("activeTime"))}),this.setUpMrpSelect2()},saveOrderPriority:function(){this.model.mrps.get(this.$id("mrp").val()).lines.get(this.$id("mrpLine").val()).set("orderPriority",e.pluck(this.$id("orderPriority").select2("data"),"id"))},buildActiveTime:function(e){return e.map(function(e){return e.from+"-"+e.to}).join(", ")},parseActiveTime:function(e){function t(e){var t=e.split(":"),i=+t[0],r=+t[1];return i>=0&&i<=24&&r>=0&&r<=59?(24===i&&(i=0),(i<10?"0":"")+i+":"+(r<10?"0":"")+r):""}var i=e.val().split(",").map(function(e){var i=e.trim().split("-");return{from:t(i[0]),to:t(i[1])}}).filter(function(e){return!!e.from&&!!e.to});return e.val(this.buildActiveTime(i)),i},serializeToForm:function(){var e=this.model.toJSON();return e.requiredStatuses=e.requiredStatuses.join(","),e.ignoredStatuses=e.ignoredStatuses.join(","),e.schedulingRate=this.formatSchedulingRate(e.schedulingRate),e},serializeForm:function(){return{}},checkValidity:function(){return!0},addGroup:function(t){var i=this,r=i.$id("groups");r.append(m({group:e.assign({no:r.children().length+1},t)}));var n=r.children().last();n.find('[name="group.lines"]').select2({width:"500px",allowClear:!0,multiple:!0,data:this.lines,matcher:f,formatSelection:function(t){return e.escape(t.id)},formatResult:function(e){for(var t=e.id;t.length<i.maxLineLength;)t+=" ";return'<small><span class="text-mono">'+t.replace(/ /g,"&nbsp;")+"</span>: "+e.text+"</small>"}});var a=n.find('[name="group.components"]').val("");i.setUpComponentsSelect2(a),a.select2("data",t.components.map(function(e){return{id:e,text:e}}))},removeGroups:function(){var e=this.$id("groups");e.find(".select2-container + input").select2("destroy"),e.html("")},serializeGroups:function(){var e=this,t=[];return e.$id("groups").find("tr").each(function(i){var r=e.$(this);r.find("td").first().text(i+1+".");var n={splitOrderQuantity:Math.max(0,r.find('[name="group.splitOrderQuantity"]').val()||0),lines:r.find('[name="group.lines"]').val().split(",").filter(function(e){return!!e.length}),components:r.find('[name="group.components"]').val().split(",").filter(function(e){return!!e.length})};n.lines.length&&t.push(n)}),t},updateProperty:function(e,t){var i,r=this.model;if("line"===e?r=r.lines.get(this.$id("line").val()):"plan"!==e&&(r=r.mrps.get(this.$id("mrp").val()),"mrpLine"===e&&(r=r.lines.get(this.$id("mrpLine").val()))),r){var n=this.$id(t);switch(t){case"requiredStatuses":case"ignoredStatuses":case"hardComponents":case"orderPriority":i=n.val().split(",").filter(function(e){return e.length>0});break;case"schedulingRate":i={ANY:1},n.val().split("\n").forEach(function(e){var t=e.match(/([0-9,.]+)/);if(t){var r=Math.max(0,parseFloat(t[1].replace(",","."))||0)||1;e.replace(t[0],"").split(/[^A-Za-z0-9]/).forEach(function(e){e.length>=3&&(i[e.toUpperCase()]=r)})}});break;case"ignoreCompleted":case"useRemainingQuantity":i=n.prop("checked");break;case"freezeHour":case"lateHour":case"extraOrderSeconds":case"bigOrderQuantity":case"splitOrderQuantity":case"maxSplitLineCount":case"workerCount":i=Math.max(0,parseInt(n.val(),10)||0);break;case"extraShiftSeconds":i=[Math.max(0,parseInt(this.$id(t+"-1").val(),10)||0),Math.max(0,parseInt(this.$id(t+"-2").val(),10)||0),Math.max(0,parseInt(this.$id(t+"-3").val(),10)||0)];break;case"hardOrderManHours":i=Math.max(0,parseFloat(n.val())||0);break;case"activeTime":i=this.parseActiveTime(n);break;default:/^group/.test(t)&&(t="groups",i=this.serializeGroups())}void 0!==i&&(r.attributes[t]=i)}},submitRequest:function(e,t){var i=this.request(t);i.done(this.handleSuccess.bind(this)),i.fail(this.handleFailure.bind(this))},handleSuccess:function(){this.timers.waitForGenerator=setTimeout(this.onGeneratorFinished.bind(this),1e4),s.msg.show({type:"success",time:2500,text:r("planning","settings:msg:success")})},handleFailure:function(){d.prototype.handleFailure.apply(this,arguments),this.$id("submit").prop("disabled",!1)},getFailureText:function(){return r("planning","settings:msg:failure")},formatSchedulingRate:function(e){var t=this,i=[t.formatSchedulingRateNumber(e.ANY||1)+": ANY"],r={};return Object.keys(e).forEach(function(i){if("ANY"!==i){var n=t.formatSchedulingRateNumber(e[i]);r[n]||(r[n]=[]),r[n].push(i)}}),Object.keys(r).forEach(function(e){i.push(e+": "+r[e].sort().join(", "))}),i.join("\n")},formatSchedulingRateNumber:function(e){var t=e.toString();if(-1===t.indexOf("."))t+=".0000";else for(;t.length<6;)t+="0";return t.replace(".",c)},onGeneratorFinished:function(){this.timers.waitForGenerator&&(clearTimeout(this.timers.waitForGenerator),this.timers.waitForGenerator=null,this.options.back?this.broker.publish("router.navigate",{url:"/planning/plans/"+this.model.id,trigger:!0,replace:!1}):this.$id("submit").prop("disabled",!1))},onSettingChange:function(){var e=this,t=e.model.changed;Object.keys(t).forEach(function(i){var r=t[i];switch(i){case"ignoreCompleted":case"useRemainingQuantity":e.$id(i).prop("checked",!!r);break;case"requiredStatuses":case"ignoredStatuses":e.$id(i).select2("val",r);break;case"schedulingRate":e.$id(i).val(e.formatSchedulingRate(r))}})},onSettingsChanged:function(e){var t=document.activeElement,i=this.$id("line").val(),r=this.$id("mrp").val(),n=this.$id("mrpLine").val();e.lines[i]&&this.$id("line").select2("val",i).trigger("change",{id:i}),e.mrps[r]&&this.selectMrp(r,n),t&&t.focus()}})});