define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})lines.length>1&&(__append('\n<li><a role="printLines" data-line="__ALL__" href="javascript:void(0)">'),__append(escapeFn(t("planning","toolbar:printPlan:all"))),__append("</a></li>\n")),__append("\n"),lines.forEach(function(n){__append('\n<li><a role="printLines" data-line="'),__append(escapeFn(n)),__append('" href="javascript:void(0)">'),__append(escapeFn(n)),__append("</a></li>\n")}),__append('\n<li class="divider"></li>\n<li>\n  <a id="'),__append(idPrefix),__append('-showTimes" class="planning-mrp-toolbar-showTimes" href="javascript:void(0)">\n    <span>'),__append(t("planning","toolbar:showTimes")),__append('</span><span class="fa fa-check"></span>\n  </a>\n</li>\n');return __output.join("")}});