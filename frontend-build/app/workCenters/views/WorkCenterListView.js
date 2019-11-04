define(["app/user","app/time","app/orgUnits/util/renderOrgUnitPath","app/core/views/ListView"],function(t,e,i,n){"use strict";return n.extend({deactivatedVisible:!1,columns:function(){return[{id:"orgUnitPath",className:"is-min"},{id:"_id",className:"is-min"},{id:"description",tdAttrs:function(t){return{className:t.deactivatedAt?"is-deleted":""}}},{id:"deactivatedAt",className:"is-min"}]},serializeActions:function(){var e=this.collection,i=e.getNlsDomain();return function(a){var r=e.get(a._id),s=!r.get("deactivatedAt")||t.data.super,c=[];return c.push(n.actions.viewDetails(r,i)),s&&t.isAllowedTo(r.getPrivilegePrefix()+":MANAGE")&&c.push(n.actions.edit(r,i),n.actions.delete(r,i)),c}},serializeRows:function(){var t=this.deactivatedVisible;return this.collection.filter(function(e){return t||!e.get("deactivatedAt")}).map(function(t){var n=t.toJSON();return n.orgUnitPath=i(t,!0),n.orgUnitsText=i(t,!1,!1),n.deactivatedAt=n.deactivatedAt?e.format(n.deactivatedAt,"LL"):"",n}).sort(function(t,e){return t.orgUnitsText.localeCompare(e.orgUnitsText,void 0,{numeric:!0,ignorePunctuation:!0})})},toggleDeactivated:function(t){this.deactivatedVisible=t,this.render()}})});