// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","i18n!app/nls/xiconf"],function(n,e,a){var i=a.auth("XICONF:VIEW");n.map("/xiconf/results",i,function(n){e.loadPage(["app/xiconf/pages/XiconfResultListPage"],function(e){return new e({rql:n.rql})})}),n.map("/xiconf/results/:id",i,function(n){e.loadPage(["app/xiconf/pages/XiconfResultDetailsPage"],function(e){return new e({modelId:n.params.id,tab:n.query.tab})})})});