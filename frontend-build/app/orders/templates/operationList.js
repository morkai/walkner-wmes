define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default orders-operations">\n  <div class="panel-heading">'),__append(t("orders","PANEL:TITLE:operations")),__append("</div>\n  "),operations.length?(__append('\n  <table class="table table-condensed table-hover table-bordered">\n    <thead>\n      <tr>\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.no")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.workCenter")),__append("\n        <th>"),__append(t("orders","PROPERTY:operations.name")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.qty")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.machineSetupTime")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.laborSetupTime")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.machineTime")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.laborTime")),__append("\n      </tr>\n    </thead>\n    <tbody>\n      "),operations.forEach(function(n){__append('\n      <tr class="'),__append(n.no===highlighted?"info":""),__append('">\n        <td class="is-min is-number">'),__append(escape(n.no||"-")),__append('\n        <td class="is-min">'),__append(escape(n.workCenter||"-")),__append("\n        <td>"),__append(escape(n.name||"-")),__append('\n        <td class="is-min is-number">'),__append(escape(n.qtyUnit||"-")),__append('\n        <td class="is-min is-number">'),__append(escape(n.machineSetupTime||"-")),__append('\n        <td class="is-min is-number">'),__append(escape(n.laborSetupTime||"-")),__append('\n        <td class="is-min is-number">'),__append(escape(n.machineTime||"-")),__append('\n        <td class="is-min is-number">'),__append(escape(n.laborTime||"-")),__append("\n      </tr>\n      ")}),__append("\n    </tbody>\n  </table>\n  ")):(__append('\n  <div class="panel-body">\n    '),__append(t("orders","OPERATIONS:NO_DATA")),__append("\n  </div>\n  ")),__append("\n</div>\n");return __output.join("")}});