define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="osh-entries-form osh-actions-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      '),__append(helpers.formGroup({name:"subject",label:"PROPERTY:",required:!0,maxLength:150})),__append('\n      <div class="row">\n        '),__append(helpers.formGroup({name:"creator",type:"static",label:"FORM:",groupClassName:"col-lg-4",value:user.getLabel()})),__append("\n        "),__append(helpers.formGroup({name:"userWorkplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"userDepartment",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n      </div>\n      <div class="panel panel-info">\n        <div class="panel-heading">'),__append(t("FORM:subtitle")),__append('</div>\n        <div class="panel-body has-lastElementRow">\n          '),relation||(__append('\n            <div class="form-group">\n              <label class="control-label">'),__append(t("PROPERTY:kind")),__append("</label>\n              <br>\n              "),kinds.forEach(e=>{__append('\n              <label class="radio-inline" title="'),__append(escapeFn(e.title)),__append('">\n                <input name="kind" type="radio" value="'),__append(e.value),__append('">\n                '),__append(escapeFn(e.label)),__append("\n              </label>\n              ")}),__append('\n            </div>\n            <div class="row">\n              '),__append(helpers.formGroup({name:"workplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n              "),__append(helpers.formGroup({name:"department",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n            </div>\n            <div class="row">\n              '),__append(helpers.formGroup({name:"building",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n              "),__append(helpers.formGroup({name:"location",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n              "),__append(helpers.formGroup({name:"station",type:"select2",label:"PROPERTY:",groupClassName:"col-lg-4"})),__append("\n            </div>\n          ")),__append('\n          <div class="row">\n            '),__append(helpers.formGroup({name:"activityKind",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n          </div>\n          <div class="row hidden">\n            <div class="form-group col-lg-12">\n              <div style="display: flex">\n                <label for="'),__append(id("participants")),__append('" class="control-label is-required">'),__append(t("PROPERTY:participants")),__append('</label>\n                <div style="margin-left: auto">\n                  <a id="'),__append(id("showParticipantFinder")),__append('" href="javascript:void(0)" style="text-decoration: none">\n                    <i class="fa fa-plus"></i><span>'),__append(t("participantFinder:action")),__append('</span>\n                  </a>\n                </div>\n              </div>\n              <input id="'),__append(id("participants")),__append('" name="participants" type="text" required>\n            </div>\n          </div>\n          <div class="row hidden">\n            '),__append(helpers.formGroup({name:"implementers",type:"select2",label:"PROPERTY:",groupClassName:"col-lg-8",labelClassName:"is-required"})),__append("\n            "),__append(helpers.formGroup({name:"plannedAt",type:"date",label:"FORM:",groupClassName:"col-lg-4",labelClassName:"is-required"})),__append('\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"problem",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-4",rows:4})),__append("\n            "),__append(helpers.formGroup({name:"reason",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-4",rows:4})),__append("\n            "),__append(helpers.formGroup({name:"suggestion",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-4",rows:4})),__append('\n          </div>\n          <div id="'),__append(id("rootCausesGroup")),__append('" class="osh-actions-form-rootCauses-group hidden">\n            <label class="control-label is-required">'),__append(t("PROPERTY:rootCauses")),__append('</label>\n            <div id="'),__append(id("rootCauses")),__append('" class="osh-actions-form-rootCauses">\n              '),rootCauses.forEach((e,n)=>{__append('\n              <div class="osh-actions-form-rootCause">\n                <input type="hidden" name="rootCauses['),__append(n),__append('].category">\n                <label class="control-label">\n                  '),__append(escapeFn(e.label)),__append("\n                  "),e.description&&__append('\n                  <i class="fa fa-question-circle"></i>\n                  '),__append("\n                </label>\n                "),e.why.forEach((e,a)=>{__append('\n                <div class="osh-actions-form-rootCause-why">\n                  <label for="'),__append(id(`why-${n}-${a}`)),__append('">'),__append(a+1),__append(' Why?</label>\n                  <textarea id="'),__append(id(`why-${n}-${a}`)),__append('" name="rootCauses['),__append(n),__append("].why["),__append(a),__append(']" class="form-control" rows="2"></textarea>\n                </div>\n                ')}),__append("\n              </div>\n              ")}),__append('\n            </div>\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"solution",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-12",rows:4})),__append('\n          </div>\n          <div id="'),__append(id("resolutionsGroup")),__append('" class="osh-actions-form-resolutions-group hidden is-colored">\n            <label class="control-label">'),__append(t("PROPERTY:resolutions")),__append('</label>\n            <table class="table table-bordered table-hover table-condensed">\n              <thead>\n              <tr>\n                <th class="is-min">'),__append(t("resolutions:rid")),__append('</th>\n                <th class="is-min">'),__append(t("resolutions:status")),__append("</th>\n                <th>"),__append(t("resolutions:subject")),__append('</th>\n                <th class="is-min">'),__append(t("resolutions:implementers")),__append('</th>\n                <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n              </tr>\n              </thead>\n              <tbody id="'),__append(id("resolutions")),__append('"></tbody>\n            </table>\n            <div id="'),__append(id("resolutionsActions")),__append('" class="input-group osh-actions-form-resolutions-actions">\n              <input id="'),__append(id("resolutionRid")),__append('" class="form-control text-mono" type="text" pattern="^[akAK]-[0-9]{4}-[0-9]{1,6}$" maxlength="13">\n              <span class="input-group-btn">\n                <button id="'),__append(id("linkResolution")),__append('" type="button" class="btn btn-default" title="'),__append(t("resolutions:link")),__append('"><i class="fa fa-link"></i></button>\n                <button id="'),__append(id("addResolution")),__append('" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="'),__append(t("resolutions:add")),__append('"><i class="fa fa-plus"></i></button>\n                <ul class="dropdown-menu">\n                  <li><a id="'),__append(id("addKaizenResolution")),__append('" href="javascript:void(0)">'),__append(t("resolutions:add:kaizen")),__append('</a></li>\n                  <li><a id="'),__append(id("addActionResolution")),__append('" href="javascript:void(0)">'),__append(t("resolutions:add:action")),__append("</a></li>\n                </ul>\n              </span>\n            </div>\n          </div>\n        </div>\n      </div>\n      "),__append(helpers.formGroup({name:"attachments.other",type:"file",label:"PROPERTY:attachments",accept:".txt,.pdf,.docx,.xlsx,.png,.jpeg,.jpg,.tiff,.webp,.mp4",multiple:!0,inputAttrs:{"data-max":4}})),__append("\n      "),editMode&&(__append("\n        "),__append(helpers.formGroup({name:"comment",type:"textarea",label:"PROPERTY:",rows:3})),__append("\n      ")),__append('\n    </div>\n    <div class="form-actions">\n      <button id="'),__append(id("save")),__append('" type="submit" class="btn btn-primary" title="'),__append(editMode?t("wmes-osh-common","FORM:ACTION:title:edit"):""),__append('">\n        '),editMode?(__append('\n          <i class="fa fa-save"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:edit")),__append("</span>\n        ")):(__append('\n          <i class="fa fa-plus"></i><span>'),__append(t("FORM:ACTION:add")),__append("</span>\n        ")),__append("\n      </button>\n      "),editMode&&(__append("\n        "),can.inProgress&&(__append('\n          <button id="'),__append(id("inProgress")),__append('" type="button" class="btn btn-info" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:inProgress")})),__append('">\n            '),"verification"===model.status?(__append('\n              <i class="fa fa-thumbs-down"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:correction")),__append("</span>\n            ")):(__append('\n              <i class="fa fa-check"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:inProgress")),__append("</span>\n            ")),__append("\n          </button>\n        ")),__append("\n        "),can.verification&&(__append('\n          <button id="'),__append(id("verification")),__append('" type="button" class="btn btn-secondary" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:verification")})),__append('">\n            <i class="fa fa-gavel"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:verification")),__append("</span>\n          </button>\n        ")),__append("\n        "),can.finished&&(__append('\n          <button id="'),__append(id("finished")),__append('" type="button" class="btn btn-success" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:finished")})),__append('">\n            <i class="fa fa-thumbs-up"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:finished")),__append("</span>\n          </button>\n        ")),__append("\n        "),can.paused&&(__append('\n          <button id="'),__append(id("paused")),__append('" type="button" class="btn btn-warning" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:paused")})),__append('">\n            <i class="fa fa-hourglass-o"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:paused")),__append("</span>\n          </button>\n        ")),__append("\n        "),can.cancelled&&(__append('\n          <button id="'),__append(id("cancelled")),__append('" type="button" class="btn btn-danger" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:cancelled")})),__append('">\n            <i class="fa fa-ban"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:cancelled")),__append("</span>\n          </button>\n        ")),__append("\n      ")),__append("\n    </div>\n  </div>\n</form>\n");return __output}});