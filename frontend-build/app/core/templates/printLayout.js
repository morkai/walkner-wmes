define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="printLayout">\n  <div class="print-pages">\n    <div class="print-page">\n      <div class="print-page-hd">\n        <p class="print-page-hd-right"></p>\n        <p class="print-page-hd-left"></p>\n      </div>\n      <div class="print-page-bd"></div>\n      <div class="print-page-ft">\n        <p class="print-page-ft-right">'),__append(t("core","PRINT_PAGE:FT:PAGE_NO")),__append('</p>\n        <p class="print-page-ft-left">'),__append(t("core","PRINT_PAGE:FT:INFO")),__append("</p>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});