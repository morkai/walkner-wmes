/*
 * Copyright (c) 2006, 2012, Oracle and/or its affiliates. All rights reserved.
 * ORACLE PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   - Neither the name of Oracle nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var deployJava=function(){function e(e){var t=document.createElement("div");t.innerHTML=e,document.body.appendChild(t.children[0])}function t(e){c.debug&&(console.log||alert(e))}function n(e,t){if(null==e||0==e.length)return!0;var n=e.charAt(e.length-1);if("+"!=n&&"*"!=n&&-1!=e.indexOf("_")&&"_"!=n&&(e+="*",n="*"),e=e.substring(0,e.length-1),e.length>0){var i=e.charAt(e.length-1);("."==i||"_"==i)&&(e=e.substring(0,e.length-1))}return"*"==n?0==t.indexOf(e):"+"==n?t>=e:!1}function i(){var e="//java.com/js/webstart.png";try{return-1!=document.location.protocol.indexOf("http")?e:"http:"+e}catch(t){return"http:"+e}}function r(e){var t="http://java.com/dt-redirect";return null==e||0==e.length?t:("&"==e.charAt(0)&&(e=e.substring(1,e.length)),t+"?"+e)}function a(e,t){for(var n=e.length,i=0;n>i;i++)if(e[i]===t)return!0;return!1}function l(e){return a(h,e.toLowerCase())}function o(e){return"MSIE"!=deployJava.browserName?!0:deployJava.compareVersionToPattern(deployJava.getPlugin().version,["10","0","0"],!1,!0)?!0:null==e?!1:!n("1.6.0_33+",e)}var u={core:["id","class","title","style"],i18n:["lang","dir"],events:["onclick","ondblclick","onmousedown","onmouseup","onmouseover","onmousemove","onmouseout","onkeypress","onkeydown","onkeyup"],applet:["codebase","code","name","archive","object","width","height","alt","align","hspace","vspace"],object:["classid","codebase","codetype","data","type","archive","declare","standby","height","width","usemap","name","tabindex","align","border","hspace","vspace"]},h=(u.object.concat(u.core,u.i18n,u.events),u.applet.concat(u.core)),c={debug:null,version:"20120801",firefoxJavaVersion:null,myInterval:null,preInstallJREList:null,returnPage:null,brand:null,locale:null,installType:null,EAInstallEnabled:!1,EarlyAccessURL:null,oldMimeType:"application/npruntime-scriptable-plugin;DeploymentToolkit",mimeType:"application/java-deployment-toolkit",launchButtonPNG:i(),browserName:null,browserName2:null,getJREs:function(){var e=new Array;if(this.isPluginInstalled())for(var n=this.getPlugin(),i=n.jvms,r=0;r<i.getLength();r++)e[r]=i.get(r).version;else{var a=this.getBrowser();"MSIE"==a?this.testUsingActiveX("1.7.0")?e[0]="1.7.0":this.testUsingActiveX("1.6.0")?e[0]="1.6.0":this.testUsingActiveX("1.5.0")?e[0]="1.5.0":this.testUsingActiveX("1.4.2")?e[0]="1.4.2":this.testForMSVM()&&(e[0]="1.1"):"Netscape Family"==a&&(this.getJPIVersionUsingMimeType(),null!=this.firefoxJavaVersion?e[0]=this.firefoxJavaVersion:this.testUsingMimeTypes("1.7")?e[0]="1.7.0":this.testUsingMimeTypes("1.6")?e[0]="1.6.0":this.testUsingMimeTypes("1.5")?e[0]="1.5.0":this.testUsingMimeTypes("1.4.2")?e[0]="1.4.2":"Safari"==this.browserName2&&(this.testUsingPluginsArray("1.7.0")?e[0]="1.7.0":this.testUsingPluginsArray("1.6")?e[0]="1.6.0":this.testUsingPluginsArray("1.5")?e[0]="1.5.0":this.testUsingPluginsArray("1.4.2")&&(e[0]="1.4.2")))}if(this.debug)for(var r=0;r<e.length;++r)t("[getJREs()] We claim to have detected Java SE "+e[r]);return e},installJRE:function(e,t){if(this.isPluginInstalled()&&this.isAutoInstallEnabled(e)){var n=!1;return n=this.isCallbackSupported()?this.getPlugin().installJRE(e,t):this.getPlugin().installJRE(e),n&&(this.refresh(),null!=this.returnPage&&(document.location=this.returnPage)),n}return this.installLatestJRE()},isAutoInstallEnabled:function(e){return this.isPluginInstalled()?("undefined"==typeof e&&(e=null),o(e)):!1},isCallbackSupported:function(){return this.isPluginInstalled()&&this.compareVersionToPattern(this.getPlugin().version,["10","2","0"],!1,!0)},installLatestJRE:function(e){if(this.isPluginInstalled()&&this.isAutoInstallEnabled()){var t=!1;return t=this.isCallbackSupported()?this.getPlugin().installLatestJRE(e):this.getPlugin().installLatestJRE(),t&&(this.refresh(),null!=this.returnPage&&(document.location=this.returnPage)),t}var n=this.getBrowser(),i=navigator.platform.toLowerCase();return"true"==this.EAInstallEnabled&&-1!=i.indexOf("win")&&null!=this.EarlyAccessURL?(this.preInstallJREList=this.getJREs(),null!=this.returnPage&&(this.myInterval=setInterval("deployJava.poll()",3e3)),location.href=this.EarlyAccessURL,!1):"MSIE"==n?this.IEInstall():"Netscape Family"==n&&-1!=i.indexOf("win32")?this.FFInstall():(location.href=r((null!=this.returnPage?"&returnPage="+this.returnPage:"")+(null!=this.locale?"&locale="+this.locale:"")+(null!=this.brand?"&brand="+this.brand:"")),!1)},runApplet:function(e,n,i){("undefined"==i||null==i)&&(i="1.1");var r="^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$",a=i.match(r);if(null==this.returnPage&&(this.returnPage=document.location),null!=a){var s=this.getBrowser();"?"!=s?this.versionCheck(i+"+")?this.writeAppletTag(e,n):this.installJRE(i+"+")&&(this.refresh(),location.href=document.location,this.writeAppletTag(e,n)):this.writeAppletTag(e,n)}else t("[runApplet()] Invalid minimumVersion argument to runApplet():"+i)},writeAppletTag:function(t,n){var i="<applet ",r="",a="</applet>",s=!0;(null==n||"object"!=typeof n)&&(n=new Object);for(var o in t)l(o)?(i+=" "+o+'="'+t[o]+'"',"code"==o&&(s=!1)):n[o]=t[o];var u=!1;for(var h in n)"codebase_lookup"==h&&(u=!0),("object"==h||"java_object"==h||"java_code"==h)&&(s=!1),r+='<param name="'+h+'" value="'+n[h]+'"/>';u||(r+='<param name="codebase_lookup" value="false"/>'),s&&(i+=' code="dummy"'),i+=">",e(i+"\n"+r+"\n"+a)},versionCheck:function(e){var n=0,i="^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?(\\*|\\+)?$",r=e.match(i);if(null!=r){for(var a=!1,s=!1,l=new Array,o=1;o<r.length;++o)"string"==typeof r[o]&&""!=r[o]&&(l[n]=r[o],n++);"+"==l[l.length-1]?(s=!0,a=!1,l.length--):"*"==l[l.length-1]?(s=!1,a=!0,l.length--):l.length<4&&(s=!1,a=!0);for(var u=this.getJREs(),o=0;o<u.length;++o)if(this.compareVersionToPattern(u[o],l,a,s))return!0;return!1}var h="Invalid versionPattern passed to versionCheck: "+e;return t("[versionCheck()] "+h),alert(h),!1},isWebStartInstalled:function(e){var n=this.getBrowser();if("?"==n)return!0;("undefined"==e||null==e)&&(e="1.4.2");var i=!1,r="^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$",a=e.match(r);return null!=a?i=this.versionCheck(e+"+"):(t("[isWebStartInstaller()] Invalid minimumVersion argument to isWebStartInstalled(): "+e),i=this.versionCheck("1.4.2+")),i},getJPIVersionUsingMimeType:function(){for(var e=0;e<navigator.mimeTypes.length;++e){var t=navigator.mimeTypes[e].type,n=t.match(/^application\/x-java-applet;jpi-version=(.*)$/);if(null!=n&&(this.firefoxJavaVersion=n[1],"Opera"!=this.browserName2))break}},launchWebStartApplication:function(t){navigator.userAgent.toLowerCase();if(this.getJPIVersionUsingMimeType(),0==this.isWebStartInstalled("1.7.0")&&(0==this.installJRE("1.7.0+")||0==this.isWebStartInstalled("1.7.0")))return!1;var n=null;document.documentURI&&(n=document.documentURI),null==n&&(n=document.URL);var i,r=this.getBrowser();if("MSIE"==r?i='<object classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" width="0" height="0"><PARAM name="launchjnlp" value="'+t+'"><PARAM name="docbase" value="'+n+'"></object>':"Netscape Family"==r&&(i='<embed type="application/x-java-applet;jpi-version='+this.firefoxJavaVersion+'" width="0" height="0" launchjnlp="'+t+'"docbase="'+n+'" />'),"undefined"==document.body||null==document.body)e(i),document.location=n;else{var a=document.createElement("div");a.id="div1",a.style.position="relative",a.style.left="-10000px",a.style.margin="0px auto",a.className="dynamicDiv",a.innerHTML=i,document.body.appendChild(a)}},createWebStartLaunchButtonEx:function(t){null==this.returnPage&&(this.returnPage=t);var n="javascript:deployJava.launchWebStartApplication('"+t+"');";e('<a href="'+n+'" onMouseOver="window.status=\'\'; return true;"><img src="'+this.launchButtonPNG+'" border="0" /></a>')},createWebStartLaunchButton:function(t,n){null==this.returnPage&&(this.returnPage=t);var i="javascript:if (!deployJava.isWebStartInstalled(&quot;"+n+"&quot;)) {if (deployJava.installLatestJRE()) {if (deployJava.launch(&quot;"+t+"&quot;)) {}}} else {if (deployJava.launch(&quot;"+t+"&quot;)) {}}";e('<a href="'+i+'" onMouseOver="window.status=\'\'; return true;"><img src="'+this.launchButtonPNG+'" border="0" /></a>')},launch:function(e){return document.location=e,!0},isPluginInstalled:function(){var e=this.getPlugin();return e&&e.jvms?!0:!1},isAutoUpdateEnabled:function(){return this.isPluginInstalled()?this.getPlugin().isAutoUpdateEnabled():!1},setAutoUpdateEnabled:function(){return this.isPluginInstalled()?this.getPlugin().setAutoUpdateEnabled():!1},setInstallerType:function(e){return this.installType=e,this.isPluginInstalled()?this.getPlugin().setInstallerType(e):!1},setAdditionalPackages:function(e){return this.isPluginInstalled()?this.getPlugin().setAdditionalPackages(e):!1},setEarlyAccess:function(e){this.EAInstallEnabled=e},isPlugin2:function(){if(this.isPluginInstalled()&&this.versionCheck("1.6.0_10+"))try{return this.getPlugin().isPlugin2()}catch(e){}return!1},allowPlugin:function(){this.getBrowser();var e="Safari"!=this.browserName2&&"Opera"!=this.browserName2;return e},getPlugin:function(){this.refresh();var e=null;return this.allowPlugin()&&(e=document.getElementById("deployJavaPlugin")),e},compareVersionToPattern:function(e,t,n,i){if(void 0==e||void 0==t)return!1;var r="^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$",a=e.match(r);if(null!=a){for(var s=0,l=new Array,o=1;o<a.length;++o)"string"==typeof a[o]&&""!=a[o]&&(l[s]=a[o],s++);var u=Math.min(l.length,t.length);if(i){for(var o=0;u>o;++o){if(l[o]<t[o])return!1;if(l[o]>t[o])return!0}return!0}for(var o=0;u>o;++o)if(l[o]!=t[o])return!1;return n?!0:l.length==t.length}return!1},getBrowser:function(){if(null==this.browserName){var e=navigator.userAgent.toLowerCase();t("[getBrowser()] navigator.userAgent.toLowerCase() -> "+e),-1!=e.indexOf("msie")&&-1==e.indexOf("opera")?(this.browserName="MSIE",this.browserName2="MSIE"):-1!=e.indexOf("trident")||-1!=e.indexOf("Trident")?(this.browserName="MSIE",this.browserName2="MSIE"):-1!=e.indexOf("iphone")?(this.browserName="Netscape Family",this.browserName2="iPhone"):-1!=e.indexOf("firefox")&&-1==e.indexOf("opera")?(this.browserName="Netscape Family",this.browserName2="Firefox"):-1!=e.indexOf("chrome")?(this.browserName="Netscape Family",this.browserName2="Chrome"):-1!=e.indexOf("safari")?(this.browserName="Netscape Family",this.browserName2="Safari"):-1!=e.indexOf("mozilla")&&-1==e.indexOf("opera")?(this.browserName="Netscape Family",this.browserName2="Other"):-1!=e.indexOf("opera")?(this.browserName="Netscape Family",this.browserName2="Opera"):(this.browserName="?",this.browserName2="unknown"),t("[getBrowser()] Detected browser name:"+this.browserName+", "+this.browserName2)}return this.browserName},testUsingActiveX:function(e){var n="JavaWebStart.isInstalled."+e+".0";if("undefined"==typeof ActiveXObject||!ActiveXObject)return t("[testUsingActiveX()] Browser claims to be IE, but no ActiveXObject object?"),!1;try{return null!=new ActiveXObject(n)}catch(i){return!1}},testForMSVM:function(){var e="{08B0E5C0-4FCB-11CF-AAA5-00401C608500}";if("undefined"!=typeof oClientCaps){var t=oClientCaps.getComponentVersion(e,"ComponentID");return""==t||"5,0,5000,0"==t?!1:!0}return!1},testUsingMimeTypes:function(e){if(!navigator.mimeTypes)return t("[testUsingMimeTypes()] Browser claims to be Netscape family, but no mimeTypes[] array?"),!1;for(var n=0;n<navigator.mimeTypes.length;++n){s=navigator.mimeTypes[n].type;var i=s.match(/^application\/x-java-applet\x3Bversion=(1\.8|1\.7|1\.6|1\.5|1\.4\.2)$/);if(null!=i&&this.compareVersions(i[1],e))return!0}return!1},testUsingPluginsArray:function(e){if(!navigator.plugins||!navigator.plugins.length)return!1;for(var t=navigator.platform.toLowerCase(),n=0;n<navigator.plugins.length;++n)if(s=navigator.plugins[n].description,-1!=s.search(/^Java Switchable Plug-in (Cocoa)/)){if(this.compareVersions("1.5.0",e))return!0}else if(-1!=s.search(/^Java/)&&-1!=t.indexOf("win")&&(this.compareVersions("1.5.0",e)||this.compareVersions("1.6.0",e)))return!0;return this.compareVersions("1.5.0",e)?!0:!1},IEInstall:function(){return location.href=r((null!=this.returnPage?"&returnPage="+this.returnPage:"")+(null!=this.locale?"&locale="+this.locale:"")+(null!=this.brand?"&brand="+this.brand:"")),!1},done:function(){},FFInstall:function(){return/Chrome\/4[2-9]/.test(navigator.userAgent)?void 0:(location.href=r((null!=this.returnPage?"&returnPage="+this.returnPage:"")+(null!=this.locale?"&locale="+this.locale:"")+(null!=this.brand?"&brand="+this.brand:"")+(null!=this.installType?"&type="+this.installType:"")),!1)},compareVersions:function(e,t){for(var n=e.split("."),i=t.split("."),r=0;r<n.length;++r)n[r]=Number(n[r]);for(var r=0;r<i.length;++r)i[r]=Number(i[r]);return 2==n.length&&(n[2]=0),n[0]>i[0]?!0:n[0]<i[0]?!1:n[1]>i[1]?!0:n[1]<i[1]?!1:n[2]>i[2]?!0:n[2]<i[2]?!1:!0},enableAlerts:function(){this.browserName=null,this.debug=!0},poll:function(){this.refresh();var e=this.getJREs();0==this.preInstallJREList.length&&0!=e.length&&(clearInterval(this.myInterval),null!=this.returnPage&&(location.href=this.returnPage)),0!=this.preInstallJREList.length&&0!=e.length&&this.preInstallJREList[0]!=e[0]&&(clearInterval(this.myInterval),null!=this.returnPage&&(location.href=this.returnPage))},writePluginTag:function(){var t=this.getBrowser();"MSIE"==t?e('<object classid="clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA" id="deployJavaPlugin" width="0" height="0"></object>'):"Netscape Family"==t&&this.allowPlugin()&&this.writeEmbedTag()},refresh:function(){navigator.plugins.refresh(!1);var e=this.getBrowser();if("Netscape Family"==e&&this.allowPlugin()){var t=document.getElementById("deployJavaPlugin");null==t&&this.writeEmbedTag()}},writeEmbedTag:function(){var t=!1;if(null!=navigator.mimeTypes){for(var n=0;n<navigator.mimeTypes.length;n++)navigator.mimeTypes[n].type==this.mimeType&&navigator.mimeTypes[n].enabledPlugin&&(e('<embed id="deployJavaPlugin" type="'+this.mimeType+'" hidden="true" />'),t=!0);if(!t)for(var n=0;n<navigator.mimeTypes.length;n++)navigator.mimeTypes[n].type==this.oldMimeType&&navigator.mimeTypes[n].enabledPlugin&&e('<embed id="deployJavaPlugin" type="'+this.oldMimeType+'" hidden="true" />')}}};if(c.writePluginTag(),null==c.locale){var g=null;if(null==g)try{g=navigator.userLanguage}catch(d){}if(null==g)try{g=navigator.systemLanguage}catch(d){}if(null==g)try{g=navigator.language}catch(d){}null!=g&&(g.replace("-","_"),c.locale=g)}return c}();