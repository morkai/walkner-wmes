define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<ul class="dropdown-menu planning-menu" style="top: '),__append(top),__append('px; left: -1000px">\n  '),menu.forEach(function(n,p){__append("\n  "),"header"===n.type?(__append('\n  <li class="dropdown-header">'),__append(n.label),__append("</li>\n  ")):"divider"===n.type?__append('\n  <li class="divider"></li>\n  '):(__append('\n  <li>\n    <a data-action="'),__append(p),__append('" class="'),__append(n.disabled?"planning-menu-disabled":""),__append('">\n      '),icons?(__append('\n      <i class="fa '),__append(n.icon||"fa-blank"),__append('"></i><span>'),__append(n.label),__append("</span>\n      ")):(__append("\n      "),__append(n.label),__append("\n      ")),__append("\n    </a>\n  </li>\n  ")),__append("\n  ")}),__append("\n</ul>\n");return __output.join("")}});