define(["require","app/i18n","app/core/Model"],function(i,e,t){"use strict";return t.extend({urlRoot:"/osh/buildings",clientUrlRoot:"#osh/buildings",topicPrefix:"osh.buildings",privilegePrefix:"OSH:DICTIONARIES",nlsDomain:"wmes-osh-buildings",labelAttribute:"shortName",defaults:function(){return{active:!0,divisions:[]}},getLabel:function({long:i}={}){return this.get(i?"longName":"shortName")},serialize:function(){var t=i("app/wmes-osh-common/dictionaries"),n=this.toJSON();return n.active=e("core","BOOL:"+n.active),n.divisions=n.divisions.map(i=>t.getLabel("division",i,{path:!0,long:!0})),n}})});