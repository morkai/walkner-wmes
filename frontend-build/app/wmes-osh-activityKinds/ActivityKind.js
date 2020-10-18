define(["require","underscore","app/i18n","app/core/Model"],function(i,e,t,n){"use strict";return n.extend({urlRoot:"/osh/activityKinds",clientUrlRoot:"#osh/activityKinds",topicPrefix:"osh.activityKinds",privilegePrefix:"OSH:DICTIONARIES",nlsDomain:"wmes-osh-activityKinds",labelAttribute:"shortName",defaults:function(){return{active:!0,materialLoss:!1,kinds:[]}},getLabel:function({long:i,link:t}={}){let n=this.get(i?"longName":"shortName");return t&&(n=`<a href="${this.genClientUrl()}">${e.escape(n)}</a>`),n},serialize:function(){const i=this.toJSON();return i.active=t("core",`BOOL:${i.active}`),i.materialLoss=t("core",`BOOL:${i.materialLoss}`),i},serializeRow:function(){const e=i("app/wmes-osh-common/dictionaries"),t=this.serialize();return t.kinds=e.kinds.getLabels(t.kinds).join("; "),t},serializeDetails:function(){const e=i("app/wmes-osh-common/dictionaries"),t=this.serialize();return t.kinds=e.kinds.getLabels(t.kinds,{long:!0,link:!0}),t},hasKind:function(i){if(!(i=parseInt(i,10)))return!1;const e=this.get("kinds");return 0===e.length||e.includes(i)}})});