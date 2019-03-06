define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="suggestions-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div id="'),__append(idPrefix),__append('-statusGroup" class="form-group clearfix">\n        <label for="'),__append(idPrefix),__append('-status" class="control-label">'),__append(helpers.t("PROPERTY:status")),__append('</label>\n        <div id="'),__append(idPrefix),__append('-status" class="btn-group suggestions-form-statusBtnGroup" data-toggle="buttons">\n          '),statuses.forEach(function(e){__append('\n          <label class="btn btn-default">\n            <input type="radio" name="status" value="'),__append(e),__append('">'),__append(helpers.t("status:"+e)),__append("\n          </label>\n          ")}),__append('\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-subject" class="control-label is-required">'),__append(helpers.t("PROPERTY:subject")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-subject" class="form-control" type="text" autocomplete="new-password" name="subject" required placeholder="'),__append(helpers.t("FORM:help:subject")),__append('">\n      </div>\n      <div class="row">\n        <div class="form-group col-lg-4 has-required-select2">\n          <label for="'),__append(idPrefix),__append('-section" class="control-label is-required">'),__append(helpers.t("PROPERTY:section")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-section" type="text" autocomplete="new-password" name="section" required placeholder="'),__append(helpers.t("FORM:help:section")),__append('">\n        </div>\n        <div class="form-group col-lg-8 has-required-select2">\n          <label for="'),__append(idPrefix),__append('-confirmer" class="control-label is-required">'),__append(helpers.t("PROPERTY:confirmer")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-confirmer" type="text" autocomplete="new-password" name="confirmer" required placeholder="'),__append(helpers.t("FORM:help:confirmer")),__append('">\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-panel-suggestion" class="panel panel-warning suggestions-form-typePanel">\n        <div class="panel-heading">'),__append(helpers.t("type:suggestion")),__append('</div>\n        <div id="'),__append(idPrefix),__append('-suggestionPanelBody" class="panel-body has-lastElementRow">\n          <div class="form-group has-required-select2">\n            <label for="'),__append(idPrefix),__append('-suggestionOwners" class="control-label is-required">'),__append(helpers.t("PROPERTY:suggestionOwners")),__append('</label>\n            <input id="'),__append(idPrefix),__append('-suggestionOwners" type="text" autocomplete="new-password" name="suggestionOwners" required>\n          </div>\n          <div class="row">\n            <div class="col-lg-2 form-group has-required-select2">\n              <label for="'),__append(idPrefix),__append('-date" class="control-label is-required">'),__append(helpers.t("PROPERTY:date")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-date" class="form-control" type="date" name="date" required max="'),__append(today),__append('" placeholder="'),__append(t("core","placeholder:date")),__append('">\n            </div>\n          </div>\n          <div class="row">\n            <div class="col-lg-8 form-group has-required-select2">\n              <label for="'),__append(idPrefix),__append('-categories" class="control-label is-required">'),__append(helpers.t("PROPERTY:categories")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-categories" type="text" autocomplete="new-password" name="categories" required>\n            </div>\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(idPrefix),__append('-productFamily" class="control-label">'),__append(helpers.t("PROPERTY:productFamily")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-productFamily" type="text" autocomplete="new-password" name="productFamily">\n            </div>\n          </div>\n          <div class="row">\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(idPrefix),__append('-howItIs" class="control-label is-required">'),__append(helpers.t("PROPERTY:howItIs")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-howItIs" class="form-control" name="howItIs" rows="3" required></textarea>\n            </div>\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(idPrefix),__append('-howItShouldBe" class="control-label is-required">'),__append(helpers.t("PROPERTY:howItShouldBe")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-howItShouldBe" class="form-control" name="howItShouldBe" rows="3" required></textarea>\n            </div>\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(idPrefix),__append('-suggestion" class="control-label">'),__append(helpers.t("PROPERTY:suggestion")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-suggestion" class="form-control" name="suggestion" rows="3"></textarea>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-panel-kaizen" class="panel panel-success suggestions-form-typePanel">\n        <div class="panel-heading">'),__append(helpers.t("type:kaizen")),__append('</div>\n        <div class="panel-body has-lastElementRow">\n          <div id="'),__append(idPrefix),__append('-kaizenOwnersFormGroup" class="form-group has-required-select2">\n            <label for="'),__append(idPrefix),__append('-kaizenOwners" class="control-label is-required">'),__append(helpers.t("PROPERTY:kaizenOwners")),__append('</label>\n            <input id="'),__append(idPrefix),__append('-kaizenOwners" type="text" autocomplete="new-password" name="kaizenOwners">\n          </div>\n          <div class="row">\n            <div class="form-group col-lg-2">\n              <label for="'),__append(idPrefix),__append('-kaizenStartDate" class="control-label is-requiredToFinish">'),__append(helpers.t("PROPERTY:kaizenStartDate")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-kaizenStartDate" class="form-control" type="date" name="kaizenStartDate" max="'),__append(today),__append('" placeholder="'),__append(t("core","placeholder:date")),__append('">\n            </div>\n            <div class="form-group col-lg-2">\n              <label for="'),__append(idPrefix),__append('-kaizenFinishDate" class="control-label is-requiredToFinish">'),__append(helpers.t("PROPERTY:kaizenFinishDate")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-kaizenFinishDate" class="form-control" type="date" name="kaizenFinishDate" max="'),__append(today),__append('" placeholder="'),__append(t("core","placeholder:date")),__append('">\n            </div>\n          </div>\n          <div class="row">\n            <div class="form-group col-md-4">\n              <label for="'),__append(idPrefix),__append('-kaizenImprovements" class="control-label is-requiredToFinish">'),__append(helpers.t("PROPERTY:kaizenImprovements")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-kaizenImprovements" class="form-control" name="kaizenImprovements" rows="3"></textarea>\n            </div>\n            <div class="form-group col-md-4">\n              <label for="'),__append(idPrefix),__append('-kaizenEffect" class="control-label is-requiredToFinish">'),__append(helpers.t("PROPERTY:kaizenEffect")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-kaizenEffect" class="form-control" name="kaizenEffect" rows="3"></textarea>\n            </div>\n          </div>\n        </div>\n      </div>\n      '),editMode&&(__append('\n      <div class="message message-inline message-warning">\n        <p>'),__append(helpers.t("FORM:MSG:attachmentEdit")),__append('</p>\n      </div>\n      <div class="row suggestions-form-attachments">\n        '),["scan","before","after"].forEach(function(e){__append('\n        <div class="col-md-4 form-group">\n          <label class="control-label">'),__append(helpers.t("attachments:"+e+":current")),__append('</label>\n          <p class="form-control-static">\n            '),attachments[e]?(__append('\n            <a href="/suggestions/'),__append(model._id),__append("/attachments/"),__append(attachments[e]._id),__append('">'),__append(escapeFn(attachments[e].name)),__append("</a>\n            ")):__append("\n            -\n            "),__append("\n          </p>\n        </div>\n        ")}),__append("\n      </div>\n      ")),__append('\n      <div class="row">\n        '),["scan","before","after"].forEach(function(e){__append('\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append("-attachments-"),__append(e),__append('" class="control-label">'),__append(helpers.t("attachments:"+e+(editMode?":new":""))),__append('</label>\n          <input id="'),__append(idPrefix),__append("-attachments-"),__append(e),__append('" class="form-control" type="file" data-name="'),__append(e),__append('">\n        </div>\n        ')}),__append('\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-subscribers" class="control-label">'),__append(helpers.t("PROPERTY:subscribers")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-subscribers" type="text" autocomplete="new-password" name="subscribers">\n        <p class="help-block">'),__append(helpers.t("FORM:help:subscribers")),__append("</p>\n      </div>\n      "),editMode&&(__append('\n      <div class="form-group suggestions-form-comment">\n        <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(helpers.t("PROPERTY:comment")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-comment" class="form-control" name="comment" rows="3"></textarea>\n      </div>\n      ')),__append('\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n        <i class="fa fa-spinner fa-spin"></i>\n        <span>'),__append(backTo?backTo.submitLabel:formActionText),__append("</span>\n      </button>\n      "),backTo&&(__append('\n      <a class="btn btn-link" href="'),__append(backTo.cancelUrl),__append('">'),__append(backTo.cancelLabel),__append("</a>\n      ")),__append("\n    </div>\n  </div>\n</form>\n");return __output.join("")}});