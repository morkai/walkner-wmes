define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed">\n  <thead>\n  <tr>\n    <th colspan="999">'),__append(t("reports","9:lines:header")),__append("\n  </tr>\n  <tr>\n    "),_.forEach(lines,function(n){__append("\n    <th>"),__append(n.name.replace(/\n/g,"<br>")),__append("\n    ")}),__append("\n    <th><br>&nbsp;\n  </tr>\n  </thead>\n  <tbody>\n  "),_.forEach(cags,function(n,e){__append('\n  <tr data-index="'),__append(e),__append('" class="'),__append(n.group.contrast?"is-contrast":"is-not-contrast"),__append('" style="background: '),__append(n.group.color),__append('">\n    '),_.forEach(lines,function(_){__append("\n    <td>"),__append(_.cags[n._id]||"&nbsp;"),__append("</td>\n    ")}),__append("\n    <td>&nbsp;</td>\n  </tr>\n  ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});