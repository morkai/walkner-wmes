define(["app/user","app/core/View","./ChartView","./TableView","app/wmes-ct-pces/templates/groupsReport/group"],function(e,t,i,r,o){"use strict";return t.extend({template:o,initialize:function(){this.setView("#-chart",new i({model:this.model,group:this.group})),this.setView("#-table",new r({model:this.model,group:this.group}))},getTemplateData:function(){return{group:this.group.attributes,canViewGroups:e.isAllowedTo("PLANNING:VIEW","FN:process-engineer")}}})});