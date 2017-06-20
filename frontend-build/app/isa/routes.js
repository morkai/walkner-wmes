// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","../users/UserCollection","./IsaShiftPersonnel","./IsaRequestCollection","./IsaEventCollection","./pages/IsaLineStatePage","i18n!app/nls/isa"],function(e,n,s,l,t,a,i,r){"use strict";e.map("/isa",s.auth("LOCAL","ISA:VIEW"),function(e){n.showPage(new r({fullscreen:void 0!==e.query.fullscreen,model:{warehousemen:new l(null,{rqlQuery:"select(firstName,lastName,personellId)&privileges=ISA%3AWHMAN"}),shiftPersonnel:new t(null,{current:!0}),requests:a.active(),events:new i(null,{paginate:!1,rqlQuery:"sort(-time)&limit(50)"}),selectedResponder:null,moving:{}}}))}),e.map("/isa/events",s.auth("LOCAL","ISA:VIEW"),function(e){n.loadPage(["app/isa/pages/IsaEventListPage"],function(n){return new n({collection:new i(null,{rqlQuery:e.rql})})})}),e.map("/isa/requests",s.auth("LOCAL","ISA:VIEW"),function(e){n.loadPage(["app/isa/IsaRequestCollection","app/isa/pages/IsaRequestListPage"],function(n,s){return new s({collection:new n(null,{rqlQuery:e.rql})})})})});