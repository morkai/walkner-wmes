// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/time","app/data/views/renderOrgUnitPath","app/core/views/ListView"],function(e,i,t,a,s){"use strict";function d(e){return"-"===e.deactivatedAt?"":'class="is-deleted"'}return s.extend({deactivatedVisible:!1,columns:[{id:"subdivision",className:"is-min"},{id:"_id",className:"is-min"},{id:"inout",className:"is-min"},{id:"description",tdAttrs:d},{id:"deactivatedAt",className:"is-min"},{id:"replacedBy",className:"is-min"}],serializeActions:function(){var e=this.collection,t=e.getNlsDomain();return function(a){var d=e.get(a._id),n=!d.get("deactivatedAt")||i.data.super,c=[];return c.push(s.actions.viewDetails(d,t)),n&&i.isAllowedTo(d.getPrivilegePrefix()+":MANAGE")&&c.push(s.actions.edit(d,t),s.actions.delete(d,t)),c}},serializeRows:function(){var i=this.deactivatedVisible;return this.collection.filter(function(e){return i||!e.get("deactivatedAt")}).map(function(i){var s=i.toJSON();return s.className=s.deactivatedAt?"is-deactivated":"",s.subdivision=a(i,!0),s.deactivatedAt=s.deactivatedAt?t.format(s.deactivatedAt,"LL"):"-",s.inout=e("mrpControllers","inout:"+s.inout),s.replacedBy=s.replacedBy||"-",s})},toggleDeactivated:function(e){this.deactivatedVisible=e,this.render()}})});