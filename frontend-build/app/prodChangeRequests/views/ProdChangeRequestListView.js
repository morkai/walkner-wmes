// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/views/ListView","app/data/aors","app/data/downtimeReasons","app/prodShifts/ProdShift","app/prodShiftOrders/ProdShiftOrder","app/prodDowntimes/ProdDowntime","app/core/templates/userInfo","app/prodChangeRequests/templates/detailsRow","app/prodChangeRequests/templates/quantitiesDone"],function(e,t,r,i,s,o,a,n,d,c,l,u,p,h,m){"use strict";var f={shift:c,order:l,downtime:u},g=["date","shift","master","leader","operator"],w={shift:["quantitiesDone"],order:["orderId","operationNo","quantityDone","workerCount","startedAt","finishedAt"],downtime:["reason","aor","reasonComment","startedAt","finishedAt"]},v={shift:"prodShifts",order:"prodShiftOrders",downtime:"prodDowntimes"};return a.extend({className:function(){return this.collection.isNewStatus()?"":"is-colored"},remoteTopics:{"prodChangeRequests.**":function(){this.showingDetails?this.requiresRefresh=!0:this.refreshCollection()}},events:{"click .list-item[data-id]":function(e){"A"===e.target.tagName||this.el.classList.contains("is-loading")||this.toggleDetails(e.currentTarget.dataset.id)},"click #-accept":function(e){this.confirm(e.currentTarget.dataset.id,"accepted")},"click #-reject":function(e){this.confirm(e.currentTarget.dataset.id,"rejected")}},initialize:function(){a.prototype.initialize.apply(this,arguments),this.requiresRefresh=!1,this.showingDetails=!1,this.$errorMessage=null},destroy:function(){a.prototype.destroy.apply(this,arguments),this.hideErrorMessage()},afterRender:function(){a.prototype.afterRender.apply(this,arguments),this.requiresRefresh=!1,this.showingDetails=!1,this.hideErrorMessage()},serializeColumns:function(){var e=this.collection.isNewStatus(),t=[{id:"division",className:"is-min"},{id:"prodLine",className:"is-min"},{id:"operation",className:e?"is-min":""},"creatorComment",{id:"creator",className:"is-min"},{id:"createdAt",className:"is-min"}];return e||t.push("confirmerComment",{id:"confirmer",className:"is-min"},{id:"confirmedAt",className:"is-min"}),t},serializeActions:function(){return null},serializeRows:function(){var e=this;return this.collection.map(function(t){var r=t.get("confirmedAt"),s=t.get("confirmer"),o=t.get("status"),a="accepted"===o?"success":"rejected"===o?"danger":"";return{_id:t.id,className:"prodChangeRequests-list-item "+a,division:t.get("division"),prodLine:t.get("prodLine"),operation:e.serializeOperation(t),createdAt:i.format(t.get("createdAt"),"LLL"),creator:p({userInfo:t.get("creator")}),creatorComment:t.get("creatorComment")||"-",confirmedAt:r?i.format(t.get("confirmedAt"),"LLL"):"-",confirmer:s?p({userInfo:s}):"-",confirmerComment:t.get("confirmerComment")||"-"}})},serializeOperation:function(e){var t=e.get("status"),s=e.get("modelType"),o=e.get("data"),a=e.get("operation"),n=new f[s](o),c="?",l="add"===a||"delete"===a&&"new"!==t?null:n.genClientUrl();switch(s){case"shift":c=r("core","SHIFT",{date:i.format(o.date,"YYYY-MM-DD"),shift:r("core","SHIFT:"+o.shift)});break;case"order":c=n.getLabel();break;case"downtime":if("add"===a){var u=n.get("reason"),p=d.get(u);c=p?p.getLabel():u}else c=n.get("rid")}var h=r("prodChangeRequests","operation:"+a+":"+s,{extra:c});return l?'<a href="'+l+'">'+h+"</a>":h},toggleDetails:function(e){var t=this.$('.list-item[data-id="'+e+'"]'),r=this.$(".is-expanded");this.collapseDetails(r),t[0]===r[0]?this.requiresRefresh&&this.refreshCollectionNow():this.expandDetails(e,t)},collapseDetails:function(e){e.removeClass("is-expanded").next().remove()},expandDetails:function(e,r){var i=this.collection.get(e);if("new"===i.get("status")){var s=t(h({idPrefix:this.idPrefix,showForm:"new"===i.get("status")&&this.isCurrentUserAllowedToConfirm(i),changeRequestId:e,isEdit:"edit"===i.get("operation"),changes:this.serializeChanges(i)}));s.insertAfter(r),r.addClass("is-expanded"),s.find("textarea").focus(),this.showingDetails=!0}},isCurrentUserAllowedToConfirm:function(e){if(!s.isAllowedTo("PROD_DATA:MANAGE","PROD_DATA:CHANGES:MANAGE"))return!1;var t=s.getDivision();return!t||t.id===e.get("division")},serializeChanges:function(t){var i=[],s=t.get("operation");if("delete"===s||"new"!==t.get("status"))return i;var o=t.get("modelType"),a=v[o],n=[].concat(g,w[o]),d=t.get("prodModel"),c=t.get("data"),l=this;return e.forEach(n,function(t){var o=d?d[t]:null,n=c[t];if("edit"!==s||!e.isEqual(o,n)){var u=r(a,"PROPERTY:"+t);i.push("quantitiesDone"===t?{property:u,value:m({oldQuantitiesDone:o,newQuantitiesDone:n})}:{property:u,oldValue:l.serializeProperty(t,o),newValue:l.serializeProperty(t,n)})}}),i},serializeProperty:function(e,t){if(null===t||void 0===t||""===t)return"-";switch(e){case"master":case"leader":case"operator":return p({userInfo:t});case"date":return i.format(t,"LL");case"shift":return r("core","SHIFT:"+t);case"startedAt":case"finishedAt":return i.format(t,"LLLL");case"reason":var s=d.get(t);return s?s.getLabel():t;case"aor":var o=n.get(t);return o?o.getLabel():t}return"number"==typeof t?t.toLocaleString():String(t)},confirm:function(e,t){var i=this.collection.get(e);if(i){var s=this.$el.addClass("is-loading"),a=this.$(".prodChangeRequests-details").find(".form-control, .btn").prop("disabled",!0),n=this,d=i.save({status:t,confirmerComment:this.$id("confirmerComment").val().trim()},{method:"POST"});d.done(function(){s.removeClass("is-loading"),n.requiresRefresh=!0,n.toggleDetails(e),o.msg.show({type:"success",time:2500,text:r("prodChangeRequests","confirm:success:"+t)})}),d.fail(function(e){var t=v[i.get("modelType")],o=e.responseJSON?e.responseJSON.error.message:null;o=r.has("prodChangeRequests","confirm:error:"+o)?r("prodChangeRequests","confirm:error:"+o):r.has(t,"FORM:ERROR:"+o)?r(t,"FORM:ERROR:"+o):r("prodChangeRequests","confirm:error"),n.showErrorMessage(o),a.prop("disabled",!1),s.removeClass("is-loading")})}},showErrorMessage:function(e){this.hideErrorMessage(),this.$errorMessage=o.msg.show({type:"error",time:5e3,text:e})},hideErrorMessage:function(){this.$errorMessage&&(o.msg.hide(this.$errorMessage),this.$errorMessage=null)}})});