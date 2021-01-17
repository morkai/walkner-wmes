define(["jquery","app/time","app/core/View","app/core/util/bindLoadingMessage","app/planning/PlanSettings","app/orders/OrderCollection","../OrderGroupCollection","../views/TesterFilterView","../views/TesterGroupsView","app/planning-orderGroups/templates/tester/page"],function(e,t,r,n,i,o,s,u,a,l){"use strict";return r.extend({template:l,modelProperty:"orderGroups",breadcrumbs:function(){return[{href:"#planning/plans",label:this.t("BREADCRUMB:base")},{href:"#planning/orderGroups",label:this.t("BREADCRUMB:browse")},this.t("tester:breadcrumb")]},initialize:function(){this.orderGroups=n(new s([],{rqlQuery:"sort(name)&limit(0)",sortByName:!0}),this),this.planSettings=n(new i({_id:this.model.get("date")}),this),this.sapOrders=n(new o([],{rqlQuery:"select(mrp,nc12,qty,name,description,bom)&limit(0)&statuses=in=REL&statuses=nin=(TECO,DLT,DLFL)&scheduledStartDate="+t.getMoment(this.model.get("date"),"YYYY-MM-DD").valueOf()+"&mrp="+this.model.get("mrp")}),this),this.filterView=new u({model:this.model}),this.groupsView=new a({model:this.model}),this.setView("#-filter",this.filterView),this.setView("#-groups",this.groupsView),this.listenTo(this.model,"filtered",this.onFiltered),this.once("afterLoad",this.matchGroups)},load:function(e){return e(this.orderGroups.fetch({reset:!0}),this.sapOrders.fetch({reset:!0}),this.planSettings.fetch())},onFiltered:function(){var r=this,n=r.model.get("mrp"),i=r.model.get("date"),o=t.getMoment(i,"YYYY-MM-DD").valueOf();r.planSettings.set("_id",i),r.sapOrders.rqlQuery.selector.args.forEach(function(e){"eq"===e.name&&"scheduledStartDate"===e.args[0]?e.args[1]=o:"eq"===e.name&&"mrp"===e.args[0]&&(e.args[1]=n)}),r.model.set("loading",!0),r.load(e.when.bind(e)).then(function(){r.model.set("loading",!1),r.matchGroups()}),r.broker.publish("router.navigate",{url:"/planning/orderGroups;tester?date="+i+"&mrp="+n,replace:!0,trigger:!1})},matchGroups:function(){var e=this,t={};e.sapOrders.forEach(function(r){e.matchSapOrder(r).forEach(function(e){t[e.orderGroup.id]||(t[e.orderGroup.id]={orderGroup:e.orderGroup,sapOrders:[]}),t[e.orderGroup.id].sapOrders.push(r)})}),e.model.set({groups:Object.values(t)})},matchSapOrder:function(e){var t=this,r=[],n=e.get("mrp"),i=((e.get("nc12")||"")+" "+(e.get("name")||"")+" "+(e.get("description")||"")).trim().toUpperCase(),o=[];(e.get("bom")||[]).forEach(function(e){var t=(e.get("item")||"")+" "+(e.get("nc12")||"")+" "+(e.get("name")||"");o.push(t.trim().toUpperCase())});var s=null;return t.orderGroups.forEach(function(u){u.isNoMatchGroup()?s=u:t.matchOrderGroup(u,n,i,o)&&r.push({orderGroup:u,sapOrder:e})}),0===r.length&&r.push({orderGroup:s,sapOrder:e}),r},matchOrderGroup:function(e,t,r,n){return!e.isEmptyGroup()&&this.matchMrp(e.get("mrp"),t)&&this.matchProductInclude(e.get("productInclude"),r)&&this.matchProductExclude(e.get("productExclude"),r)&&this.matchBomInclude(e.get("bomInclude"),n)&&this.matchBomExclude(e.get("bomExclude"),n)},matchAllWords:function(e,t){if(1===e.length)return t.includes(e[0]);for(var r=0;r<e.length;++r)if(!t.includes(e[r]))return!1;return!0},matchAnyWord:function(e,t){if(1===e.length)return t.includes(e[0]);for(var r=0;r<e.length;++r)if(t.includes(e[r]))return!0;return!1},matchMrp:function(e,t){return 0===e.length||e.includes(t)},matchProductInclude:function(e,t){if(0===e.length)return!0;for(var r=0;r<e.length;++r)if(this.matchAllWords(e[r],t))return!0;return!1},matchProductExclude:function(e,t){if(0===e.length)return!0;for(var r=0;r<e.length;++r)if(this.matchAllWords(e[r],t))return!1;return!0},matchBomInclude:function(e,t){if(0===e.length)return!0;for(var r=0;r<e.length;++r){for(var n=e[r],i=[],o=0;o<t.length;++o)this.matchAnyWord(n,t[o])&&i.push(t[o]);if(i.length>=n.length)return!0}return!1},matchBomExclude:function(e,t){if(0===e.length)return!0;for(var r=0;r<e.length;++r){for(var n=e[r],i=[],o=0;o<t.length;++o)this.matchAnyWord(n,t[o])&&i.push(t[o]);if(i.length>=n.length)return!1}return!0}})});