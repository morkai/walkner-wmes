define(["moment","../data/subdivisions","../data/views/renderOrgUnitPath","../core/Model"],function(e,t,i,n){return n.extend({urlRoot:"/fte/leader",clientUrlRoot:"#fte/leader",topicPrefix:"fte.leader",privilegePrefix:"FTE:LEADER",nlsDomain:"fte",defaults:{subdivision:null,date:null,shift:null,fteDiv:null,tasks:null,locked:!1,createdAt:null,creatorId:null,creatorLabel:null,updatedAt:null,updaterId:null,updaterLabel:null},serializeWithTotals:function(){var n=this.serializeCompanies(),r=t.get(this.get("subdivision"));return{subdivision:r?i(r,!1,!1):"?",date:e(this.get("date")).format("LL"),shift:this.get("shift"),total:n.reduce(function(e,t){return e+t.total},0),companies:n,divisions:this.get("fteDiv")||[],tasks:this.serializeTasks(),locked:!!this.get("locked")}},serializeCompanies:function(){var e=this.get("tasks");return e.length?e[0].companies.map(function(t,i){return t.total=e.reduce(function(e,t){return Array.isArray(t.companies[i].count)?t.companies[i].count.forEach(function(t){e+=t.value}):e+=t.companies[i].count,e},0),t}):[]},serializeTasks:function(){return this.get("tasks").map(function(e){return e.total=e.companies.reduce(function(e,t){return Array.isArray(t.count)?t.count.forEach(function(t){e+=t.value}):e+=t.count,e},0),e})}})});