define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">\n      '),__append(t("prodShiftOrders","PANEL:TITLE:details")),__append('\n    </div>\n    <div class="panel-details row">\n      <div class="col-md-4">\n        <div class="props first">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:order")),__append('</div>\n            <div class="prop-value">\n              '),model.orderUrl?(__append('\n              <a href="'),__append(model.orderUrl),__append('">'),__append(model.order),__append("</a>\n              ")):(__append("\n              "),__append(model.order),__append("\n              ")),__append('\n            </div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:operation")),__append('</div>\n            <div class="prop-value">'),__append(model.operation),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:quantityDoneSap")),__append('</div>\n            <div class="prop-value">'),__append(model.quantityDone),__append(" / "),__append(model.orderData.qty||"?"),__append(" ["),__append(model.orderData.unit||"?"),__append(']</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:workerCountSap")),__append('</div>\n            <div class="prop-value">'),__append(model.workerCount),__append(" / "),__append(model.workerCountSap),__append(" ["),__append(t("prodShiftOrders","unit:workerCount")),__append(']</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:taktTime")),__append('</div>\n            <div class="prop-value">'),__append(model.taktTime),__append(" / "),__append(model.taktTimeSap),__append(" ["),__append(t("prodShiftOrders","unit:taktTime")),__append(']</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:efficiency")),__append('</div>\n            <div class="prop-value">'),__append(model.efficiency),__append('</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-4">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:pressWorksheet")),__append('</div>\n            <div class="prop-value">\n              '),model.pressWorksheet?(__append("\n              "),user.isAllowedTo("PRESS_WORKSHEETS:VIEW")?(__append('\n              <a href="#pressWorksheets/'),__append(model.pressWorksheet),__append('">'),__append(t("core","BOOL:true")),__append("</a>\n              ")):(__append("\n              "),__append(t("core","BOOL:true")),__append("\n              ")),__append("\n              ")):__append("\n              -\n              "),__append('\n            </div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:prodShift")),__append('</div>\n            <div class="prop-value">'),__append(model.prodShift),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:startedAt")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.startedAt)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:finishedAt")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.finishedAt||"-")),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:duration")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.duration)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:creator")),__append('</div>\n            <div class="prop-value">'),__append(model.creator),__append('</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-4">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("core","ORG_UNIT:division")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.division)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("core","ORG_UNIT:subdivision")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.subdivision)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("core","ORG_UNIT:mrpController")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.mrpControllers)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("core","ORG_UNIT:prodFlow")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.prodFlow)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("core","ORG_UNIT:workCenter")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.workCenter)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("prodShiftOrders","PROPERTY:prodLine")),__append('</div>\n            <div class="prop-value">'),__append(escape(model.prodLine)),__append("</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.losses&&model.losses.length&&(__append('\n  <div class="panel panel-warning">\n    <div class="panel-heading">\n      '),__append(t("prodShiftOrders","PANEL:TITLE:losses")),__append('\n    </div>\n    <table class="table table-bordered table-condensed table-hover">\n      <thead>\n        <tr>\n          <th>Powód</th>\n          <th>Ilość [sztuki]</th>\n        </tr>\n      </thead>\n      <tbody>\n        '),model.losses.forEach(function(p){__append("\n        <tr>\n          <td>"),__append(escape(p.label)),__append("</td>\n          <td>"),__append(escape(p.count)),__append("</td>\n        </tr>\n        ")}),__append("\n      </tbody>\n    </table>\n  </div>\n  ")),__append("\n</div>\n");return __output.join("")}});