define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="qiResults-details">\n  <div class="row">\n    <div class="col-lg-4">\n      <div class="panel panel-primary">\n        <div class="panel-heading">\n          '),__append(helpers.t("PANEL:TITLE:details:order")),__append('\n        </div>\n        <div class="panel-details">\n          '),__append(helpers.props(model,["orderNo","serialNumbers","nc12","productFamily","productName","division","line","qtyOrder"])),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-'),__append(model.ok?"success":"danger"),__append('">\n        <div class="panel-heading">\n          '),__append(helpers.t("PANEL:TITLE:details:inspection")),__append('\n        </div>\n        <div class="panel-details">\n          '),__append(helpers.props(model,["kind","inspectedAt","!inspector","!leader",{id:"!nokOwner",visible:!model.ok},"qtyInspected",{id:"qtyNokInspected",visible:!model.ok},{id:"qtyToFix",visible:!model.ok},{id:"qtyNok",visible:!model.ok}])),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-default">\n        <div class="panel-heading">\n          '),__append(helpers.t("PANEL:TITLE:details:extra")),__append('\n        </div>\n        <div class="panel-details">\n          '),__append(helpers.props(model,["createdAt","!creator","updatedAt","!updater"])),__append("\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.ok||(__append('\n  <div class="row">\n    <div class="col-lg-4">\n      <div class="panel panel-danger">\n        <div class="panel-heading">\n          '),__append(helpers.t("PANEL:TITLE:details:inspection:nok")),__append('\n        </div>\n        <div class="panel-details">\n          '),__append(helpers.props(model,["errorCategory","faultCode",{id:"faultDescription",valueClassName:"text-lines"},{id:"problem",valueClassName:"text-lines"},{id:"immediateActions",valueClassName:"text-lines"},{id:"rootCause",valueClassName:"text-lines"}])),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-success">\n        <div class="panel-heading">\n          '),__append(helpers.t("PANEL:TITLE:details:attachments:ok")),__append('\n        </div>\n        <div class="panel-body qiResults-details-attachment">\n          '),model.okFile?(__append('\n          <a href="/qi/results/'),__append(model._id),__append("/attachments/"),__append(model.rid),__append('%20OK" data-file="ok">\n            '),"file-image-o"===model.okFile.icon?(__append('\n            <img src="/qi/results/'),__append(model._id),__append("/attachments/okFile?min="),__append(model.okFile._id),__append('">\n            ')):(__append('\n            <i class="fa fa-'),__append(model.okFile.icon),__append('"></i>\n            ')),__append("\n            <span>"),__append(escapeFn(model.okFile.name)),__append("</span>\n          </a>\n          ")):__append('\n          <i class="fa fa-ban"></i>\n          '),__append('\n        </div>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="panel panel-danger">\n        <div class="panel-heading">\n          '),__append(helpers.t("PANEL:TITLE:details:attachments:nok")),__append('\n        </div>\n        <div class="panel-body qiResults-details-attachment">\n          '),model.nokFile?(__append('\n          <a href="/qi/results/'),__append(model._id),__append("/attachments/"),__append(model.rid),__append('%20NOK" data-file="nok">\n            '),"file-image-o"===model.nokFile.icon?(__append('\n            <img src="/qi/results/'),__append(model._id),__append("/attachments/nokFile?min="),__append(model.nokFile._id),__append('">\n            ')):(__append('\n            <i class="fa fa-'),__append(model.nokFile.icon),__append('"></i>\n            ')),__append("\n            <span>"),__append(escapeFn(model.nokFile.name)),__append("</span>\n          </a>\n          ")):__append('\n          <i class="fa fa-ban"></i>\n          '),__append('\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">\n      '),__append(helpers.t("PANEL:TITLE:details:actions")),__append("\n    </div>\n    "),model.correctiveActions.length?(__append("\n    "),__append(renderCorrectiveActionsTable({helpers:helpers,bordered:!0,correctiveActions:model.correctiveActions})),__append("\n    ")):(__append('\n    <div class="panel-body">\n      <p>'),__append(helpers.t("correctiveActions:empty")),__append("</p>\n    </div>\n    ")),__append("\n  </div>\n  ")),__append("\n</div>\n");return __output.join("")}});