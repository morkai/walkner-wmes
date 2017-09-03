define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="qiResults-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-'),__append(model.ok?"success":"danger"),__append('">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body '),__append(!editMode&&model.ok?"has-lastElementRow":""),__append('">\n      <div class="form-group">\n        <div id="'),__append(idPrefix),__append('-result" class="btn-group" data-toggle="buttons">\n          <label class="btn btn-default qiResults-filter-ok"><input id="'),__append(idPrefix),__append('-ok" type="radio" name="ok" value="true"> OK</label>\n          <label class="btn btn-default qiResults-filter-nok"><input id="'),__append(idPrefix),__append('-nok" type="radio" name="ok" value="false"> NOK</label>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-orderNo" class="control-label is-required">'),__append(t("qiResults","PROPERTY:orderNo")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-orderNo" name="orderNo" class="form-control no-controls" type="number" required min="100000000" max="999999999" data-role="inspector">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-nc12" class="control-label">'),__append(t("qiResults","PROPERTY:nc12")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-nc12" name="nc12" class="form-control" type="text" required readonly>\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-productFamily" class="control-label">'),__append(t("qiResults","PROPERTY:productFamily")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-productFamily" name="productFamily" class="form-control" type="text" required readonly pattern="^[A-Z0-9]{6}$">\n        </div>\n        <div class="col-lg-6 form-group">\n          <label for="'),__append(idPrefix),__append('-productName" class="control-label">'),__append(t("qiResults","PROPERTY:productName")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-productName" name="productName" class="form-control" type="text" required readonly>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-division" class="control-label">'),__append(t("qiResults","PROPERTY:division")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-division" name="division" class="form-control" required data-role="inspector">\n            <option></option>\n            '),divisions.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.getLabel())),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-line" class="control-label">'),__append(t("qiResults","PROPERTY:line")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-line" name="line" class="form-control" data-role="inspector">\n            <option></option>\n          </select>\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-leader" class="control-label">'),__append(t("qiResults","PROPERTY:leader")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-leader" name="leader" class="form-control" data-role="inspector">\n            <option></option>\n            '),leaders.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n            ")}),__append("\n          </select>\n        </div>\n        "),model.ok||(__append('\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-nokOwner" class="control-label">'),__append(t("qiResults","PROPERTY:nokOwner")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-nokOwner" name="nokOwner" class="form-control" data-role="inspector">\n            <option></option>\n            '),masters.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n            ")}),__append("\n          </select>\n        </div>\n        ")),__append('\n      </div>\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-kind" class="control-label is-required">'),__append(t("qiResults","PROPERTY:kind")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-kind" name="kind" class="form-control" required data-role="inspector">\n            '),kinds.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-inspectedAt" class="control-label is-required">'),__append(t("qiResults","PROPERTY:inspectedAt")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-inspectedAt" name="inspectedAt" class="form-control" type="date" min="'),__append(inspectedAtMin),__append('" max="'),__append(inspectedAtMax),__append('" data-role="inspector">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-inspector" class="control-label is-required">'),__append(t("qiResults","PROPERTY:inspector")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-inspector" name="inspector" class="form-control" required data-role="inspector">\n            '),inspectors.forEach(function(e){__append('\n            <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyOrder" class="control-label">'),__append(t("qiResults","PROPERTY:qtyOrder")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyOrder" name="qtyOrder" class="form-control" type="number"  required readonly min="0">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyInspected" class="control-label is-required">'),__append(t("qiResults","PROPERTY:qtyInspected")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyInspected" name="qtyInspected" class="form-control" type="number" required min="1" data-role="inspector">\n        </div>\n        '),model.ok||(__append('\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyNokInspected" class="control-label is-required">'),__append(t("qiResults","PROPERTY:qtyNokInspected")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyNokInspected" name="qtyNokInspected" class="form-control" type="number" required min="0" data-role="inspector">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyToFix" class="control-label is-required">'),__append(t("qiResults","PROPERTY:qtyToFix")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyToFix" name="qtyToFix" class="form-control" type="number" required min="0" data-role="inspector">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-qtyNok" class="control-label is-required">'),__append(t("qiResults","PROPERTY:qtyNok")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-qtyNok" name="qtyNok" class="form-control" type="number" required min="0" data-role="inspector">\n        </div>\n        ')),__append("\n      </div>\n      "),model.ok||(__append('\n      <div class="row">\n        <div class="col-lg-4">\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-errorCategory" class="control-label '),__append(user.isAllowedTo("QI:RESULTS:MANAGE")?"":"is-required"),__append('">'),__append(t("qiResults","PROPERTY:errorCategory")),__append('</label>\n            <select id="'),__append(idPrefix),__append('-errorCategory" name="errorCategory" class="form-control" '),__append(user.isAllowedTo("QI:RESULTS:MANAGE")?"":"required"),__append(' data-role="specialist">\n              <option></option>\n              '),errorCategories.forEach(function(e){__append('\n              <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n              ")}),__append('\n            </select>\n          </div>\n          <div class="form-group not-last">\n            <label for="'),__append(idPrefix),__append('-faultCode" class="control-label">'),__append(t("qiResults","PROPERTY:faultCode")),__append('</label>\n            <select id="'),__append(idPrefix),__append('-faultCode" name="faultCode" class="form-control" required data-role="inspector">\n              '),faults.forEach(function(e){__append('\n              <option value="'),__append(e.id),__append('">'),__append(escapeFn(e.text)),__append("</option>\n              ")}),__append('\n            </select>\n          </div>\n        </div>\n        <div class="col-lg-8 form-group">\n          <label for="'),__append(idPrefix),__append('-faultDescription" class="control-label">'),__append(t("qiResults","PROPERTY:faultDescription")),__append('</label>\n          <textarea id="'),__append(idPrefix),__append('-faultDescription" name="faultDescription" class="form-control" rows="3" data-role="inspector"></textarea>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-problem" class="control-label">'),__append(t("qiResults","PROPERTY:problem")),__append('</label>\n          <textarea id="'),__append(idPrefix),__append('-problem" name="problem" class="form-control" rows="4" data-role="inspector"></textarea>\n        </div>\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-immediateActions" class="control-label">'),__append(t("qiResults","PROPERTY:immediateActions")),__append('</label>\n          <textarea id="'),__append(idPrefix),__append('-immediateActions" name="immediateActions" class="form-control" rows="4" data-role="inspector specialist nokOwner leader"></textarea>\n        </div>\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(idPrefix),__append('-rootCause" class="control-label">'),__append(t("qiResults","PROPERTY:rootCause")),__append('</label>\n          <textarea id="'),__append(idPrefix),__append('-rootCause" name="rootCause" class="form-control" rows="4" data-role="specialist nokOwner leader"></textarea>\n        </div>\n      </div>\n      '),(model.okFile||model.nokFile)&&(__append('\n      <div class="message message-inline message-warning">'),__append(t("qiResults","FORM:attachments:update")),__append('</div>\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label class="control-label">'),__append(t("qiResults","FORM:okFile:current")),__append('</label>\n          <p class="form-control-static">\n            '),model.okFile?(__append('\n            <a href="/qi/results/'),__append(model._id),__append('/attachments/okFile">'),__append(escapeFn(model.okFile.name)),__append("</a>\n            "),canEditAttachments&&(__append('\n            <label class="qiResults-form-removeAttachment">(<input type="checkbox" name="removeFile[]" value="ok"> '),__append(t("qiResults","FORM:attachments:remove")),__append(")</label>\n            ")),__append("\n            ")):__append("\n            -\n            "),__append('\n          </p>\n        </div>\n        <div class="col-lg-2 form-group">\n          <label class="control-label">'),__append(t("qiResults","FORM:nokFile:current")),__append('</label>\n          <p class="form-control-static">\n            '),model.nokFile?(__append('\n            <a href="/qi/results/'),__append(model._id),__append('/attachments/nokFile">'),__append(escapeFn(model.nokFile.name)),__append("</a>\n            "),canEditAttachments&&(__append('\n            <label class="qiResults-form-removeAttachment">(<input type="checkbox" name="removeFile[]" value="nok"> '),__append(t("qiResults","FORM:attachments:remove")),__append(")</label>\n            ")),__append("\n            ")):__append("\n            -\n            "),__append("\n          </p>\n        </div>\n      </div>\n      ")),__append("\n      "),canEditAttachments&&(__append('\n      <div class="row">\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-okFile" class="control-label">'),__append(t("qiResults","FORM:okFile:new")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-okFile" name="okFile" class="form-control" type="file">\n        </div>\n        <div class="col-lg-2 form-group">\n          <label for="'),__append(idPrefix),__append('-nokFile" class="control-label">'),__append(t("qiResults","FORM:nokFile:new")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-nokFile" name="nokFile" class="form-control" type="file">\n        </div>\n      </div>\n      ')),__append("\n      "),canEditActions&&(__append('\n      <div class="table-responsive">\n        <table class="table table-bordered table-condensed qiResults-form-correctiveActions">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("qiResults","correctiveActions:#")),__append('</th>\n            <th class="is-min">'),__append(t("qiResults","correctiveActions:status")),__append('</th>\n            <th class="is-min">'),__append(t("qiResults","correctiveActions:when")),__append('</th>\n            <th class="is-min">'),__append(t("qiResults","correctiveActions:who")),__append("</th>\n            <th>"),__append(t("qiResults","correctiveActions:what")),__append('</th>\n            <th></th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(idPrefix),__append('-actions"></tbody>\n        </table>\n      </div>\n      <button id="'),__append(idPrefix),__append('-addAction" class="btn btn-default" type="button">\n        <i class="fa fa-plus"></i><span>'),__append(t("qiResults","correctiveActions:add")),__append("</span>\n      </button>\n      ")),__append("\n      ")),__append("\n      "),editMode&&(__append('\n      <div class="form-group qiResults-form-comment">\n        <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(t("qiResults","PROPERTY:comment")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-comment" class="form-control" name="comment" rows="3"></textarea>\n      </div>\n      ')),__append('\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n        <i class="fa fa-spinner fa-spin hidden"></i>\n        <span>'),__append(formActionText),__append("</span>\n      </button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});