define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel-body" data-tab="hr">\n  '),__append(renderColorPicker({idPrefix:idPrefix,property:"reports.hrTotal.color",label:t("reports","settings:color:hrTotal"),value:colors.hrTotal})),__append("\n  <p>"),__append(t("reports","settings:hr:quantityDone")),__append("</p>\n  <p>"),__append(t("reports","settings:hr:directIndirect")),__append("</p>\n  <p>"),__append(t("reports","settings:hr:dirIndir")),__append("</p>\n  <p>"),__append(t("reports","settings:hr:companies")),__append("</p>\n  <p>"),__append(t("reports","settings:hr:prodFunctions")),__append("</p>\n</div>\n");return __output.join("")}});