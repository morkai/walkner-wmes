define(["app/i18n","app/core/Model"],function(e,t){"use strict";return t.extend({urlRoot:"/osh/reasonCategories",clientUrlRoot:"#osh/reasonCategories",topicPrefix:"osh.reasonCategories",privilegePrefix:"OSH:DICTIONARIES",nlsDomain:"wmes-osh-reasonCategories",labelAttribute:"shortName",defaults:{active:!0},getLabel:function({long:e}={}){return this.get(e?"longName":"shortName")},serialize:function(){var t=this.toJSON();return t.active=e("core","BOOL:"+t.active),t}})});