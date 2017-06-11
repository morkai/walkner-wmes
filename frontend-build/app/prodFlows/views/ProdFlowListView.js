// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/user","app/time","app/data/views/renderOrgUnitPath","app/core/views/ListView","./decorateProdFlow"],function(e,t,i,a,s){"use strict";function n(e){return"-"===e.deactivatedAt?"":'class="is-deleted"'}return a.extend({deactivatedVisible:!1,columns:[{id:"subdivision",className:"is-min"},{id:"mrpControllers",className:"is-min"},{id:"name",tdAttrs:n},{id:"deactivatedAt",className:"is-min"}],serializeActions:function(){var t=this.collection,i=t.getNlsDomain();return function(s){var n=t.get(s._id),r=!n.get("deactivatedAt")||e.data.super,d=[];return d.push(a.actions.viewDetails(n,i)),r&&e.isAllowedTo(n.getPrivilegePrefix()+":MANAGE")&&d.push(a.actions.edit(n,i),a.actions.delete(n,i)),d}},serializeRows:function(){var e=this.deactivatedVisible;return this.collection.filter(function(t){return e||!t.get("deactivatedAt")}).map(function(e){return s(e,!0)})},toggleDeactivated:function(e){this.deactivatedVisible=e,this.render()}})});