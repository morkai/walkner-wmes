define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="isa-lineStates">\n  <p class="isa-empty">'),__append(t("isa",mode+":empty")),__append("</p>\n  "),_.forEach(lineStates,function(e,n){__append("\n  "),__append(renderLineState({hidden:!1,mode:mode,lineState:e,hotkey:n>8?"":n+1})),__append("\n  ")}),__append("\n</div>\n");return __output.join("")}});