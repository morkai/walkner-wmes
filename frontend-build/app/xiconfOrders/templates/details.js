define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel '),__append(programPanelClassName),__append(' xiconfOrders-orderDetails">\n    <div class="panel-heading">\n      '),__append(t("xiconfOrders","PANEL:TITLE:details:order")),__append('\n    </div>\n    <div class="panel-details row">\n      <div class="col-md-4">\n        <div class="props first">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:orderNo")),__append('</div>\n            <div class="prop-value">\n              <a href="'),__append(linkToResults(model._id)),__append('" title="'),__append(t("xiconfOrders","details:showResultsLink")),__append('">'),__append(model._id),__append('</a>\n            </div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:nc12")),__append('</div>\n            <div class="prop-value">\n              <a href="'),__append(linkToResults(null,model.nc12[0])),__append('" title="'),__append(t("xiconfOrders","details:showResultsLink")),__append('">'),__append(model.nc12[0]),__append('</a>\n            </div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:name")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.name||"-")),__append('</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-4">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:quantityTodo")),__append('</div>\n            <div class="prop-value">'),__append((model.quantityTodo||0).toLocaleString()),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:quantityDone")),__append('</div>\n            <div class="prop-value">'),__append((model.quantityDone||0).toLocaleString()),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:serviceTagCounter")),__append('</div>\n            <div class="prop-value">'),__append(model.serviceTagCounter.toLocaleString()),__append('</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-4">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:startedAt")),__append('</div>\n            <div class="prop-value">'),__append(model.startedAt?time.format(model.startedAt,"LLLL"):"-"),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:finishedAt")),__append('</div>\n            <div class="prop-value">'),__append(model.finishedAt?time.format(model.finishedAt,"LLLL"):"-"),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:duration")),__append('</div>\n            <div class="prop-value">'),__append(model.startedAt?time.toString(((Date.parse(model.finishedAt)||Date.now())-Date.parse(model.startedAt))/1e3):"-"),__append('</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="xiconfOrders-itemDetailsContainer">\n    '),model.items.forEach(function(n){__append('\n    <div class="panel panel-'),__append(n.panelType),__append(' xiconfOrders-itemDetails">\n      <div class="panel-heading"></div>\n      <div class="panel-details">\n        <div class="props first">\n          '),"ft"!==n.kind&&n.nc12&&(__append('\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","kind:nc12:"+n.kind)),__append('</div>\n            <div class="prop-value">\n              <a href="'),__append(linkToResults(model._id,n.nc12,n.kind)),__append('" title="'),__append(t("xiconfOrders","details:showResultsLink")),__append('">'),__append(n.nc12),__append("</a>\n            </div>\n          </div>\n          ")),__append('\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:name")),__append('</div>\n            <div class="prop-value">\n              '),"test"===n.kind?(__append('\n              <a href="#xiconf/programs/'),__append(n.nc12),__append('">'),__append(escape(n.name)),__append("</a>\n              ")):"ft"===n.kind?(__append('\n              <a href="'),__append(linkToResults(model._id,n.nc12,n.kind)),__append('" title="'),__append(t("xiconfOrders","details:showResultsLink")),__append('">'),__append(t("xiconfOrders","kind:name:ft")),__append("</a>\n              ")):(__append("\n              "),__append(escape(n.name)),__append("\n              ")),__append('\n            </div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("xiconfOrders","PROPERTY:quantity")),__append('</div>\n            <div class="prop-value">\n              '),"gprs"===n.kind?(__append("\n              "),__append(n.quantityTodo.toLocaleString()),__append("\n              ")):(__append("\n              "),__append(n.totalQuantityDone.toLocaleString()),__append("/"),__append(n.quantityTodo.toLocaleString()),__append(" "),__append(t("xiconfOrders","kind:unit:"+n.kind)),__append("\n              ")),__append("\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n    ")}),__append("\n  </div>\n</div>\n");return __output.join("")}});