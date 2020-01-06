define(["underscore","app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/wmes-ct-lines/LineCollection","../GroupsReport","../views/groupsReport/FilterView","../views/groupsReport/GroupView","app/wmes-ct-pces/templates/groupsReport/page"],function(e,t,i,r,s,o,n,l,p){"use strict";return i.extend({pageClassName:"page-max-flex",layoutName:"page",template:p,breadcrumbs:function(){return[{href:"#ct",label:this.t("BREADCRUMBS:base")},this.t("BREADCRUMBS:reports:groups")]},actions:function(){return[{label:this.t("PAGE_ACTIONS:orderGroups"),href:"#ct/orderGroups"}]},initialize:function(){this.model=r(this.model,this),this.lines=r(new s(null,{rqlQuery:"select(_id)&limit(0)"}),this),this.setView("#-filter",new n({model:this.model,lines:this.lines})),this.listenTo(this.model,"filtered",this.onFiltered),this.listenToOnce(this,"afterRender",function(){this.listenTo(this.model.groups,"reset",function(){this.renderGroups(!0)})})},load:function(e){return e(this.lines.fetch({reset:!0}),this.model.fetch())},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})},beforeRender:function(){this.renderGroups(!1)},renderGroups:function(e){var t=this;t.removeView("#-groups"),t.model.groups.forEach(function(i){var r=new l({model:t.model,group:i});t.insertView("#-groups",r),e&&r.render()})}})});