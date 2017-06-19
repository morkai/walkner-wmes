// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(a,r,e,o,s){"use strict";var i="i18n!app/nls/behaviorObsCards",d=o.auth();r.map("/behaviorObsCardCountReport",d,function(a){e.loadPage(["app/behaviorObsCards/BehaviorObsCardCountReport","app/behaviorObsCards/pages/BehaviorObsCardCountReportPage","i18n!app/nls/reports",i],function(r,e){return new e({model:r.fromQuery(a.query)})})}),r.map("/behaviorObsCards",d,function(a){e.loadPage(["app/behaviorObsCards/BehaviorObsCardCollection","app/behaviorObsCards/pages/BehaviorObsCardListPage",i],function(r,e){return new e({collection:new r(null,{rqlQuery:a.rql})})})}),r.map("/behaviorObsCards/:id",d,function(a){e.loadPage(["app/behaviorObsCards/BehaviorObsCard","app/behaviorObsCards/pages/BehaviorObsCardDetailsPage",i],function(r,e){return new e({model:new r({_id:a.params.id})})})}),r.map("/behaviorObsCards;add",d,function(){e.loadPage(["app/behaviorObsCards/BehaviorObsCard","app/behaviorObsCards/pages/BehaviorObsCardAddFormPage",i],function(a,r){return new r({model:new a({observer:o.getInfo()})})})}),r.map("/behaviorObsCards/:id;edit",d,function(a){e.loadPage(["app/behaviorObsCards/BehaviorObsCard","app/behaviorObsCards/pages/BehaviorObsCardEditFormPage",i],function(r,e){return new e({model:new r({_id:a.params.id})})})}),r.map("/behaviorObsCards/:id;delete",d,a.partial(s,"app/behaviorObsCards/BehaviorObsCard",a,a,{baseBreadcrumb:!0}))});