// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/time","app/i18n","app/data/divisions","app/data/subdivisions","app/data/views/renderOrgUnitPath","app/core/views/ListView","app/events/templates/list"],function(e,t,r,s,a,i,o,n){"use strict";return o.extend({template:n,remoteTopics:{"events.saved":"refreshCollection"},serialize:function(){var e=this;return{events:this.collection.map(function(s){var a=s.get("type"),i=e.prepareData(a,s.get("data"));return{severity:s.getSeverityClassName(),time:t.format(s.get("time"),"lll"),user:s.get("user"),type:r("events","TYPE:"+a),text:r("events","TEXT:"+a,e.flatten(i))}})}},refreshCollection:function(e,t){return"function"!=typeof this.options.filter||!Array.isArray(e)||e.some(this.options.filter)?o.prototype.refreshCollection.call(this,e,t):void 0},prepareData:function(e,o){if(o.$prepared)return o;switch(o.$prepared=!0,e){case"fte.leader.created":case"fte.leader.locked":case"fte.leader.deleted":case"fte.master.created":case"fte.master.locked":case"fte.master.deleted":var n=a.get(o.model.subdivision);o.model.subdivision=n?i(n,!1,!1):"?",o.model.date=t.format(o.model.date,"YYYY-MM-DD"),o.model.shift=r("core","SHIFT:"+o.model.shift);break;case"hourlyPlans.created":case"hourlyPlans.locked":case"hourlyPlans.deleted":var d=s.get(o.model.division);o.model.division=d?i(d,!1,!1):"?",o.model.date=t.format(o.model.date,"YYYY-MM-DD"),o.model.shift=r("core","SHIFT:"+o.model.shift);break;case"clipOrderCount.created":case"warehouse.shiftMetrics.synced":case"warehouse.shiftMetrics.syncFailed":o.date=t.format(o.date,"YYYY-MM-DD");break;case"warehouse.controlCycles.synced":case"warehouse.controlCycles.syncFailed":case"warehouse.transferOrders.synced":case"warehouse.transferOrders.syncFailed":case"xiconf.orders.synced":o.timestamp=t.format(o.timestamp,"YYYY-MM-DD, HH:mm:ss");break;case"purchaseOrders.synced":o.importedAt=t.format(o.importedAt,"LLL")}return o},flatten:function(t){var r={};if(null==t)return r;for(var s=Object.keys(t),a=0,i=s.length;i>a;++a){var o=s[a],n=t[o];if(null!==n&&"object"==typeof n)for(var d=this.flatten(n),c=Object.keys(d),l=0,f=c.length;f>l;++l)r[o+"->"+c[l]]=String(d[c[l]]);else r[o]=e.escape(String(n))}return r}})});