// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time","app/i18n","app/user","app/data/divisions","app/orgUnits/util/renderOrgUnitPath","app/core/views/ListView"],function(i,e,t,n,r,s){"use strict";return s.extend({className:"is-clickable",remoteTopics:{"hourlyPlans.created":"refreshCollection","hourlyPlans.deleted":"onModelDeleted"},serializeColumns:function(){return[{id:"division",className:"is-min",label:e("core","ORG_UNIT:division")},{id:"date",className:"is-min",label:e("hourlyPlans","property:date")},{id:"shift",label:e("hourlyPlans","property:shift")}]},serializeActions:function(){var i=this.collection;return function(n){var r=i.get(n._id),a=[s.actions.viewDetails(r),{icon:"print",label:e("core","LIST:ACTION:print"),href:r.genClientUrl("print")}];return r.isEditable(t)&&a.push(s.actions.edit(r),s.actions.delete(r)),a}},serializeRows:function(){return this.collection.map(function(t){var s=n.get(t.get("division")),a=t.toJSON();return a.division=s?r(s,!1,!1):"?",a.date=i.format(a.date,"LL"),a.shift=e("core","SHIFT:"+a.shift),a})}})});