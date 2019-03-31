define(["underscore","../i18n","../router","../viewport","../user","../core/util/showDeleteFormPage","./XiconfProgram","./XiconfProgramCollection"],function(a,e,r,o,i,n,m,p){"use strict";var s="i18n!app/nls/xiconfPrograms",c=i.auth("XICONF:VIEW"),g=i.auth("XICONF:MANAGE");r.map("/xiconf/programs",c,function(a){o.loadPage(["app/xiconfPrograms/pages/XiconfProgramListPage",s],function(e){return new e({collection:new p(null,{rqlQuery:a.rql})})})}),r.map("/xiconf/programs/:id",c,function(a){o.loadPage(["app/core/pages/DetailsPage","app/xiconfPrograms/views/XiconfProgramDetailsView",s],function(e,r){return new e({pageClassName:"page-max-flex",DetailsView:r,model:new m({_id:a.params.id}),baseBreadcrumb:!0})})}),r.map("/xiconf/programs;add",g,function(){o.loadPage(["app/core/pages/AddFormPage","app/xiconfPrograms/views/XiconfProgramFormView",s],function(a,e){return new a({pageClassName:"page-max-flex",FormView:e,model:new m,baseBreadcrumb:!0})})}),r.map("/xiconf/programs/:id;edit",g,function(a){o.loadPage(["app/core/pages/EditFormPage","app/xiconfPrograms/views/XiconfProgramFormView",s],function(e,r){return new e({pageClassName:"page-max-flex",FormView:r,model:new m({_id:a.params.id}),baseBreadcrumb:!0})})}),r.map("/xiconf/programs/:id;delete",g,a.partial(n,m,a,a,{baseBreadcrumb:!0}))});