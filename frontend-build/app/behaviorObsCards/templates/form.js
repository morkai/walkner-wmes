define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="behaviorObsCards-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="form-group col-lg-3 has-required-select2">\n          <label for="'),__append(idPrefix),__append('-observer" class="control-label is-required">'),__append(helpers.t("PROPERTY:observer")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-observer" type="text" name="observer" required>\n        </div>\n        <div class="form-group col-lg-3 has-required-select2">\n          <label for="'),__append(idPrefix),__append('-observerSection" class="control-label is-required">'),__append(helpers.t("FORM:observerSection")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-observerSection" type="text" name="observerSection" required>\n        </div>\n        <div class="form-group col-lg-3 has-required-select2">\n          <label for="'),__append(idPrefix),__append('-superior" class="control-label is-required">'),__append(helpers.t("FORM:superior")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-superior" type="text" name="superior" required>\n        </div>\n        <div class="form-group col-lg-6">\n          <label for="'),__append(idPrefix),__append('-date" class="control-label is-required">'),__append(helpers.t("PROPERTY:date")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-date" class="form-control" type="date" name="date" required min="2017-01-01" max="'),__append(time.format(Date.now(),"YYYY-MM-DD")),__append('">\n        </div>\n      </div>\n      <hr style="margin-top: 5px">\n      <h4 class="control-label">'),__append(helpers.t("PANEL:TITLE:where")),__append('</h4>\n      <div class="row">\n        <div class="form-group col-lg-3 has-required-select2">\n          <label for="'),__append(idPrefix),__append('-section" class="control-label is-required">'),__append(helpers.t("PROPERTY:section")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-section" type="text" name="section" required>\n        </div>\n        <div class="form-group col-lg-3">\n          <label for="'),__append(idPrefix),__append('-line" class="control-label">'),__append(helpers.t("PROPERTY:line")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-line" type="text" name="line">\n        </div>\n        <div class="form-group col-lg-6">\n          <label for="'),__append(idPrefix),__append('-position" class="control-label is-required">'),__append(helpers.t("PROPERTY:position")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-position" class="form-control" type="text" name="position" required>\n        </div>\n      </div>\n      <hr style="margin-top: 5px">\n      <h4 class="control-label">'),__append(helpers.t("PANEL:TITLE:observations")),__append('</h4>\n      <table class="table table-bordered table-hover table-condensed behaviorObsCards-form-observations">\n        <thead>\n        <tr>\n          <th class="is-min">'),__append(helpers.t("PROPERTY:observations:category")),__append('</th>\n          <th class="is-min text-center">'),__append(helpers.t("PROPERTY:observations:safe:true")),__append('</th>\n          <th class="is-min text-center">'),__append(helpers.t("PROPERTY:observations:safe:false")),__append('</th>\n          <th class="behaviorObsCards-form-half"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:observations:observation")),__append('</label></th>\n          <th class="behaviorObsCards-form-half"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:observations:cause")),__append('</label></th>\n          <th class="is-min text-center"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:observations:easy:true")),__append('</label></th>\n          <th class="is-min text-center"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:observations:easy:false")),__append('</label></th>\n        </tr>\n        </thead>\n        <tbody id="'),__append(idPrefix),__append('-observations"></tbody>\n      </table>\n      <button id="'),__append(idPrefix),__append('-addObservation" class="btn btn-default behaviorObsCards-form-button" type="button">\n        <i class="fa fa-plus"></i><span>'),__append(helpers.t("FORM:BTN:add")),__append('</span>\n      </button>\n      <hr>\n      <h4 class="control-label">'),__append(helpers.t("PANEL:TITLE:risks")),__append('</h4>\n      <p id="'),__append(idPrefix),__append('-nearMiss" class="message message-inline message-error">\n        <input class="behaviorObsCards-form-rid-required" name="nearMiss" type="text" tabindex="-1">\n        <span class="behaviorObsCards-form-rid-message">\n          '),model.nearMiss?(__append("\n          "),__append(helpers.t("FORM:MSG:nearMiss:edit",{rid:model.nearMiss})),__append("\n          ")):(__append("\n          "),__append(helpers.t("FORM:MSG:nearMiss:add")),__append("\n          ")),__append('\n        </span>\n      </p>\n      <table class="table table-bordered table-hover table-condensed">\n        <thead>\n        <tr>\n          <th class="behaviorObsCards-form-risk"><label class="control-label">'),__append(helpers.t("PROPERTY:risks:risk")),__append("</label></th>\n          <th>"),__append(helpers.t("PROPERTY:risks:cause")),__append('</th>\n          <th class="is-min text-center"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:risks:easy:true")),__append('</label></th>\n          <th class="is-min text-center"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:risks:easy:false")),__append('</label></th>\n        </tr>\n        </thead>\n        <tbody id="'),__append(idPrefix),__append('-risks"></tbody>\n      </table>\n      <button id="'),__append(idPrefix),__append('-addRisk" class="btn btn-default behaviorObsCards-form-button" type="button">\n        <i class="fa fa-plus"></i><span>'),__append(helpers.t("FORM:BTN:add")),__append('</span>\n      </button>\x3c!--\n      //--\x3e<button id="'),__append(idPrefix),__append('-removeRisk" class="btn btn-default behaviorObsCards-form-button" type="button">\n        <i class="fa fa-remove"></i><span>'),__append(helpers.t("FORM:BTN:remove")),__append('</span>\n      </button>\n      <hr>\n      <div class="checkbox">\n        <label class="control-label">\n          <input type="checkbox" name="easyDiscussed" value="true" required>\n          '),__append(helpers.t("PROPERTY:easyDiscussed")),__append('\n        </label>\n      </div>\n      <hr>\n      <h4 class="control-label">'),__append(helpers.t("PANEL:TITLE:difficulties")),__append('</h4>\n      <p id="'),__append(idPrefix),__append('-nearMiss" class="message message-inline message-warning">\n        <input class="behaviorObsCards-form-rid-required" name="suggestion" type="text" tabindex="-1">\n        <span class="behaviorObsCards-form-rid-message">\n          '),model.suggestion?(__append("\n          "),__append(helpers.t("FORM:MSG:suggestion:edit",{rid:model.suggestion})),__append("\n          ")):(__append("\n          "),__append(helpers.t("FORM:MSG:suggestion:add")),__append("\n          ")),__append('\n        </span>\n      </p>\n      <table class="table table-bordered table-hover table-condensed">\n        <thead>\n        <tr>\n          <th class="behaviorObsCards-form-difficulty"><label class="control-label">'),__append(helpers.t("PROPERTY:difficulties:problem")),__append("</label></th>\n          <th>"),__append(helpers.t("PROPERTY:difficulties:solution")),__append('</th>\n          <th class="is-min text-center"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:difficulties:behavior:true")),__append('</label></th>\n          <th class="is-min text-center"><label class="control-label is-required">'),__append(helpers.t("PROPERTY:difficulties:behavior:false")),__append('</label></th>\n        </tr>\n        </thead>\n        <tbody id="'),__append(idPrefix),__append('-difficulties"></tbody>\n      </table>\n      <button id="'),__append(idPrefix),__append('-addDifficulty" class="btn btn-default behaviorObsCards-form-button" type="button">\n        <i class="fa fa-plus"></i><span>'),__append(helpers.t("FORM:BTN:add")),__append('</span>\n      </button>\x3c!--\n      //--\x3e<button id="'),__append(idPrefix),__append('-removeDifficulty" class="btn btn-default behaviorObsCards-form-button" type="button">\n        <i class="fa fa-remove"></i><span>'),__append(helpers.t("FORM:BTN:remove")),__append('</span>\n      </button>\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});