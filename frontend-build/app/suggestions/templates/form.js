define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="suggestions-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div id="'),__append(id("statusGroup")),__append('" class="form-group clearfix">\n        <label for="'),__append(id("status")),__append('" class="control-label">'),__append(t("PROPERTY:status")),__append('</label>\n        <div id="'),__append(id("status")),__append('" class="btn-group suggestions-form-statusBtnGroup" data-toggle="buttons">\n          '),statuses.concat("kom").forEach(function(e){__append('\n          <label class="btn btn-default">\n            <input type="radio" name="status" value="'),__append(e),__append('">'),__append(t("status:"+e)),__append("\n          </label>\n          ")}),__append('\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("subject")),__append('" class="control-label is-required">'),__append(t("PROPERTY:subject")),__append('</label>\n        <input id="'),__append(id("subject")),__append('" class="form-control" type="text" autocomplete="new-password" name="subject" required placeholder="'),__append(t("FORM:help:subject")),__append('">\n      </div>\n      <div class="row">\n        <div class="form-group col-lg-4 has-required-select2">\n          <label for="'),__append(id("section")),__append('" class="control-label is-required">'),__append(t("PROPERTY:section")),__append('</label>\n          <input id="'),__append(id("section")),__append('" type="text" autocomplete="new-password" name="section" required placeholder="'),__append(t("FORM:help:section")),__append('">\n        </div>\n        <div class="form-group col-lg-4 has-required-select2">\n          <label for="'),__append(id("confirmer")),__append('" class="control-label is-required is-required-first-child" style="display: flex">\n            <span>'),__append(t("PROPERTY:confirmer")),__append('</span>\n            <a id="'),__append(id("confirmer-other")),__append('" href="javascript:void(0)" style="margin-left: auto">'),__append(t("FORM:confirmer:other")),__append('</a>\n          </label>\n          <input id="'),__append(id("confirmer")),__append('" type="text" autocomplete="new-password" name="confirmer" required>\n        </div>\n        <div class="form-group col-lg-4 has-required-select2">\n          <label for="'),__append(id("superior")),__append('" class="control-label is-required">'),__append(t("PROPERTY:superior")),__append('</label>\n          <input id="'),__append(id("superior")),__append('" type="text" autocomplete="new-password" name="superior" required>\n        </div>\n      </div>\n      '),editMode&&(__append('\n      <div class="form-group">\n        <label class="control-label">'),__append(t("PROPERTY:coordSections")),__append('</label>\n        <table class="table table-condensed table-bordered table-hover">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("PROPERTY:coordSections:name")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:coordSections:status")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:coordSections:user")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:coordSections:time")),__append("</th>\n            <th>"),__append(t("PROPERTY:coordSections:comment")),__append('</th>\n            <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(id("coordSections")),__append('"></tbody>\n        </table>\n        <input id="'),__append(id("coordSection")),__append('" type="text">\n      </div>\n      ')),__append('\n      <div style="margin-bottom: 15px">\n      <div id="'),__append(id("panel-suggestion")),__append('" class="panel panel-warning suggestions-form-typePanel">\n        <div class="panel-heading">'),__append(t("type:suggestion")),__append('</div>\n        <div id="'),__append(id("suggestionPanelBody")),__append('" class="panel-body has-lastElementRow">\n          <div class="row">\n            <div class="col-lg-6 form-group has-required-select2">\n              <label for="'),__append(id("suggestionOwners")),__append('" class="control-label is-required">'),__append(t("PROPERTY:suggestionOwners")),__append('</label>\n              <input id="'),__append(id("suggestionOwners")),__append('" type="text" autocomplete="new-password" name="suggestionOwners" required>\n            </div>\n            <div class="col-lg-6 form-group has-required-select2">\n              <label for="'),__append(id("suggestedKaizenOwners")),__append('" class="control-label is-required">'),__append(t("PROPERTY:kaizenOwners")),__append('</label>\n              <input id="'),__append(id("suggestedKaizenOwners")),__append('" type="text" autocomplete="new-password" name="suggestedKaizenOwners" required>\n            </div>\n          </div>\n          <div class="row">\n            <div class="col-lg-2 form-group has-required-select2">\n              <label for="'),__append(id("date")),__append('" class="control-label is-required">'),__append(t("PROPERTY:date")),__append('</label>\n              <input id="'),__append(id("date")),__append('" class="form-control" type="date" name="date" required max="'),__append(today),__append('" placeholder="'),__append(t("core","placeholder:date")),__append('">\n            </div>\n          </div>\n          <div class="row">\n            <div class="col-lg-8 form-group has-required-select2">\n              <label for="'),__append(id("categories")),__append('" class="control-label is-required">'),__append(t("PROPERTY:categories")),__append('</label>\n              <input id="'),__append(id("categories")),__append('" type="text" autocomplete="new-password" name="categories" required>\n            </div>\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(id("productFamily")),__append('" class="control-label is-required-first-child" style="display: flex">\n                <span>'),__append(t("PROPERTY:productFamily")),__append('</span>\n                <a id="'),__append(id("productFamily-other")),__append('" href="javascript:void(0)" style="margin-left: auto">'),__append(t("FORM:productFamily:other")),__append('</a>\n              </label>\n              <input id="'),__append(id("productFamily")),__append('" type="text" autocomplete="new-password" name="productFamily">\n              <input id="'),__append(id("kaizenEvent")),__append('" class="form-control hidden" type="text" autocomplete="new-password" name="kaizenEvent" placeholder="'),__append(t("FORM:productFamily:kaizenEvent")),__append('">\n            </div>\n          </div>\n          <div class="row">\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(id("howItIs")),__append('" class="control-label is-required">'),__append(t("PROPERTY:howItIs")),__append('</label>\n              <textarea id="'),__append(id("howItIs")),__append('" class="form-control" name="howItIs" rows="5" required></textarea>\n            </div>\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(id("howItShouldBe")),__append('" class="control-label is-required">'),__append(t("PROPERTY:howItShouldBe")),__append('</label>\n              <textarea id="'),__append(id("howItShouldBe")),__append('" class="form-control" name="howItShouldBe" rows="5" required></textarea>\n            </div>\n            <div class="col-lg-4 form-group">\n              <label for="'),__append(id("suggestion")),__append('" class="control-label">'),__append(t("PROPERTY:suggestion")),__append('</label>\n              <textarea id="'),__append(id("suggestion")),__append('" class="form-control" name="suggestion" rows="5"></textarea>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div id="'),__append(id("panel-kaizen")),__append('" class="panel panel-success suggestions-form-typePanel">\n        <div class="panel-heading">'),__append(t("type:kaizen")),__append('</div>\n        <div class="panel-body has-lastElementRow">\n          <div id="'),__append(id("kaizenOwnersFormGroup")),__append('" class="form-group has-required-select2">\n            <label for="'),__append(id("kaizenOwners")),__append('" class="control-label is-required">'),__append(t("PROPERTY:kaizenOwners")),__append('</label>\n            <input id="'),__append(id("kaizenOwners")),__append('" type="text" autocomplete="new-password" name="kaizenOwners">\n          </div>\n          <div class="row">\n            <div class="form-group col-lg-2">\n              <label for="'),__append(id("kaizenStartDate")),__append('" class="control-label is-requiredToFinish">'),__append(t("PROPERTY:kaizenStartDate")),__append('</label>\n              <input id="'),__append(id("kaizenStartDate")),__append('" class="form-control" type="date" name="kaizenStartDate" max="'),__append(today),__append('" placeholder="'),__append(t("core","placeholder:date")),__append('">\n            </div>\n            <div class="form-group col-lg-2">\n              <label for="'),__append(id("kaizenFinishDate")),__append('" class="control-label is-requiredToFinish">'),__append(t("PROPERTY:kaizenFinishDate")),__append('</label>\n              <input id="'),__append(id("kaizenFinishDate")),__append('" class="form-control" type="date" name="kaizenFinishDate" max="'),__append(today),__append('" placeholder="'),__append(t("core","placeholder:date")),__append('">\n            </div>\n          </div>\n          <div class="row">\n            <div class="form-group col-md-4">\n              <label for="'),__append(id("kaizenImprovements")),__append('" class="control-label is-requiredToFinish">'),__append(t("PROPERTY:kaizenImprovements")),__append('</label>\n              <textarea id="'),__append(id("kaizenImprovements")),__append('" class="form-control" name="kaizenImprovements" rows="5"></textarea>\n            </div>\n            <div class="form-group col-md-4">\n              <label for="'),__append(id("kaizenEffect")),__append('" class="control-label is-requiredToFinish">'),__append(t("PROPERTY:kaizenEffect")),__append('</label>\n              <textarea id="'),__append(id("kaizenEffect")),__append('" class="form-control" name="kaizenEffect" rows="5"></textarea>\n            </div>\n          </div>\n        </div>\n      </div>\n      </div>\n      <div id="'),__append(id("resolutionsGroup")),__append('" class="form-group">\n        <label class="control-label">'),__append(t("PROPERTY:resolutions")),__append('</label>\n        <table class="table table-condensed table-bordered table-hover">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("PROPERTY:resolutions:rid")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:status")),__append("</th>\n            <th>"),__append(t("PROPERTY:resolutions:subject")),__append('</th>\n            <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(id("resolutions")),__append('"></tbody>\n        </table>\n        <div id="'),__append(id("resolutionsActions")),__append('" class="input-group suggestions-form-resolutions-actions">\n          <input id="'),__append(id("resolutionRid")),__append('" class="form-control text-mono no-controls" type="number">\n          <span class="input-group-btn">\n            <button id="'),__append(id("linkResolution")),__append('" type="button" class="btn btn-default" title="'),__append(t("resolutions:link")),__append('"><i class="fa fa-link"></i></button>\n            <button id="'),__append(id("addResolution")),__append('" type="button" class="btn btn-default" title="'),__append(t("resolutions:add")),__append('"><i class="fa fa-plus"></i></button>\n          </span>\n        </div>\n      </div>\n      <div class="row">\n        '),__append(helpers.formGroup({name:"attachments.before",type:"file",label:"FORM:attachments:before",accept:".png,.jpeg,.jpg,.webp",multiple:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"attachments.after",type:"file",label:"FORM:attachments:after",accept:".png,.jpeg,.jpg,.webp",multiple:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"attachments.other",type:"file",label:"FORM:attachments:other",accept:".txt,.pdf,.docx,.xlsx,.png,.jpeg,.jpg,.webp,.mp4,.rar,.zip,.7z",multiple:!0,groupClassName:"col-lg-4"})),__append('\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("subscribers")),__append('" class="control-label">'),__append(t("PROPERTY:subscribers")),__append('</label>\n        <input id="'),__append(id("subscribers")),__append('" type="text" autocomplete="new-password" name="subscribers">\n        <p class="help-block">'),__append(t("FORM:help:subscribers")),__append("</p>\n      </div>\n      "),editMode&&(__append('\n      <div class="form-group suggestions-form-comment">\n        <label for="'),__append(id("comment")),__append('" class="control-label">'),__append(t("PROPERTY:comment")),__append('</label>\n        <textarea id="'),__append(id("comment")),__append('" class="form-control" name="comment" rows="3"></textarea>\n      </div>\n      ')),__append('\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(id("submit")),__append('" type="submit" class="btn btn-primary">\n        <i class="fa fa-spinner fa-spin"></i>\n        <span>'),__append(backTo?backTo.submitLabel:formActionText),__append("</span>\n      </button>\n      "),backTo&&(__append('\n      <a class="btn btn-link" href="'),__append(backTo.cancelUrl),__append('">'),__append(backTo.cancelLabel),__append("</a>\n      ")),__append("\n    </div>\n  </div>\n</form>\n");return __output}});