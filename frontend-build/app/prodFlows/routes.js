// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/prodFlows","./ProdFlow","i18n!app/nls/prodFlows"],function(o,e,r,a,d,p){"use strict";var i=r.auth("DICTIONARIES:VIEW"),n=r.auth("DICTIONARIES:MANAGE");o.map("/prodFlows",i,function(){e.loadPage(["app/core/pages/ListPage","app/prodFlows/views/ProdFlowListView"],function(o,e){return new o({ListView:e,collection:d})})}),o.map("/prodFlows/:id",function(o){e.loadPage(["app/prodFlows/pages/ProdFlowDetailsPage"],function(e){return new e({model:new p({_id:o.params.id})})})}),o.map("/prodFlows;add",n,function(){e.loadPage(["app/core/pages/AddFormPage","app/prodFlows/views/ProdFlowFormView"],function(o,e){return new o({FormView:e,model:new p})})}),o.map("/prodFlows/:id;edit",n,function(o){e.loadPage(["app/core/pages/EditFormPage","app/prodFlows/views/ProdFlowFormView"],function(e,r){return new e({FormView:r,model:new p({_id:o.params.id})})})}),o.map("/prodFlows/:id;delete",n,a.bind(null,p))});