// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../time","../core/Model","../xiconf/util/serializeXiconfLicenseFeatures","../icpo/util/serializeIcpoLicenseFeatures"],function(e,i,t,r,s){"use strict";var a={"walkner-xiconf":r,"walkner-icpo":s};return t.extend({urlRoot:"/licenses",clientUrlRoot:"#licenses",topicPrefix:"licenses",privilegePrefix:"LICENSES",nlsDomain:"licenses",serialize:function(){var t=this.toJSON();return t.appName=e("licenses","app:"+t.appId),t.date=i.format(t.date,"YYYY-MM-DD"),t.expireDate=t.expireDate?i.format(t.expireDate,"YYYY-MM-DD"):"-",t.features=this.serializeFeatures(),t},serializeFeatures:function(){var e=a[this.get("appId")],i=this.get("features");return e?e(i):i?i.toString():"-"}})});