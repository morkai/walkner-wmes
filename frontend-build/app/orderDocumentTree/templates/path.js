define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocumentTree-path">\n  '),searchPhrase?(__append('\n  <span class="orderDocumentTree-path-item">\n    <span class="orderDocumentTree-path-label">'),__append(t("orderDocumentTree","path:searchResults",{searchPhrase})),__append("</span>\n  </span>\n  ")):(__append('\n  <span class="orderDocumentTree-path-item" data-folder-id="null">\n    <span class="orderDocumentTree-path-dropdown">\n      <i class="fa fa-chevron-right"></i>\n      <i class="fa fa-chevron-down"></i>\n    </span>\n  </span>\n  '),path.forEach(function(e){__append('\n  <span class="orderDocumentTree-path-item" data-folder-id="'),__append(e.id),__append('">\n    <span class="orderDocumentTree-path-label">'),__append(escapeFn(e.label)),__append("</span>\n    "),e.children&&__append('\n    <span class="orderDocumentTree-path-dropdown">\n      <i class="fa fa-chevron-right"></i>\n      <i class="fa fa-chevron-down"></i>\n    </span>\n    '),__append("\n  </span>\n  ")}),__append("\n  ")),__append("\n</div>\n");return __output.join("")}});