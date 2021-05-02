define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="osh-entries-form osh-kaizens-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      '),__append(helpers.formGroup({name:"subject",label:"PROPERTY:",required:!0,maxLength:150})),__append('\n      <div class="row">\n        '),__append(helpers.formGroup({name:"creator",type:"static",label:"FORM:",groupClassName:"col-lg-4",value:editMode?model.creator.label:user.getLabel()})),__append("\n        "),__append(helpers.formGroup({name:"userWorkplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"userDepartment",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n      </div>\n      <div class="panel panel-success">\n        <div class="panel-heading">'),__append(t("FORM:subtitle")),__append('</div>\n        <div class="panel-body has-lastElementRow">\n          '),relation&&model.kind||(__append('\n            <div class="form-group">\n              <label class="control-label">'),__append(t("PROPERTY:kind")),__append("</label>\n              <br>\n              "),kinds.forEach(e=>{__append('\n              <label class="radio-inline" title="'),__append(escapeFn(e.title)),__append('">\n                <input name="kind" type="radio" value="'),__append(e.value),__append('">\n                '),__append(escapeFn(e.label)),__append("\n              </label>\n              ")}),__append("\n            </div>\n          ")),__append("\n          "),relation||(__append('\n            <div class="row">\n              '),__append(helpers.formGroup({name:"workplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n              "),__append(helpers.formGroup({name:"department",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n            </div>\n            <div class="row">\n              '),__append(helpers.formGroup({name:"building",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n              "),__append(helpers.formGroup({name:"location",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n              "),__append(helpers.formGroup({name:"station",type:"select2",label:"PROPERTY:",groupClassName:"col-lg-4"})),__append("\n            </div>\n          ")),__append('\n          <div class="row">\n            '),__append(helpers.formGroup({name:"kaizenCategory",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"implementers",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n            "),relation&&"nearMiss"===relation.getModelType()||(__append("\n              "),__append(helpers.formGroup({name:"plannedAt",type:"date",label:"FORM:",required:!0,groupClassName:"col-lg-4"})),__append("\n            ")),__append('\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"problem",type:"textarea",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4",rows:4})),__append("\n            "),__append(helpers.formGroup({name:"reason",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-4",rows:4})),__append("\n            "),__append(helpers.formGroup({name:"suggestion",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-4",required:!0,rows:4})),__append("\n          </div>\n          "),editMode&&(__append('\n            <div class="row">\n              <div class="col-lg-12 form-group">\n                '),__append(helpers.formGroup({name:"solution",type:"textarea",label:"PROPERTY:",rows:4})),__append("\n              </div>\n            </div>\n          ")),__append("\n          "),"verification"!==model.status&&"finished"!==model.status||(__append('\n            <div class="row">\n              <div class="col-lg-4 form-group">\n                <div class="checkbox">\n                  <label class="control-label">\n                    <input type="checkbox" name="kom" value="true">\n                    '),__append(t("PROPERTY:kom")),__append("\n                  </label>\n                </div>\n              </div>\n            </div>\n          ")),__append("\n        </div>\n      </div>\n      "),editMode?(__append('\n        <div class="row">\n          '),__append(helpers.formGroup({name:"attachments.before",type:"file",label:"FORM:attachments:before:edit",accept:".png,.jpeg,.jpg,.tiff,.webp",multiple:!0,groupClassName:"col-lg-4",inputAttrs:{"data-max":2}})),__append("\n          "),__append(helpers.formGroup({name:"attachments.after",type:"file",label:"FORM:attachments:after",accept:".png,.jpeg,.jpg,.tiff,.webp",multiple:!0,groupClassName:"col-lg-4",inputAttrs:{"data-max":2}})),__append("\n          "),__append(helpers.formGroup({name:"attachments.other",type:"file",label:"FORM:attachments:other",accept:".txt,.pdf,.docx,.xlsx,.png,.jpeg,.jpg,.tiff,.webp,.mp4",multiple:!0,groupClassName:"col-lg-4",inputAttrs:{"data-max":4}})),__append("\n        </div>\n        "),__append(helpers.formGroup({name:"comment",type:"textarea",label:"PROPERTY:",rows:3})),__append("\n      ")):(__append("\n        "),__append(helpers.formGroup({name:"attachments.before",type:"file",label:"FORM:attachments:before:add",accept:".png,.jpeg,.jpg,.tiff,.webp",multiple:!0,inputAttrs:{"data-max":2}})),__append("\n      ")),__append('\n    </div>\n    <div class="form-actions">\n      <button id="'),__append(id("save")),__append('" type="submit" class="btn btn-primary" title="'),__append(editMode?t("wmes-osh-common","FORM:ACTION:title:edit"):""),__append('">\n        '),editMode?(__append('\n          <i class="fa fa-save"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:edit")),__append("</span>\n        ")):(__append('\n          <i class="fa fa-plus"></i><span>'),__append(t("FORM:ACTION:add")),__append("</span>\n        ")),__append("\n      </button>\n      "),editMode&&(__append("\n        "),can.inProgress&&(__append('\n          <button id="'),__append(id("inProgress")),__append('" type="button" class="btn btn-info" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:inProgress")})),__append('">\n            '),"verification"===model.status?(__append('\n              <i class="fa fa-thumbs-down"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:correction")),__append("</span>\n            ")):(__append('\n              <i class="fa fa-check"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:inProgress")),__append("</span>\n            ")),__append("\n          </button>\n        ")),__append("\n        "),can.verification&&(__append('\n          <button id="'),__append(id("verification")),__append('" type="button" class="btn btn-secondary" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:verification")})),__append('">\n            <i class="fa fa-gavel"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:verification")),__append("</span>\n          </button>\n        ")),__append("\n        "),can.finished&&(__append('\n          <button id="'),__append(id("finished")),__append('" type="button" class="btn btn-success" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:finished")})),__append('">\n            <i class="fa fa-thumbs-up"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:finished")),__append("</span>\n          </button>\n        ")),__append("\n        "),can.paused&&(__append('\n          <button id="'),__append(id("paused")),__append('" type="button" class="btn btn-warning" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:paused")})),__append('">\n            <i class="fa fa-hourglass-o"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:paused")),__append("</span>\n          </button>\n        ")),__append("\n        "),can.cancelled&&(__append('\n          <button id="'),__append(id("cancelled")),__append('" type="button" class="btn btn-danger" title="'),__append(t("wmes-osh-common","FORM:ACTION:title:status",{status:t("wmes-osh-common","status:cancelled")})),__append('">\n            <i class="fa fa-ban"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:cancelled")),__append("</span>\n          </button>\n        ")),__append("\n      ")),__append('\n      <button id="'),__append(id("cancel")),__append('" type="button" class="btn btn-link" title="'),__append(t("wmes-osh-common",`FORM:ACTION:title:cancel:${editMode?"edit":"add"}`)),__append('">\n        '),__append(t("wmes-osh-common",`FORM:ACTION:cancel:${editMode?"edit":"add"}`)),__append("\n      </button>\n    </div>\n  </div>\n</form>\n");return __output}});