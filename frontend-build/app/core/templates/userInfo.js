define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<span class="userInfo">\n  '),userInfo?(buf.push("\n  ",escape(userInfo.label),"\n  "),(userInfo.cname||userInfo.ip)&&buf.push("\n  (",escape(userInfo.cname||userInfo.ip),")\n  "),buf.push("\n  ")):buf.push("\n  -\n  "),buf.push("\n</span>\n")}();return buf.join("")}});