define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="osh-entries-form osh-nearMisses-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      '),editMode||(__append('\n        <div class="checkbox" style="margin-bottom: 15px">\n          <label class="control-label">\n            <input id="'),__append(id("anonymous")),__append('" type="checkbox" name="anonymous" value="true">\n            '),__append(t("PROPERTY:anonymous")),__append("\n          </label>\n        </div>\n      ")),__append("\n      "),__append(helpers.formGroup({name:"subject",label:"PROPERTY:",required:!0,maxLength:150})),__append('\n      <div class="row">\n        '),__append(helpers.formGroup({name:"creator",type:"static",label:"FORM:",groupClassName:"col-lg-4",value:user.getLabel()})),__append("\n        "),__append(helpers.formGroup({name:"userWorkplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"userDivision",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n      </div>\n      <div class="panel panel-danger">\n        <div class="panel-heading">'),__append(t("FORM:subtitle")),__append('</div>\n        <div class="panel-body has-lastElementRow">\n          <div class="form-group">\n            <label class="control-label">'),__append(t("PROPERTY:kind")),__append("</label>\n            <br>\n            "),kinds.forEach(e=>{__append('\n            <label class="radio-inline" title="'),__append(escapeFn(e.title)),__append('">\n              <input name="kind" type="radio" value="'),__append(e.value),__append('">\n              '),__append(escapeFn(e.label)),__append("\n            </label>\n            ")}),__append('\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"workplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n            "),__append(helpers.formGroup({name:"division",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n            "),__append(helpers.formGroup({name:"building",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"location",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n            <div class="form-group col-lg-8">\n              <label for="'),__append(id("eventDate")),__append('" class="control-label is-required">'),__append(t("PROPERTY:eventDate")),__append('</label>\n              <div class=" form-group-datetime">\n                <input id="'),__append(id("eventDate")),__append('" class="form-control" name="eventDate" type="date" required min="'),__append(window.PRODUCTION_DATA_START_DATE||"2020-01-01"),__append('" max="'),__append(today),__append('">\n                <input id="'),__append(id("eventTime")),__append('" class="form-control no-controls" name="eventTime" type="number" min="0" max="23" placeholder="'),__append(t("FORM:eventTime:placeholder")),__append('" title="'),__append(t("FORM:eventTime:title")),__append('">\n              </div>\n            </div>\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"eventCategory",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n            "),__append(helpers.formGroup({name:"reasonCategory",type:"select2",label:"PROPERTY:",groupClassName:"col-lg-4"})),__append('\n          </div>\n          <div class="row">\n            '),__append(helpers.formGroup({name:"problem",type:"textarea",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4",rows:5})),__append("\n            "),__append(helpers.formGroup({name:"reason",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-4",rows:5})),__append("\n            "),__append(helpers.formGroup({name:"suggestion",type:"textarea",label:"PROPERTY:",groupClassName:"col-lg-4",rows:5})),__append('\n          </div>\n          <div class="row">\n            '),editMode?(__append("\n              "),__append(helpers.formGroup({name:"implementer",type:"select2",label:"PROPERTY:",required:"inProgress"===model.status||"finished"===model.status,groupClassName:"col-lg-4"})),__append("\n            ")):(__append('\n              <div class="form-group col-lg-4">\n                <label class="control-label">'),__append(t("PROPERTY:implementer")),__append('</label>\n                <br>\n                <label class="checkbox-inline">\n                  <input id="'),__append(id("selfImplement")),__append('" name="selfImplement" type="checkbox" value="true">\n                  '),__append(t("FORM:selfImplement")),__append("\n                </label>\n              </div>\n            ")),__append("\n            "),__append(helpers.formGroup({name:"plannedAt",type:"date",label:"FORM:",required:"inProgress"===model.status||"finished"===model.status,groupClassName:"col-lg-4"})),__append('\n            <div class="col-lg-4 form-group">\n              <label class="control-label">'),__append(t("PROPERTY:priority")),__append("</label>\n              <br>\n              "),priorities.forEach(e=>{__append('\n                <label class="radio-inline">\n                  <input name="priority" type="radio" value="'),__append(e.value),__append('">\n                  '),__append(e.label),__append("\n                </label>\n              ")}),__append("\n            </div>\n          </div>\n          "),resolutionTypes.length&&(__append('\n            <div class="row">\n              <div class="col-lg-4 form-group">\n                <label class="control-label '),__append("new"===model.status?"":"is-required"),__append('">'),__append(t("PROPERTY:resolution")),__append("</label>\n                "),resolutionTypes.forEach(e=>{__append('\n                  <div class="radio">\n                    <label>\n                      <input type="radio" name="resolution.type" value="'),__append(e),__append('" '),__append("new"===model.status?"":"required"),__append(" "),__append(can.editResolutionType?"":"disabled"),__append(">\n                      "),__append(t(`resolution:desc:${e}`)),__append("\n                    </label>\n                  </div>\n                ")}),__append('\n              </div>\n              <div id="'),__append(id("resolutionGroup")),__append('" class="col-lg-4 form-group osh-nearMisses-form-resolutionId">\n                <label for="'),__append(id("resolutionId")),__append('" class="control-label">'),__append(t("FORM:resolution:unspecified")),__append('</label>\n                <div class="input-group">\n                  <input id="'),__append(id("resolutionId")),__append('" name="resolution._id" class="form-control" type="text" pattern="^[0-9]{1,7}$" maxlength="7">\n                  <span class="input-group-btn">\n                    <button id="'),__append(id("showResolution")),__append('" type="button" class="btn btn-default" title="'),__append(t("FORM:resolution:show")),__append('"><i class="fa fa-info"></i></button>\n                    <button id="'),__append(id("addResolution")),__append('" type="button" class="btn btn-default" title="'),__append(t("FORM:resolution:add")),__append('"><i class="fa fa-plus"></i></button>\n                  </span>\n                </div>\n              </div>\n            </div>\n          ')),__append("\n        </div>\n      </div>\n      "),editMode?(__append("\n        "),__append(helpers.formGroup({name:"attachments",type:"file",label:"PROPERTY:",accept:".txt,.pdf,.docx,.xlsx,.png,.jpeg,.jpg,.tiff,.webp,.mp4",multiple:!0})),__append("\n        "),__append(helpers.formGroup({name:"comment",type:"textarea",label:"PROPERTY:",rows:3})),__append("\n      ")):(__append("\n        "),__append(helpers.formGroup({name:"attachments",type:"file",label:"PROPERTY:photos",accept:".png,.jpeg,.jpg,.tiff,.webp",multiple:!0})),__append("\n      ")),__append('\n    </div>\n    <div class="form-actions">\n      <button id="'),__append(id("save")),__append('" type="submit" class="btn btn-primary"><i class="fa '),__append(editMode?"fa-save":"fa-plus"),__append('"></i><span>'),__append(formActionText),__append("</span></button>\n      "),editMode&&(__append("\n        "),can.inProgress&&(__append('<button id="'),__append(id("inProgress")),__append('" type="button" class="btn btn-info"><i class="fa fa-check"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:inProgress")),__append("</span></button>")),__append("\n        "),can.paused&&(__append('<button id="'),__append(id("paused")),__append('" type="button" class="btn btn-warning"><i class="fa fa-hourglass-o"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:paused")),__append("</span></button>")),__append("\n        "),can.cancelled&&(__append('<button id="'),__append(id("cancelled")),__append('" type="button" class="btn btn-danger"><i class="fa fa-ban"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:cancelled")),__append("</span></button>")),__append("\n      ")),__append("\n    </div>\n  </div>\n</form>\n");return __output}});