define(["require","app/i18n","app/core/Model"],function(e,i,o){"use strict";return o.extend({urlRoot:"/osh/observationKinds",clientUrlRoot:"#osh/observationKinds",topicPrefix:"osh.observationKinds",privilegePrefix:"OSH:DICTIONARIES",nlsDomain:"wmes-osh-observationKinds",labelAttribute:"shortName",defaults:{active:!0,position:0},getLabel:function({long:e}={}){return this.get(e?"longName":"shortName")},serialize:function(){const e=this.toJSON();return e.active=i("core",`BOOL:${e.active}`),e},serializeDetails:function(){const i=e("app/wmes-osh-common/dictionaries"),o="observationCategory",t=this.serialize();return t.behaviors=t.behaviors.map(e=>({label:i.getLabel(o,e,{long:!0}),description:i.getDescription(o,e)})),t.workConditions=t.workConditions.map(e=>({label:i.getLabel(o,e,{long:!0}),description:i.getDescription(o,e)})),t}})});