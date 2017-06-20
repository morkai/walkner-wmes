// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../i18n","../user","../core/util/showDeleteFormPage","../data/divisions","./Division"],function(i,e,a,n,s,o,t){"use strict";var d="i18n!app/nls/divisions",p=n.auth("DICTIONARIES:VIEW"),r=n.auth("DICTIONARIES:MANAGE");i.map("/divisions",p,function(){e.loadPage(["app/core/pages/ListPage",d],function(i){return new i({collection:o,columns:[{id:"_id",className:"is-min"},{id:"type",className:"is-min"},"description",{id:"deactivatedAt",className:"is-min"}]})})}),i.map("/divisions/:id",function(i){e.loadPage(["app/core/pages/DetailsPage","app/divisions/templates/details",d],function(e,a){return new e({model:new t({_id:i.params.id}),detailsTemplate:a,actions:function(){return this.model.get("deactivatedAt")&&!n.data.super?[]:e.prototype.actions.call(this)}})})}),i.map("/divisions;add",r,function(){e.loadPage(["app/core/pages/AddFormPage","app/divisions/views/DivisionFormView",d],function(i,e){return new i({FormView:e,model:new t})})}),i.map("/divisions/:id;edit",r,function(i){e.loadPage(["app/core/pages/EditFormPage","app/divisions/views/DivisionFormView",d],function(e,a){return new e({FormView:a,model:new t({_id:i.params.id})})})}),i.map("/divisions/:id;delete",r,s.bind(null,t))});