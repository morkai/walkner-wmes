define(["app/i18n","app/user","app/data/views/renderOrgUnitPath","app/core/views/ListView"],function(e,t,n,r){return r.extend({columns:["workCenter","_id","description"],serializeActions:function(){var n=this.collection,i=n.getNlsDomain();return function(o){var a=n.get(o._id),s=[{id:"production",icon:"desktop",label:e(i,"LIST:ACTION:production"),href:"#production/"+a.id},r.actions.viewDetails(a,i)];return t.isAllowedTo(a.getPrivilegePrefix()+":MANAGE")&&s.push(r.actions.edit(a,i),r.actions.delete(a,i)),s}},serializeRows:function(){return this.collection.map(function(e){var t=e.toJSON();return t.workCenter=n(e,!0),t})}})});