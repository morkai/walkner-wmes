define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="qiResults-details">\n  <div class="row">\n    <div class="col-lg-4">\n      <div class="panel panel-primary">\n        <div class="panel-heading">\n          '),__append(t("qiResults","PANEL:TITLE:details:order")),__append('\n        </div>\n        <div class="panel-details">\n          <div class="props first">\n            '),["orderNo","nc12","productFamily","productName","division","qtyOrder"].forEach(function(p){__append('\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:"+p)),__append('</div>\n              <div class="prop-value">'),__append(escape(model[p])),__append("</div>\n            </div>\n            ")}),__append('\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-'),__append(model.ok?"success":"danger"),__append('">\n        <div class="panel-heading">\n          '),__append(t("qiResults","PANEL:TITLE:details:inspection")),__append('\n        </div>\n        <div class="panel-details">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:kind")),__append('</div>\n              <div class="prop-value">'),__append(escape(model.kind)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:inspectedAt")),__append('</div>\n              <div class="prop-value">'),__append(escape(model.inspectedAt)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:inspector")),__append('</div>\n              <div class="prop-value">'),__append(model.inspector),__append("</div>\n            </div>\n            "),model.ok||(__append('\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:nokOwner")),__append('</div>\n              <div class="prop-value">'),__append(model.nokOwner),__append("</div>\n            </div>\n            ")),__append('\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:qtyInspected")),__append('</div>\n              <div class="prop-value">'),__append(model.qtyInspected),__append("</div>\n            </div>\n            "),model.ok||(__append('\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:qtyNokInspected")),__append('</div>\n              <div class="prop-value">'),__append(model.qtyNokInspected),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:qtyToFix")),__append('</div>\n              <div class="prop-value">'),__append(model.qtyToFix),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:qtyNok")),__append('</div>\n              <div class="prop-value">'),__append(model.qtyNok),__append("</div>\n            </div>\n            ")),__append('\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-default">\n        <div class="panel-heading">\n          '),__append(t("qiResults","PANEL:TITLE:details:extra")),__append('\n        </div>\n        <div class="panel-details">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:createdAt")),__append('</div>\n              <div class="prop-value">'),__append(escape(model.createdAt)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:creator")),__append('</div>\n              <div class="prop-value">'),__append(model.creator),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:updatedAt")),__append('</div>\n              <div class="prop-value">'),__append(escape(model.updatedAt||"-")),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:updater")),__append('</div>\n              <div class="prop-value">'),__append(model.updater),__append("</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.ok||(__append('\n  <div class="row">\n    <div class="col-lg-4">\n      <div class="panel panel-danger">\n        <div class="panel-heading">\n          '),__append(t("qiResults","PANEL:TITLE:details:inspection:nok")),__append('\n        </div>\n        <div class="panel-details">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:errorCategory")),__append('</div>\n              <div class="prop-value">'),__append(escape(model.errorCategory||"-")),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:faultCode")),__append('</div>\n              <div class="prop-value">'),__append(model.faultCode||"-"),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:faultDescription")),__append('</div>\n              <div class="prop-value text-lines">'),__append(escape(model.faultDescription||"-")),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:problem")),__append('</div>\n              <div class="prop-value text-lines">'),__append(escape(model.problem||"-")),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:immediateActions")),__append('</div>\n              <div class="prop-value text-lines">'),__append(escape(model.immediateActions||"-")),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("qiResults","PROPERTY:rootCause")),__append('</div>\n              <div class="prop-value text-lines">'),__append(escape(model.rootCause||"-")),__append('</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-success">\n        <div class="panel-heading">\n          '),__append(t("qiResults","PANEL:TITLE:details:attachments:ok")),__append('\n        </div>\n        <div class="panel-body qiResults-details-attachment">\n          '),model.okFile?(__append('\n          <a href="/qi/results/'),__append(model._id),__append("/attachments/"),__append(model.rid),__append('%20OK" data-file="ok">\n            '),"file-image-o"===model.okFile.icon?(__append('\n            <img src="/qi/results/'),__append(model._id),__append("/attachments/okFile?min="),__append(model.okFile._id),__append('">\n            ')):(__append('\n            <i class="fa fa-'),__append(model.okFile.icon),__append('"></i>\n            ')),__append("\n            <span>"),__append(escape(model.okFile.name)),__append("</span>\n          </a>\n          ")):__append('\n          <i class="fa fa-ban"></i>\n          '),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-danger">\n        <div class="panel-heading">\n          '),__append(t("qiResults","PANEL:TITLE:details:attachments:nok")),__append('\n        </div>\n        <div class="panel-body qiResults-details-attachment">\n          '),model.nokFile?(__append('\n          <a href="/qi/results/'),__append(model._id),__append("/attachments/"),__append(model.rid),__append('%20NOK" data-file="nok">\n            '),"file-image-o"===model.nokFile.icon?(__append('\n            <img src="/qi/results/'),__append(model._id),__append("/attachments/nokFile?min="),__append(model.nokFile._id),__append('">\n            ')):(__append('\n            <i class="fa fa-'),__append(model.nokFile.icon),__append('"></i>\n            ')),__append("\n            <span>"),__append(escape(model.nokFile.name)),__append("</span>\n          </a>\n          ")):__append('\n          <i class="fa fa-ban"></i>\n          '),__append('\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">\n      '),__append(t("qiResults","PANEL:TITLE:details:actions")),__append("\n    </div>\n    "),model.correctiveActions.length?(__append("\n    "),__append(renderCorrectiveActionsTable({bordered:!0,correctiveActions:model.correctiveActions})),__append("\n    ")):(__append('\n    <div class="panel-body">\n      <p>'),__append(t("qiResults","correctiveActions:empty")),__append("</p>\n    </div>\n    ")),__append("\n  </div>\n  ")),__append("\n</div>\n");return __output.join("")}});