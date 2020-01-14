define(["underscore","jquery","../router","../viewport","../user","../i18n","../core/View","../core/util/showDeleteFormPage"],function(s,e,a,n,p,c,r,t){"use strict";var o="css!app/pscs/main",u="i18n!app/nls/pscs",l=p.auth("PSCS:VIEW"),i=p.auth("PSCS:MANAGE");a.map("/pscs",function(){n.loadPage(["app/pscs/pages/PscsIntroPage",o,u],function(s){return new s})}),a.map("/pscs/learn",function(){n.loadPage(["app/pscs/pages/PscsLearnPage",o,u],function(s){return new s})}),a.map("/pscs/exam",function(){n.loadPage(["app/pscs/PscsResult","app/pscs/views/ExamView",o,u],function(s,e){return new r({layoutName:"blank",breadcrumbs:[{href:"#pscs",label:c.bound("pscs","BREADCRUMB:base")},c.bound("pscs","BREADCRUMB:exam")],view:new e({editMode:!1,formMethod:"POST",formAction:"/pscs/results",model:new s({personnelId:p.data.personellId||""})})})})}),a.map("/pscs/results",l,function(s){n.loadPage(["app/pscs/PscsResultCollection","app/pscs/pages/PscsResultListPage",o,u],function(e,a){return new a({collection:new e(null,{rqlQuery:s.rql})})})}),a.map("/pscs/results/:id;delete",i,s.partial(t,"app/pscs/PscsResult",s,s,{baseBreadcrumb:!0}))});