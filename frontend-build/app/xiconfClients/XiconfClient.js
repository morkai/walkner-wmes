// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../i18n","../core/Model","../xiconf/util/serializeXiconfLicenseFeatures","../licenses/util/compareVersions"],function(e,s,n,i,r,c){"use strict";return i.extend({urlRoot:"/xiconf/clients",clientUrlRoot:"#xiconf/clients",privilegePrefix:"XICONF",nlsDomain:"xiconfClients",serialize:function(i){var o=this.toJSON();o.className=o.connectedAt?"success":"danger",o.lastSeenAt=s.format(o.connectedAt||o.disconnectedAt,"YY-MM-DD, HH:mm:ss"),o.orderLink=o.order?'<a href="#xiconf/orders/'+o.order+'">'+o.order+"</a>":"-",e.isObject(o.license)?(o.features=r(o.license.features),o.license=o.license._id):o.features=null,o.license||(o.license="00000000-0000-0000-0000-000000000000"),!o.licenseError&&/^0000.+0000$/.test(o.license)&&(o.licenseError="NO_KEY");var l="licenses-id",t=o.license;return o.licenseError&&(l+=" licenses-invalid",t+="\r\n"+n("licenses","error:"+o.licenseError)),o.shortLicense='<span class="'+l+'" title="'+t+'">'+o.license.substr(0,4)+"..."+o.license.substr(-4)+"</span>",o.appVersionCmp=c(o.appVersion,i.appVersion),i&&i.appVersion&&o.appVersion&&-1===o.appVersionCmp&&(o.appVersion='<span class="licenses-version licenses-invalid" title="&lt; '+i.appVersion+'">'+o.appVersion+"</span>"),o.coreScannerDriver='<i class="fa '+(o.coreScannerDriver?"fa-thumbs-o-up":"fa-thumbs-down")+'" title="'+n("xiconfClients","coreScannerDriver:"+!!o.coreScannerDriver)+'"></i>',o}})});