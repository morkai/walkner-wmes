define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default reports-4-notes">\n  <div class="panel-heading is-with-actions">\n    '),__append(t("reports","operator:notes:title")),__append('\n    <div class="panel-actions">\n      '),orders.length?(__append('\n      <button id="'),__append(idPrefix),__append('-toggle" type="button" class="btn btn-default"><i class="fa fa-chevron-up"></i></button>\n      ')):(__append('\n      <button id="'),__append(idPrefix),__append('-load" type="button" class="btn btn-default" '),__append(notes?"":"disabled"),__append('>\n        <i class="fa fa-refresh"></i><span>'),__append(t("reports","operator:notes:load"+(notes?"":":noData"),{notes:notes,worksheets:worksheets})),__append("</span>\n      </button>\n      ")),__append("\n    </div>\n  </div>\n  "),notes||(__append('\n  <div class="panel-body">\n    <p>'),__append(t("reports","operator:notes:noData")),__append("</p>\n  </div>\n  ")),__append("\n  "),orders.length&&(__append('\n  <div id="'),__append(idPrefix),__append('-table">\n    '),__append(renderOrderList({extended:!0,orders:orders})),__append("\n  </div>\n  ")),__append("\n</div>\n");return __output.join("")}});