define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitle),__append('</div>\n    <div class="panel-details">\n      '),__append(helpers.props(model,["active",{id:"!buildings",value:n=>n.length?`<ul><li>${n.join("<li>")}</ul>`:""},"shortName","longName"])),__append("\n    </div>\n  </div>\n</div>\n");return __output}});