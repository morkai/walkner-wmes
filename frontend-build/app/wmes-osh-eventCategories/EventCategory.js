define(["app/i18n","app/core/Model"],function(e,t){"use strict";return t.extend({urlRoot:"/osh/eventCategories",clientUrlRoot:"#osh/eventCategories",topicPrefix:"osh.eventCategories",privilegePrefix:"OSH:DICTIONARIES",nlsDomain:"wmes-osh-eventCategories",labelAttribute:"shortName",defaults:{active:!0},getLabel:function({long:e}={}){return this.get(e?"longName":"shortName")},serialize:function(){var t=this.toJSON();return t.active=e("core","BOOL:"+t.active),t}})});