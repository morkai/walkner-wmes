define(["require","underscore","app/i18n","app/core/Model"],function(t,e,i,o){"use strict";return o.extend({urlRoot:"/osh/stations",clientUrlRoot:"#osh/stations",topicPrefix:"osh.stations",privilegePrefix:"OSH:DICTIONARIES",nlsDomain:"wmes-osh-stations",labelAttribute:"shortName",defaults:function(){return{active:!0}},getLabel:function({long:i,link:o,path:n}={}){let s=this.get(i?"longName":"shortName");if(o&&(s=`<a href="${this.genClientUrl()}">${e.escape(s)}</a>`),n&&this.get("location")){s=`${t("app/wmes-osh-common/dictionaries").getLabel("location",this.get("location"),{long:i,link:o,path:n})} \\ ${s}`}return s},serialize:function(){const t=this.toJSON();return t.active=i("core",`BOOL:${t.active}`),t},serializeRow:function(){const e=t("app/wmes-osh-common/dictionaries"),i=this.serialize();return i.location=e.locations.getLabel(i.location),i},serializeDetails:function(){const e=t("app/wmes-osh-common/dictionaries"),i=this.serialize();return i.location=e.locations.getLabel(i.location,{long:!0,link:!0}),i},hasLocation:function(t){if(!(t=parseInt(t,10)))return!1;const e=this.get("location");return!e||e===t}})});