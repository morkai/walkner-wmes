define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="well">\n  <dl>\n    '),lodash.each(data,function(e,t){buf.push("\n    <dt>",escape(t),"\n    "),lodash.isArray(e)?(buf.push("\n    "),lodash.each(e,function(e){buf.push("\n    <dd>",e,"\n    ")}),buf.push("\n    ")):buf.push("\n    <dd>",escape(e),"\n    "),buf.push("\n    ")}),buf.push("\n  </dl>\n</div>\n")}();return buf.join("")}});