define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<h1>v0.84.2</h1>\n<h2>"),__append(time.format("2016-03-31","LL")),__append("</h2>\n<h3>Dokumentacja</h3>\n<ul>\n  <li>Poprawiono błąd uniemozliwiający załadowanie dokumentów BOM oraz ETO.</li>\n</ul>\n");return __output.join("")}});