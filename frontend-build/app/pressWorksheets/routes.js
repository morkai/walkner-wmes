// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","./PressWorksheet","./pages/PressWorksheetListPage","./pages/PressWorksheetDetailsPage","./pages/PressWorksheetAddFormPage","./pages/PressWorksheetEditFormPage","i18n!app/nls/pressWorksheets"],function(e,s,r,o,t,a,i,n,p){"use strict";var d=r.auth("LOCAL","PRESS_WORKSHEETS:VIEW"),h=r.auth("PRESS_WORKSHEETS:MANAGE");e.map("/pressWorksheets",d,function(e){s.showPage(new a({rql:e.rql}))}),e.map("/pressWorksheets;add",h,function(){s.showPage(new n({model:new t}))}),e.map("/pressWorksheets/:id",d,function(e){s.showPage(new i({model:new t({_id:e.params.id})}))}),e.map("/pressWorksheets/:id;edit",h,function(e){s.showPage(new p({model:new t({_id:e.params.id})}))}),e.map("/pressWorksheets/:id;delete",h,o.bind(null,t))});