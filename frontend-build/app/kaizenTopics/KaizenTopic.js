define(["app/i18n","app/core/Model"],function(e,i){"use strict";return i.extend({urlRoot:"/kaizen/topics",clientUrlRoot:"#kaizenTopics",topicPrefix:"kaizen.topics",privilegePrefix:"KAIZEN:DICTIONARIES",nlsDomain:"kaizenTopics",labelAttribute:"shortName",serialize:function(){var i=this.toJSON();return i.active=e("core","BOOL:"+i.active),i},getLabel:function(e){return this.get(e&&!1===e.short?"fullName":"shortName")}})});