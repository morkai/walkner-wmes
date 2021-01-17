define(["require","app/i18n","app/user","app/time","app/wmes-osh-common/Entry"],function(t,e,i,n,o){"use strict";const s=o.extend({urlRoot:"/osh/observations",clientUrlRoot:"#osh/observations",topicPrefix:"osh.observations",privilegePrefix:"OSH:OBSERVATIONS",nlsDomain:"wmes-osh-observations",getModelType:function(){return"observation"},serialize:function(){const t=o.prototype.serialize.apply(this,arguments);return t.company||(t.company=t.companyName),t},serializeRow:function(){const t=o.prototype.serializeRow.apply(this,arguments);return t.date=n.utc.format(t.date,"L, H"),t},serializeDetails:function(){const t=o.prototype.serializeDetails.apply(this,arguments);return t.date=n.utc.format(t.date,e(this.nlsDomain,"details:date:format")),t}},{RID_PREFIX:"O",TIME_PROPS:["createdAt","finishedAt"],USER_PROPS:["creator","coordinators"],DICT_PROPS:["company","observationKind","division","workplace","department","building","location","station"],DESC_PROPS:["observationKind"],isResolvableObservation:function(t,e){return t.startsWith("b")?!1===e.safe&&!1===e.easy:!!t.startsWith("w")&&!1===e.safe}});return s.can=Object.assign({},s.can,{manage:function(){return i.isAllowedTo("OSH:OBSERVATIONS:MANAGE")},add:function(){return(this.can||this).manage()||i.isAllowedTo("OSH:OBSERVER")},edit:function(t){return!!(this.can||this).manage()||(!!t.isCoordinator()||!!t.isCreator()&&("inProgress"===t.get("status")||Date.now()-Date.parse(t.get("createdAt"))<36e5))},assign:function(){return i.isLoggedIn()},assignFinished:function(t){return!!(this.can||this).manage()||!!t.isCoordinator()}}),s});