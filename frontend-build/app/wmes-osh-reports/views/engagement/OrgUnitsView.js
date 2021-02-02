define(["jquery","app/core/View","app/wmes-osh-common/dictionaries","app/wmes-osh-departments/Department","app/wmes-osh-reports/util/formatPercent","app/wmes-osh-reports/templates/engagement/orgUnits","jquery.stickytableheaders"],function(e,t,i,n,o,s){"use strict";return t.extend({template:s,initialize:function(){this.listenTo(this.model,"change:orgUnits",this.render),this.setUpTooltips(),this.setUpStickyTable()},getTemplateData:function(){return{rows:this.serializeRows(),n:e=>e>=0?(Math.round(100*e)/100).toLocaleString():""}},setUpTooltips:function(){this.on("afterRender",()=>{this.$el.tooltip({container:document.body,selector:"th[title]"})}),this.on("beforeRender remove",()=>{this.$el.popover("destroy")})},setUpStickyTable:function(){this.on("afterRender",()=>{this.$(".table").stickyTableHeaders({fixedOffset:e(".navbar-fixed-top"),scrollableAreaX:this.$el})}),this.on("beforeRender remove",()=>{this.$(".table").stickyTableHeaders("destroy")})},serializeRows:function(){const e=this.createRow("total"),t={},o={},s=[],r=new n({_id:0,longName:"?"});return this.model.get("orgUnits").forEach(n=>{const a=i.departments.get(n.department)||r,c=a?i.workplaces.get(a.get("workplace")):null,l=c?i.divisions.get(c.get("division")):null;if(l){if(!t[l.id]){const e=this.createRow("division",l);t[l.id]=e,s.push(e)}this.incRow(t[l.id],n),t[l.id].children+=1}if(c){if(!o[c.id]){const e=this.createRow("workplace",l,c);o[c.id]=e,s.push(e),l&&(t[l.id].children+=1)}this.incRow(o[c.id],n),o[c.id].children+=1}const d=a===r?"unknown":"department",m=this.createRow(d,l,c,a,n);s.push(this.summarizeRow(m)),this.incRow(e,n)}),Object.values(t).forEach(this.summarizeRow,this),Object.values(o).forEach(this.summarizeRow,this),s.sort((e,t)=>e.division.localeCompare(t.division)||e.workplace.localeCompare(t.workplace)||e.department.localeCompare(t.department)),s.push(this.summarizeRow(e)),s},createRow:function(e,t,i,n,o){return o||(o={employed:0,engaged:0,metrics:[0,0,0,0]}),{type:e,children:1,division:t?t.getLabel({long:!1}):"",workplace:i?i.getLabel({long:!1}):"",department:n?n.getLabel({long:!0}):"",employed:o.employed,engaged:o.engaged,engagedPercent:0,minEngagement:t?t.get("minEngagement"):0,metrics:o.metrics}},incRow:function(e,t){e.employed+=t.employed,e.engaged+=t.engaged,t.metrics.forEach((t,i)=>{e.metrics[i]+=t})},summarizeRow:function(e){const{minEngagement:t}=this.model.get("settings");return e.engagedPercent=o(e.engaged/e.employed),e.engagedInvalid=e.engagedPercent>=0&&e.engagedPercent<(e.minEngagement||t),e}})});