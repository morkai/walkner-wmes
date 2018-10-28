define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel panel-primary pressWorksheets-details">\n    <div class="panel-heading">\n      '),__append(t("pressWorksheets","PANEL:TITLE:details")),__append('\n    </div>\n    <div class="panel-details row">\n      <div class="col-md-6">\n        <div class="props first">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:type")),__append('</div>\n            <div class="prop-value">'),__append(model.type),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:date")),__append('</div>\n            <div class="prop-value">'),__append(model.date),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:shift")),__append('</div>\n            <div class="prop-value">'),__append(model.shift),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:master")),__append('</div>\n            <div class="prop-value">'),__append(escapeFn(model.master||"-")),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:operator")),__append('</div>\n            <div class="prop-value">'),__append(escapeFn(model.operator||"-")),__append('</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-6">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:createdAt")),__append('</div>\n            <div class="prop-value">'),__append(escapeFn(model.createdAt||"-")),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:creator")),__append('</div>\n            <div class="prop-value">'),__append(escapeFn(model.creator||"-")),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("pressWorksheets","PROPERTY:operators")),__append('</div>\n            <div class="prop-value">\n              '),model.operators.length?(__append("\n              <ol>\n                "),model.operators.forEach(function(e){__append("\n                <li>"),__append(escapeFn(e)),__append("</li>\n                ")}),__append("\n              </ol>\n              ")):__append("\n              -\n              "),__append('\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default pressWorksheets-details-orders">\n    <div class="panel-heading">\n      '),__append(t("pressWorksheets","PANEL:TITLE:details:orders")),__append("\n    </div>\n    "),__append(renderOrdersList({worksheet:model,losses:model.losses,orders:model.orders,extended:extended})),__append("\n  </div>\n</div>\n");return __output.join("")}});