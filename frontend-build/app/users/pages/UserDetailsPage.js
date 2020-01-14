define(["app/i18n","app/user","app/viewport","app/core/util/pageActions","app/core/pages/DetailsPage","app/core/views/DialogView","../views/UserDetailsView","app/users/templates/anonymizeDialog"],function(e,i,t,n,o,a,s,l){"use strict";return o.extend({DetailsView:s,breadcrumbs:function(){return i.isAllowedTo("USERS:VIEW")?o.prototype.breadcrumbs.call(this):[this.t("BREADCRUMB:myAccount")]},actions:function(){var e=this.model,t=[];return i.isAllowedTo("USERS:MANAGE")?(t.push(n.edit(e,!1),n.delete(e,!1)),i.isAllowedTo("SUPER")&&t.push({label:this.t("PAGE_ACTION:anonymize"),icon:"user-secret",callback:this.handleAnonymizeAction.bind(this)})):i.data._id===e.id&&t.push({label:this.t("PAGE_ACTION:editAccount"),icon:"edit",href:e.genClientUrl("edit")}),t},handleAnonymizeAction:function(){var e=this,i=new a({template:l,model:{nlsDomain:e.model.getNlsDomain()}});e.listenToOnce(i,"answered",function(i){"yes"===i&&(e.ajax({method:"POST",url:"/users/"+e.model.id+"/anonymize"}),t.msg.show({type:"warning",time:3e3,text:e.t("anonymize:started")}))}),t.showDialog(i,e.t("anonymize:title"))}})});