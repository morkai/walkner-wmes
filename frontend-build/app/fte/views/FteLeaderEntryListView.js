define(["moment","app/i18n","app/user","app/data/subdivisions","app/data/views/renderOrgUnitPath","app/core/views/ListView"],function(e,i,t,n,o,r){return r.extend({remoteTopics:{"fte.leader.created":"refreshCollection","fte.leader.locked":"refreshCollection"},serializeColumns:function(){return[{id:"subdivision",label:i("core","ORG_UNIT:subdivision")},{id:"date",label:i(this.collection.getNlsDomain(),"property:date")},{id:"shift",label:i(this.collection.getNlsDomain(),"property:shift")}]},serializeActions:function(){var e=this.collection;return function(o){var s=e.get(o._id),l=[r.actions.viewDetails(s)],a=s.getPrivilegePrefix();if(o.locked)l.push({icon:"print",label:i(s.getNlsDomain(),"LIST:ACTION:print"),href:s.genClientUrl("print")});else if(t.isAllowedTo(a+":MANAGE")){if(!t.isAllowedTo(a+":ALL")){var d=t.getDivision(),c=n.get(s.get("subdivision"));if(d&&d.get("_id")!==c.get("division"))return l}l.push({icon:"edit",label:i(s.getNlsDomain(),"LIST:ACTION:edit"),href:s.genClientUrl("edit")})}return l}},serializeRows:function(){return this.collection.map(function(t){var r=n.get(t.get("subdivision")),s=t.toJSON();return s.subdivision=r?o(r,!1,!1):"?",s.date=e(s.date).format("LL"),s.shift=i("core","SHIFT:"+s.shift),s})}})});