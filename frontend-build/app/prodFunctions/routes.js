// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/prodFunctions","./ProdFunction","i18n!app/nls/prodFunctions"],function(i,n,e,o,a,s){"use strict";var t=e.auth("DICTIONARIES:VIEW"),d=e.auth("DICTIONARIES:MANAGE");i.map("/prodFunctions",t,function(){n.loadPage(["app/core/pages/ListPage"],function(i){return new i({collection:a,columns:[{id:"_id",className:"is-min"},"label",{id:"fteMasterPosition",className:"is-min"},{id:"fteLeaderPosition",className:"is-min"},{id:"fteOtherPosition",className:"is-min"},{id:"direct",className:"is-min"},{id:"dirIndirRatio",className:"is-min"},{id:"companies",className:"is-min"},{id:"color",className:"is-min"}]})})}),i.map("/prodFunctions/:id",function(i){n.loadPage(["app/core/pages/DetailsPage","app/prodFunctions/views/ProdFunctionDetailsView"],function(n,e){return new n({DetailsView:e,model:new s({_id:i.params.id})})})}),i.map("/prodFunctions;add",d,function(){n.loadPage(["app/core/pages/AddFormPage","app/prodFunctions/views/ProdFunctionFormView"],function(i,n){return new i({FormView:n,model:new s})})}),i.map("/prodFunctions/:id;edit",d,function(i){n.loadPage(["app/core/pages/EditFormPage","app/prodFunctions/views/ProdFunctionFormView"],function(n,e){return new n({FormView:e,model:new s({_id:i.params.id})})})}),i.map("/prodFunctions/:id;delete",d,o.bind(null,s))});