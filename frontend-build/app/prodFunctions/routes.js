define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/prodFunctions","./ProdFunction"],function(i,n,o,e,a,d){"use strict";var r="i18n!app/nls/prodFunctions",t=o.auth("DICTIONARIES:VIEW"),s=o.auth("DICTIONARIES:MANAGE");i.map("/prodFunctions",t,function(){n.loadPage(["app/core/pages/ListPage",r],function(i){return new i({collection:a,columns:[{id:"_id",className:"is-min"},"label",{id:"direct",className:"is-min"},{id:"dirIndirRatio",className:"is-min"},{id:"color",className:"is-min"}]})})}),i.map("/prodFunctions/:id",function(i){n.loadPage(["app/core/pages/DetailsPage","app/prodFunctions/views/ProdFunctionDetailsView",r],function(n,o){return new n({DetailsView:o,model:new d({_id:i.params.id})})})}),i.map("/prodFunctions;add",s,function(){n.loadPage(["app/core/pages/AddFormPage","app/prodFunctions/views/ProdFunctionFormView",r],function(i,n){return new i({FormView:n,model:new d})})}),i.map("/prodFunctions/:id;edit",s,function(i){n.loadPage(["app/core/pages/EditFormPage","app/prodFunctions/views/ProdFunctionFormView",r],function(n,o){return new n({FormView:o,model:new d({_id:i.params.id})})})}),i.map("/prodFunctions/:id;delete",s,e.bind(null,d))});