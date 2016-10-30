define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default orders-operations">\n  <div class="panel-heading">'),__append(t("orders","PANEL:TITLE:operations")),__append("</div>\n  "),operations.length?(__append('\n  <table class="table table-condensed table-hover table-bordered">\n    <thead>\n      <tr>\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.no")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.workCenter")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.name")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.qty")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.machineSetupTime")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.laborSetupTime")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.machineTime")),__append('\n        <th class="is-min">'),__append(t("orders","PROPERTY:operations.laborTime")),__append("\n        <th>\n      </tr>\n    </thead>\n    <tbody>\n      "),operations.forEach(function(e){__append('\n      <tr class="'),__append(e.no===highlighted?"info":""),__append('">\n        <td class="is-min is-number">'),__append(escape(e.no||"-")),__append('\n        <td class="is-min">'),__append(escape(e.workCenter||"-")),__append('\n        <td class="is-min">'),__append(escape(e.name||"-")),__append('\n        <td class="is-min is-number">'),__append(escape(e.qtyUnit||"-")),__append('\n        <td class="is-min is-number" title="'),__append(e.sapMachineSetupTime||""),__append('">'),__append(escape(e.machineSetupTime||"-")),__append('\n        <td class="is-min is-number" title="'),__append(e.sapLaborSetupTime||""),__append('">'),__append(escape(e.laborSetupTime||"-")),__append('\n        <td class="is-min is-number" title="'),__append(e.sapMachineTime||""),__append('">'),__append(escape(e.machineTime||"-")),__append('\n        <td class="is-min is-number" title="'),__append(e.sapLaborTime||""),__append('">'),__append(escape(e.laborTime||"-")),__append("\n        <td>\n      </tr>\n      ")}),__append("\n    </tbody>\n  </table>\n  ")):(__append('\n  <div class="panel-body">\n    '),__append(t("orders","OPERATIONS:NO_DATA")),__append("\n  </div>\n  ")),__append("\n</div>\n");return __output.join("")}});