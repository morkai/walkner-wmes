define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})tabs.forEach(function(n){__append('\n<div class="paintShop-tab '),__append(n.active?"is-active":""),__append(" "),__append(n.dropZone?"is-dropped":""),__append('" data-mrp="'),__append(n.mrp),__append('">\n  '),__append(escapeFn(n.label)),__append('\n  <i class="fa fa-level-down"></i>\n</div>\n')}),__append('\n<div class="paintShop-tab"></div>\n');return __output.join("")}});