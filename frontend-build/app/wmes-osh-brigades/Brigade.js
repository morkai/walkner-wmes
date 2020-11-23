define(["app/time","app/user","app/core/Model","app/core/templates/userInfo"],function(e,t,r,i){"use strict";return r.extend({urlRoot:"/osh/brigades",clientUrlRoot:"#osh/brigades",topicPrefix:"osh.brigades",privilegePrefix:"OSH:HR",nlsDomain:"wmes-osh-brigades",getLabel:function(){return e.utc.format(this.get("date"),"YYYY-MM")+", "+this.get("leader").label},serialize:function(){const t=this.toJSON();return t.date=e.utc.format(t.date,"MMMM YYYY"),t.leader=i(t.leader),t},serializeRow:function(){const e=this.serialize(),t=e.members;return e.members=t.length?i(e.members[0]):"",t.length>1&&(e.members+=` +${t.length-1}`),e},serializeDetails:function(){const e=this.serialize();return e.members=e.members.map(i),e}},{can:{add:function(){return t.isAllowedTo("OSH:HR:MANAGE","OSH:LEADER")},edit:function(e){return!!t.isAllowedTo("OSH:HR:MANAGE")||e.get("leader").id===t.data._id}}})});