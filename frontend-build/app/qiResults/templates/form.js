define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="qiResults-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-'),__append(model.ok?"success":"danger"),__append('">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <div id="'),__append(idPrefix),__append('-source" class="btn-group" data-toggle="buttons">\n          '),["prod","wh"].forEach(function(e){__append('\n          <label class="btn btn-default" style="min-width: 100px">\n            <input id="'),__append(idPrefix),__append('-source" type="radio" name="source" value="'),__append(e),__append('">\n            '),__append(t("source:"+e)),__append("\n          </label>\n          ")}),__append('\n        </div>\n        <div id="'),__append(idPrefix),__append('-result" class="btn-group" data-toggle="buttons" style="margin-left: 30px">\n          <label class="btn btn-default qiResults-filter-ok" style="min-width: 90px">\n            <input id="'),__append(idPrefix),__append('-ok" type="radio" name="ok" value="true">\n            '),__append(t("ok:true")),__append('\n          </label>\n          <label class="btn btn-default qiResults-filter-nok" style="min-width: 90px">\n            <input id="'),__append(idPrefix),__append('-nok" type="radio" name="ok" value="false">\n            '),__append(t("ok:false")),__append('\n          </label>\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-orderGroup" class="row">\n        <div class="col-lg-2 form-group" data-source="prod">\n          <label for="'),__append(idPrefix),__append('-orderNo" class="control-label is-required">'),__append(t("PROPERTY:orderNo")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-orderNo" name="orderNo" class="form-control no-controls" type="number" required min="100000000" max="999999999" data-role="inspector">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-nc12" class="control-label"><span data-source="prod">'),__append(t("PROPERTY:nc12:prod")),__append('</span><span data-source="wh">'),__append(t("PROPERTY:nc12:wh")),__append('</span></label>\n          <input id="'),__append(idPrefix),__append('-nc12" name="nc12" class="form-control" type="text" required readonly>\n        </div>\n        <div class="col-lg-2 form-group" data-source="prod">\n          <label for="'),__append(idPrefix),__append('-productFamily" class="control-label">'),__append(t("PROPERTY:productFamily")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-productFamily" name="productFamily" class="form-control" type="text" required readonly pattern="^[A-Z0-9]{6}$">\n        </div>\n        <div class="col-lg-6 form-group">\n          <label for="'),__append(idPrefix),__append('-productName" class="control-label">\n            <span data-source="prod">'),__append(t("PROPERTY:productName:prod")),__append('</span>\n            <span data-source="wh">'),__append(t("PROPERTY:productName:wh")),__append('</span>\n          </label>\n          <input id="'),__append(idPrefix),__append('-productName" name="productName" class="form-control" type="text" required readonly>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-division" class="control-label is-required">'),__append(t("PROPERTY:division")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-division" name="division" class="form-control" required data-role="inspector" data-orders-division="'),__append(model.division||""),__append('" data-orders-mrp="'),__append(model.mrp||""),__append('">\n            <option></option>\n            '),divisions.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.getLabel())),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n        <div class="col-lg-2 form-group" data-source="prod">\n          <label for="'),__append(idPrefix),__append('-line" class="control-label">'),__append(t("PROPERTY:line:prod")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-line" name="line" class="form-control" data-role="inspector">\n            <option></option>\n            '),model.line&&(__append('\n            <option value="'),__append(escapeFn(model.line)),__append('" selected>'),__append(escapeFn(model.line)),__append("</option>\n            ")),__append('\n          </select>\n        </div>\n        <div class="col-lg-2 form-group" data-source="wh">\n          <label for="'),__append(idPrefix),__append('-location" class="control-label">'),__append(t("PROPERTY:line:wh")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-location" name="location" class="form-control" type="text" data-role="inspector">\n        </div>\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-leader" class="control-label">\n            <span data-source="prod">'),__append(t("PROPERTY:leader:prod")),__append('</span>\n            <span data-source="wh">'),__append(t("PROPERTY:leader:wh")),__append('</span>\n          </label>\n          <select id="'),__append(idPrefix),__append('-leader" name="leader" class="form-control" data-role="inspector"></select>\n        </div>\n        '),model.ok||(__append('\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-nokOwner" class="control-label">'),__append(t("PROPERTY:nokOwner")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-nokOwner" name="nokOwner" class="form-control" data-role="inspector">\n            <option></option>\n            '),masters.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n            ")}),__append("\n          </select>\n        </div>\n        ")),__append('\n      </div>\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-kind" class="control-label is-required">'),__append(t("PROPERTY:kind")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-kind" name="kind" class="form-control" required data-role="inspector">\n            '),kinds.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-inspectedAt" class="control-label is-required">'),__append(t("PROPERTY:inspectedAt")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-inspectedAt" name="inspectedAt" class="form-control" type="date" min="'),__append(inspectedAtMin),__append('" max="'),__append(inspectedAtMax),__append('" data-role="inspector">\n        </div>\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-inspector" class="control-label">'),__append(t("PROPERTY:inspector")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-inspector" name="inspector" class="form-control" data-role="inspector">\n            <option></option>\n            '),inspectors.forEach(function(e){__append('\n              <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-coach" class="control-label">'),__append(t("PROPERTY:coach")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-coach" name="coach" type="text" data-role="inspector">\n        </div>\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-operator" class="control-label">'),__append(t("PROPERTY:operator")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-operator" name="operator" type="text" data-role="inspector">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-2 form-group" data-source="prod">\n          <label for="'),__append(idPrefix),__append('-qtyOrder" class="control-label">'),__append(t("PROPERTY:qtyOrder")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyOrder" name="qtyOrder" class="form-control" type="number"  required readonly min="0">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyInspected" class="control-label is-required">'),__append(t("PROPERTY:qtyInspected")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyInspected" name="qtyInspected" class="form-control" type="number" required min="1" data-role="inspector">\n        </div>\n        '),model.ok||(__append('\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyNokInspected" class="control-label is-required" title="'),__append(t("PROPERTY:qtyNokInspected")),__append('">'),__append(t("PROPERTY:qtyNokInspected:min")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyNokInspected" name="qtyNokInspected" class="form-control" type="number" required min="0" data-role="inspector">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyToFix" class="control-label is-required">'),__append(t("PROPERTY:qtyToFix")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyToFix" name="qtyToFix" class="form-control" type="number" required min="0" data-role="inspector">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyNok" class="control-label is-required">'),__append(t("PROPERTY:qtyNok")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyNok" name="qtyNok" class="form-control" type="number" required min="0" data-role="inspector">\n        </div>\n        ')),__append('\n        <div class="col-lg-2 form-group" data-source="prod">\n          <label for="'),__append(idPrefix),__append('-serialNumbers" class="control-label">'),__append(t("PROPERTY:serialNumbers")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-serialNumbers" name="serialNumbers" class="form-control" type="text" data-role="inspector">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("notes")),__append('" class="control-label">'),__append(t("PROPERTY:notes")),__append('</label>\n        <textarea id="'),__append(id("notes")),__append('" name="notes" class="form-control" rows="3" data-role="inspector"></textarea>\n      </div>\n      '),model.ok||(__append('\n      <div class="row">\n        <div class="col-lg-4">\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-errorCategory" class="control-label '),__append(user.isAllowedTo("QI:RESULTS:MANAGE")?"":"is-required"),__append('">'),__append(t("PROPERTY:errorCategory")),__append('</label>\n            <select id="'),__append(idPrefix),__append('-errorCategory" name="errorCategory" class="form-control" '),__append(user.isAllowedTo("QI:RESULTS:MANAGE")?"":"required"),__append(' data-role="specialist">\n              <option></option>\n              '),errorCategories.forEach(function(e){__append('\n              <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n              ")}),__append('\n            </select>\n          </div>\n          <div class="form-group not-last">\n            <label for="'),__append(idPrefix),__append('-faultCode" class="control-label">'),__append(t("PROPERTY:faultCode")),__append('</label>\n            <select id="'),__append(idPrefix),__append('-faultCode" name="faultCode" class="form-control" required data-role="inspector">\n              '),faults.forEach(function(e){__append('\n              <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n              ")}),__append('\n            </select>\n          </div>\n        </div>\n        <div class="col-lg-8 form-group">\n          <label for="'),__append(idPrefix),__append('-faultDescription" class="control-label">'),__append(t("PROPERTY:faultDescription")),__append('</label>\n          <textarea id="'),__append(idPrefix),__append('-faultDescription" name="faultDescription" class="form-control" rows="3" data-role="inspector"></textarea>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-6 form-group">\n          <label for="'),__append(idPrefix),__append('-problem" class="control-label">'),__append(t("PROPERTY:problem")),__append('</label>\n          <textarea id="'),__append(idPrefix),__append('-problem" name="problem" class="form-control" rows="4" data-role="inspector"></textarea>\n        </div>\n        <div class="col-lg-6 form-group">\n          <label for="'),__append(idPrefix),__append('-immediateActions" class="control-label">'),__append(t("PROPERTY:immediateActions")),__append('</label>\n          <textarea id="'),__append(idPrefix),__append('-immediateActions" name="immediateActions" class="form-control" rows="4" data-role="inspector specialist nokOwner leader"></textarea>\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-rootCauses" class="qiResults-form-rootCauses">\n        '),model.rootCause.forEach(function(e,n){for(__append("\n"),e=e.concat([]);e.length<2;)e.push("");""!==_.last(e)&&e.push(""),__append('\n        <div class="form-group" data-i="'),__append(n),__append('">\n          <label class="control-label is-required">\n            <span>'),__append(t("FORM:rootCause:label",{n:n+1,total:model.rootCause.length})),__append('</span>\n            <a class="qiResults-form-removeRootCause" href="javascript:void(0)" title="'),__append(t("FORM:rootCause:remove")),__append('"><i class="fa fa-times"></i></a>\n          </label>\n          '),e.forEach(function(e,p){__append('\n          <input name="rootCause['),__append(n),__append("]["),__append(p),__append(']" class="form-control qiResults-form-rootCause" '),__append(p<2?"required":""),__append(' data-role="inspector specialist nokOwner leader" placeholder="'),__append(t("FORM:rootCause:placeholder",{n:p+1})),__append('">\n          ')}),__append("\n        </div>\n        ")}),__append('\n      </div>\n      <button id="'),__append(idPrefix),__append('-addRootCause" type="button" class="btn btn-default" style="margin: 7px 0 15px 0"><i class="fa fa-plus"></i><span>'),__append(t("FORM:rootCause:add")),__append("</span></button>\n      "),(model.okFile||model.nokFile)&&(__append("\n      "),canEditAttachments&&(__append('\n      <div class="message message-inline message-warning">'),__append(t("FORM:attachments:update")),__append("</div>\n      ")),__append('\n      <div class="row">\n        <div class="col-lg-3 form-group">\n          <label class="control-label">'),__append(t("FORM:okFile:current")),__append('</label>\n          <p class="form-control-static">\n            '),model.okFile?(__append('\n            <a href="/qi/results/'),__append(model._id),__append('/attachments/okFile">'),__append(escapeFn(model.okFile.name)),__append("</a>\n            "),canEditAttachments&&(__append('\n            <label class="qiResults-form-removeAttachment">(<input type="checkbox" name="removeFile[]" value="ok"> '),__append(t("FORM:attachments:remove")),__append(")</label>\n            ")),__append("\n            ")):__append("\n            -\n            "),__append('\n          </p>\n        </div>\n        <div class="col-lg-3 form-group">\n          <label class="control-label">'),__append(t("FORM:nokFile:current")),__append('</label>\n          <p class="form-control-static">\n            '),model.nokFile?(__append('\n            <a href="/qi/results/'),__append(model._id),__append('/attachments/nokFile">'),__append(escapeFn(model.nokFile.name)),__append("</a>\n            "),canEditAttachments&&(__append('\n            <label class="qiResults-form-removeAttachment">(<input type="checkbox" name="removeFile[]" value="nok"> '),__append(t("FORM:attachments:remove")),__append(")</label>\n            ")),__append("\n            ")):__append("\n            -\n            "),__append("\n          </p>\n        </div>\n      </div>\n      ")),__append("\n      "),canEditAttachments&&(__append('\n      <div class="row">\n        <div class="col-lg-3 form-group">\n          <label for="'),__append(idPrefix),__append('-okFile" class="control-label">'),__append(t("FORM:okFile:new")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-okFile" name="okFile" class="form-control" type="file">\n        </div>\n        <div class="col-lg-3 form-group">\n          <label for="'),__append(idPrefix),__append('-nokFile" class="control-label">'),__append(t("FORM:nokFile:new")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-nokFile" name="nokFile" class="form-control" type="file">\n        </div>\n      </div>\n      ')),__append("\n      "),canEditActions&&(__append('\n      <label class="control-label">'),__append(t("PROPERTY:correctiveActions")),__append('</label>\n      <div class="table-responsive" style="margin-bottom: 7px">\n        <table class="table table-bordered table-condensed qiResults-form-correctiveActions">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("correctiveActions:#")),__append('</th>\n            <th class="is-min">'),__append(t("correctiveActions:status")),__append('</th>\n            <th class="is-min">'),__append(t("correctiveActions:when")),__append('</th>\n            <th class="is-min">'),__append(t("correctiveActions:who")),__append("</th>\n            <th>"),__append(t("correctiveActions:what")),__append('</th>\n            <th></th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(id("actions")),__append('"></tbody>\n        </table>\n      </div>\n      '),canAddActions&&(__append('\n      <div style="display: flex">\n        <button id="'),__append(id("addStdAction")),__append('" class="btn btn-default" type="button">\n          <i class="fa fa-plus"></i><span>'),__append(t("correctiveActions:add:std")),__append('</span>\n        </button>\n        <div class="input-group" style="width: 180px; margin-left: 7px">\n          <input id="'),__append(id("kzActionRid")),__append('" type="text" class="form-control" placeholder="'),__append(t("correctiveActions:add:kz:placeholder")),__append('" pattern="^[0-9]+$">\n          <span class="input-group-btn">\n          <button id="'),__append(id("linkKzAction")),__append('" class="btn btn-default" type="button" title="'),__append(t("correctiveActions:add:kz:link")),__append('"><i class="fa fa-link"></i></button>\n          <button id="'),__append(id("addKzAction")),__append('" class="btn btn-default" type="button" title="'),__append(t("correctiveActions:add:kz:add")),__append('"><i class="fa fa-plus"></i></button>\n        </span>\n        </div>\n      </div>\n      ')),__append("\n      ")),__append("\n      ")),__append("\n      "),editMode&&(__append('\n      <div class="form-group qiResults-form-comment">\n        <label for="'),__append(id("comment")),__append('" class="control-label">'),__append(t("PROPERTY:comment")),__append('</label>\n        <textarea id="'),__append(id("comment")),__append('" class="form-control" name="comment" rows="3"></textarea>\n      </div>\n      ')),__append('\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(id("submit")),__append('" type="submit" class="btn btn-primary">\n        <i class="fa fa-spinner fa-spin hidden"></i>\n        <span>'),__append(formActionText),__append("</span>\n      </button>\n    </div>\n  </div>\n</form>\n");return __output}});