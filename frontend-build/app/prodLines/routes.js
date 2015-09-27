// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/prodLines","./ProdLine","i18n!app/nls/prodLines"],function(e,n,i,o,r,a){"use strict";var d=i.auth("DICTIONARIES:VIEW"),p=i.auth("DICTIONARIES:MANAGE");e.map("/prodLines",d,function(){n.loadPage(["app/prodLines/pages/ProdLineListPage"],function(e){return new e({collection:r})})}),e.map("/prodLines/:id",function(e){n.loadPage(["app/prodLines/pages/ProdLineDetailsPage"],function(n){return new n({model:new a({_id:e.params.id})})})}),e.map("/prodLines;add",p,function(){n.loadPage(["app/core/pages/AddFormPage","app/prodLines/views/ProdLineFormView"],function(e,n){return new e({FormView:n,model:new a})})}),e.map("/prodLines/:id;edit",p,function(e){n.loadPage(["app/core/pages/EditFormPage","app/prodLines/views/ProdLineFormView"],function(n,i){return new n({FormView:i,model:new a({_id:e.params.id})})})}),e.map("/prodLines/:id;delete",p,o.bind(null,a))});