define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})lines.forEach(function(n){__append('\n<li data-line><a data-print-line="'),__append(escape(n)),__append('" href="javascript:void(0)">'),__append(escape(n)),__append("</a>\n")}),__append("\n");return __output.join("")}});