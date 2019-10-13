define(["underscore","app/i18n","app/time","app/core/View","app/core/util/bindLoadingMessage","app/core/templates/userInfo","app/orderStatuses/util/renderOrderStatusLabel","app/planning/templates/change","app/planning/templates/orderPopover"],function(e,n,t,a,r,i,s,o,l){"use strict";return a.extend({layoutName:"page",breadcrumbs:function(){return[{label:n.bound("planning","BREADCRUMBS:base"),href:"#planning/plans"},{label:this.collection.getDate("LL"),href:"#planning/plans/"+this.collection.getDate("YYYY-MM-DD")},{label:n.bound("planning","BREADCRUMBS:changes")}]},actions:function(){return[{icon:"chevron-down",label:this.t("PAGE_ACTION:toggleChanges:expand"),callback:this.toggleChanges.bind(this,!0)},{icon:"chevron-up",label:this.t("PAGE_ACTION:toggleChanges:collapse"),callback:this.toggleChanges.bind(this,!1)}]},remoteTopics:{"planning.changes.created":function(e){t.utc.format(e.plan,"X")===this.collection.getDate("X")&&this.collection.unshift(e)}},events:{"click .planning-change-hd":function(e){var n=this.$(e.currentTarget),t=n.parent().attr("data-type");t&&0===n.next()[0].childElementCount&&!n.hasClass("is-expanded")&&this.renderDetails(n.next(),t,this.collection.get(n.closest(".planning-change").attr("data-id")).get("data")[t]),n.toggleClass("is-expanded")},"mouseenter .planning-change-addedOrder":function(e){var n=this.$(e.currentTarget),t=n.closest(".planning-change").attr("data-id"),a=n.attr("data-i"),r=this.collection.get(t).get("data").addedOrders[a];n.popover({trigger:"hover",html:!0,placement:"top",content:l({order:{_id:r.id,nc12:r.nc12,name:r.name,kind:r.kind,incomplete:r.incomplete,quantityTodo:r.quantityTodo,quantityDone:r.quantityDone,quantityPlan:r.quantityPlan,statuses:r.statuses.map(s),manHours:r.manHours,laborTime:r.operation&&r.operation.laborTime||0,lines:r.lines||[]}}),template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}).popover("show")},"mouseenter .planning-change-changedOrder":function(e){var t=this,a=t.$(e.currentTarget),r=a.closest(".planning-change").attr("data-id"),i=a.attr("data-i"),s=t.collection.get(r).get("data").changedOrders[i].changes,o="<table>";Object.keys(s).forEach(function(e){var a=t.formatValue(e,s[e][0]),r=t.formatValue(e,s[e][1]);o+="<tr><th>"+n("planning","orders:"+e)+"</th><td>"+a+' <i class="fa fa-arrow-right"></i> '+("statuses"===e||"operation"===e?"<br>":"")+r+"</td></tr>"}),o+="</table>",a.popover({trigger:"hover",html:!0,placement:"top",content:o,template:'<div class="popover planning-mrp-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}).popover("show")}},initialize:function(){this.expanded={},this.collection=r(this.collection,this),this.listenTo(this.collection,"add",this.renderChange)},load:function(e){return e(this.collection.fetch({reset:!0}))},afterRender:function(){this.collection.forEach(this.renderChange,this)},renderChange:function(e){var a=e.get("data"),r=Object.keys(a).map(function(e){return{type:e,label:n("planning","changes:what:"+e,{count:a[e].length})}}),s={id:e.id,hd:n("planning","changes:hd",{when:t.format(e.get("date"),"LL LTS"),who:i({userInfo:e.get("user")||{label:"System"}}),what:r.map(function(e){return e.label}).join(", ")}),what:r};this.$el.append(o(s))},renderDetails:function(n,t,a){switch(t){case"addedOrders":this.renderOrders("addedOrder",n,a);break;case"changedOrders":this.renderOrders("changedOrder",n,a);break;case"removedOrders":this.renderRemovedOrders(n,a);break;case"settings":this.renderSettings(n,a);break;case"changedLines":n.html(e.pluck(a,"_id").join("; "));break;default:n.html("<pre>"+JSON.stringify(a,null,2)+"</pre>")}},renderOrders:function(e,n,t){var a=t.map(function(n,t){return'<a class="label label-default planning-change-'+e+'" href="#orders/'+n._id+'" target="_blank" data-i="'+t+'">'+n._id+"</a> "});n.html(a.join(""))},renderRemovedOrders:function(e,t){var a=t.map(function(e){return'<a class="label label-'+("REQUIRED_STATUS"===e.reason?"success":"IGNORED_STATUS"===e.reason?"danger":"default")+'" title="'+n("planning","changes:removedOrders:"+e.reason,e.data)+'" href="#orders/'+e._id+'" target="_blank">'+e._id+"</a> "});e.html(a.join(""))},renderSettings:function(e,n){var t=["<ul>"];n.forEach(this.renderSetting.bind(this,t)),t.push("</ul>"),e.html(t.join(""))},renderSetting:function(e,t){switch(t.type){case"change":e.push('<li><i class="fa fa-minus planning-change-icon"></i> ',n("planning","settings:"+t.property)+": ",this.formatValue(t.property,t.oldValue),' <i class="fa fa-arrow-right"></i> ',this.formatValue(t.property,t.newValue),"</li>");break;case"lines:change":case"mrps:change":case"mrpLines:change":e.push('<li><i class="fa fa-minus planning-change-icon"></i> ',n("planning","changes:settings:"+t.type,{mrp:t.mrp&&t.mrp._id||t.mrp,line:t.line&&t.line._id||t.line,property:n("planning","settings:"+t.property)}),this.formatValue(t.property,t.oldValue),' <i class="fa fa-arrow-right"></i> ',this.formatValue(t.property,t.newValue),"</li>");break;default:e.push('<li><i class="fa fa-minus planning-change-icon"></i> ',n("planning","changes:settings:"+t.type,{mrp:t.mrp&&t.mrp._id||t.mrp,line:t.line&&t.line._id||t.line}),"</li>")}},formatValue:function(e,t){if(""===t||null==t)return"-";if("number"==typeof t)return t.toLocaleString();if("boolean"==typeof t)return n("core","BOOL:"+t);switch(e){case"kind":return n("planning","orderPriority:"+t);case"orderPriority":return t.map(function(e){return n("planning","orderPriority:"+e)}).join(", ");case"statuses":case"ignoredStatuses":case"requiredStatuses":case"completedStatuses":return t.map(s).join(" ");case"lines":case"extraShiftSeconds":case"mrpPriority":return 0===t.length?"-":t.join(", ");case"workerCount":return Array.isArray(t)?t.map(function(e){return e.toLocaleString()}).join("; "):t.toLocaleString();case"operation":return t.no+". "+t.name+" - "+t.laborTime.toLocaleString();case"groups":return t.length;case"activeTime":return 0===t.length?"06:00-06:00":t.map(function(e){return e.from+"-"+e.to}).join(", ");default:return String(t)}},toggleChanges:function(e){this.$(".planning-change-hd").each(function(){if(e){if(this.classList.contains("is-expanded"))return;this.click()}else this.classList.remove("is-expanded")})}})});