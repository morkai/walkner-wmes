define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/prodLines","./ProdLine"],function(e,n,i,o,r,a){"use strict";var d="i18n!app/nls/prodLines",p=i.auth("DICTIONARIES:VIEW"),t=i.auth("DICTIONARIES:MANAGE");e.map("/prodLines",p,function(){n.loadPage(["app/prodLines/pages/ProdLineListPage",d],function(e){return new e({collection:r})})}),e.map("/prodLines/:id",function(e){n.loadPage(["app/prodLines/pages/ProdLineDetailsPage",d],function(n){return new n({model:new a({_id:e.params.id})})})}),e.map("/prodLines;add",t,function(){n.loadPage(["app/core/pages/AddFormPage","app/prodLines/views/ProdLineFormView",d],function(e,n){return new e({FormView:n,model:new a})})}),e.map("/prodLines/:id;edit",t,function(e){n.loadPage(["app/core/pages/EditFormPage","app/prodLines/views/ProdLineFormView",d],function(n,i){return new n({FormView:i,model:new a({_id:e.params.id})})})}),e.map("/prodLines/:id;delete",t,o.bind(null,a))});