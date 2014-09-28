// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","i18n!app/nls/icpo"],function(e,p,a){var i=a.auth("ICPO:VIEW");e.map("/icpo/results",i,function(e){p.loadPage(["app/icpo/pages/IcpoResultListPage"],function(p){return new p({rql:e.rql})})}),e.map("/icpo/results/:id",i,function(e){p.loadPage(["app/icpo/pages/IcpoResultDetailsPage"],function(p){return new p({modelId:e.params.id})})})});