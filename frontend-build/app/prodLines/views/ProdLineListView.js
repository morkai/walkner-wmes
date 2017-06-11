// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/time","app/data/views/renderOrgUnitPath","app/core/views/ListView"],function(t,e,i,n,a){"use strict";function r(t){return"-"===t.deactivatedAt?"":'class="is-deleted"'}return a.extend({deactivatedVisible:!1,columns:["workCenter",{id:"_id",className:"is-min"},{id:"description",tdAttrs:r},{id:"inventoryNo",className:"is-min"},{id:"deactivatedAt",className:"is-min"}],serializeActions:function(){var i=this.collection,n=i.getNlsDomain();return function(r){var o=i.get(r._id),d=!o.get("deactivatedAt")||e.data.super,s=[];return d&&s.push({id:"production",icon:"desktop",label:t(n,"LIST:ACTION:production"),href:"#production/"+o.id}),s.push(a.actions.viewDetails(o,n)),d&&e.isAllowedTo(o.getPrivilegePrefix()+":MANAGE")&&s.push(a.actions.edit(o,n),a.actions.delete(o,n)),s}},serializeRows:function(){var t=this.deactivatedVisible;return this.collection.filter(function(e){return t||!e.get("deactivatedAt")}).map(function(t){var e=t.toJSON();return e.orgUnits=n(t),e.workCenter=n(t,!0),e.inventoryNo=e.inventoryNo||"-",e.deactivatedAt=e.deactivatedAt?i.format(e.deactivatedAt,"LL"):"-",e}).sort(function(t,e){var i=t.orgUnits.localeCompare(e.orgUnits);return 0===i?t._id.localeCompare(e._id):i})},toggleDeactivated:function(t){this.deactivatedVisible=t,this.render()}})});