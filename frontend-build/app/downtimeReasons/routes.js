define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/downtimeReasons","./DowntimeReason"],function(e,o,n,a,i,s){"use strict";var t="i18n!app/nls/downtimeReasons",d=n.auth("DICTIONARIES:VIEW"),r=n.auth("DICTIONARIES:MANAGE");e.map("/downtimeReasons",d,function(){o.loadPage(["app/core/pages/ListPage",t],function(e){return new e({collection:i,columns:["_id","label","type","defaultAor","subdivisionTypes","aors","opticsPosition","pressPosition","auto","scheduled","color","refColor","refValue"]})})}),e.map("/downtimeReasons/:id",function(e){o.loadPage(["app/core/pages/DetailsPage","app/downtimeReasons/templates/details",t],function(o,n){return new o({model:new s({_id:e.params.id}),detailsTemplate:n})})}),e.map("/downtimeReasons;add",r,function(){o.loadPage(["app/core/pages/AddFormPage","app/downtimeReasons/views/DowntimeReasonFormView",t],function(e,o){return new e({FormView:o,model:new s})})}),e.map("/downtimeReasons/:id;edit",r,function(e){o.loadPage(["app/core/pages/EditFormPage","app/downtimeReasons/views/DowntimeReasonFormView",t],function(o,n){return new o({FormView:n,model:new s({_id:e.params.id})})})}),e.map("/downtimeReasons/:id;delete",r,a.bind(null,s))});