define(["require","app/time","app/core/Model"],function(e,t,n){"use strict";return n.extend({urlRoot:"/osh/employments",clientUrlRoot:"#osh/employments",topicPrefix:"osh.employments",privilegePrefix:"OSH:HR",nlsDomain:"wmes-osh-employments",getLabel:function(){return t.utc.format(this.id,"MMMM YYYY")},parse:function(e){return e._id=t.utc.format(e._id,"YYYY-MM-DD"),e},serialize:function(){const e=this.toJSON();return e.month=t.utc.format(e._id,"MMMM YYYY"),e},serializeRow:function(){const e=this.serialize();return e.internal=0,e.external=0,e.absent=0,e.total=0,e.observers=0,e.departments.forEach(t=>{e.internal+=t.internal,e.external+=t.external,e.absent+=t.absent,e.total+=t.total,e.observers+=t.observers}),e},serializeDetails:function(){const t=e("app/wmes-osh-common/dictionaries"),n=this.serialize();return n.orgUnits=n.departments.map(e=>({division:t.getLabel("divisions",e.division),workplace:e.workplace?t.getLabel("workplaces",e.workplace):"",department:e.department?t.getLabel("departments",e.department):"",internal:e.internal,external:e.external,absent:e.absent,total:e.total,observers:e.observers})),n}})});