define(["app/i18n","app/user","app/data/views/renderOrgUnitPath","app/core/views/ListView"],function(e,i,t,n){return n.extend({columns:["workCenter","_id","description"],serializeActions:function(){var t=this.collection,o=t.getNlsDomain();return function(r){var c=t.get(r._id),s=[{id:"production",icon:"desktop",label:e(o,"LIST:ACTION:production"),href:"#production/"+c.id},n.actions.viewDetails(c,o)];return i.isAllowedTo(c.getPrivilegePrefix()+":MANAGE")&&s.push(n.actions.edit(c,o),n.actions.delete(c,o)),s}},serializeRows:function(){return this.collection.map(function(e){var i=e.toJSON();return i.workCenter=t(e,!0),i})}})});