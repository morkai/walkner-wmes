define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="osh-entries-form osh-observations-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      '),editMode||(__append('\n        <div class="form-group">\n          <label class="control-label">'),__append(t("PROPERTY:observationKind")),__append("</label>\n          "),kinds.forEach((e,n)=>{__append("\n            "),(kinds.length>5||0===n)&&__append("\n              <br>\n            "),__append('\n            <label class="radio-inline" title="'),__append(escapeFn(e.title)),__append('">\n              <input name="observationKind" type="radio" value="'),__append(e.value),__append('">\n              '),__append(escapeFn(e.label)),__append("\n            </label>\n          ")}),__append("\n        </div>\n        <hr>\n      ")),__append('\n      <div class="row">\n        '),__append(helpers.formGroup({name:"creator",type:"static",label:"PROPERTY:",groupClassName:"col-lg-4",value:user.getLabel()})),__append("\n        "),__append(helpers.formGroup({name:"userWorkplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"userDepartment",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n      </div>\n      <div class="row">\n        <div class="col-lg-4 form-group">\n          <label for="'),__append(id("date")),__append('" class="control-label is-required">'),__append(t("PROPERTY:date")),__append('</label>\n          <div class=" form-group-datetime">\n            <input id="'),__append(id("date")),__append('" class="form-control" name="date" type="date" required min="'),__append(window.PRODUCTION_DATA_START_DATE||"2020-01-01"),__append('" max="'),__append(today),__append('">\n            <input id="'),__append(id("time")),__append('" class="form-control no-controls" name="time" type="number" min="0" max="23" placeholder="'),__append(t("FORM:time:placeholder")),__append('" title="'),__append(t("FORM:time:title")),__append('">\n          </div>\n        </div>\n        '),__append(helpers.formGroup({name:"company",type:"select2",label:"FORM:company:label",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"companyName",label:"FORM:company:name",required:!0,groupClassName:"col-lg-4"})),__append("\n      </div>\n      <hr>\n      <h4>"),__append(t("PROPERTY:locationPath")),__append('</h4>\n      <div class="row">\n        '),__append(helpers.formGroup({name:"workplace",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"department",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append('\n      </div>\n      <div class="row">\n        '),__append(helpers.formGroup({name:"building",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"location",type:"select2",label:"PROPERTY:",required:!0,groupClassName:"col-lg-4"})),__append("\n        "),__append(helpers.formGroup({name:"station",type:"select2",label:"PROPERTY:",groupClassName:"col-lg-4"})),__append("\n      </div>\n      <hr>\n      <h4>"),__append(t("PROPERTY:behaviors")),__append('</h4>\n      <div class="is-colored">\n        <div class="table-responsive">\n          <table class="table table-bordered table-condensed table-hover">\n            <thead>\n            <tr>\n              <th>'),__append(t("PROPERTY:behaviors.category")),__append('</th>\n              <th class="is-min osh-observations-form-safe">'),__append(t("PROPERTY:behaviors.safe")),__append('</th>\n              <th class="is-min osh-observations-form-safe">'),__append(t("PROPERTY:behaviors.risky")),__append('</th>\n              <th class="osh-observations-form-textarea">'),__append(t("PROPERTY:behaviors.what")),__append('</th>\n              <th class="osh-observations-form-textarea">'),__append(t("PROPERTY:behaviors.why")),__append('</th>\n              <th class="is-min osh-observations-form-easy">'),__append(t("PROPERTY:behaviors.easy")),__append('</th>\n              <th class="is-min osh-observations-form-easy">'),__append(t("PROPERTY:behaviors.hard")),__append('</th>\n              <th class="osh-observations-form-resolution">'),__append(t("PROPERTY:behaviors.resolution")),__append('</th>\n            </tr>\n            </thead>\n            <tbody id="'),__append(id("behaviors")),__append('" class="osh-observations-categories" data-observations-prop="behaviors"></tbody>\n          </table>\n        </div>\n      </div>\n      <div id="'),__append(id("easyConfirmed")),__append('" class="checkbox osh-observations-form-easyConfirmed">\n        <label>\n          <input type="checkbox" name="easyConfirmed" value="true">\n          '),__append(t("easyConfirmed")),__append("\n        </label>\n      </div>\n      <hr>\n      <h4>"),__append(t("PROPERTY:workConditions")),__append('</h4>\n      <div class="is-colored">\n        <div class="table-responsive">\n          <table class="table table-bordered table-condensed table-hover">\n            <thead>\n            <tr>\n              <th>'),__append(t("PROPERTY:workConditions.category")),__append('</th>\n              <th class="is-min osh-observations-form-safe">'),__append(t("PROPERTY:workConditions.risky")),__append('</th>\n              <th class="osh-observations-form-textarea">'),__append(t("PROPERTY:workConditions.what")),__append('</th>\n              <th class="osh-observations-form-textarea">'),__append(t("PROPERTY:workConditions.why")),__append('</th>\n              <th class="is-min osh-observations-form-easy">'),__append(t("PROPERTY:workConditions.easy")),__append('</th>\n              <th class="is-min osh-observations-form-easy">'),__append(t("PROPERTY:workConditions.hard")),__append('</th>\n              <th class="osh-observations-form-resolution">'),__append(t("PROPERTY:workConditions.resolution")),__append('</th>\n            </tr>\n            </thead>\n            <tbody id="'),__append(id("workConditions")),__append('" class="osh-observations-categories" data-observations-prop="workConditions"></tbody>\n          </table>\n        </div>\n      </div>\n      <hr>\n      '),__append(helpers.formGroup({name:"attachments.other",type:"file",label:"PROPERTY:attachments",accept:".txt,.pdf,.docx,.xlsx,.png,.jpeg,.jpg,.tiff,.webp,.mp4",multiple:!0,inputAttrs:{"data-max":4}})),__append("\n      "),editMode&&(__append("\n        "),__append(helpers.formGroup({name:"comment",type:"textarea",label:"PROPERTY:",rows:3})),__append("\n      ")),__append('\n    </div>\n    <div class="form-actions">\n      <button id="'),__append(id("save")),__append('" type="submit" class="btn btn-primary">\n        '),editMode?(__append('\n          <i class="fa fa-save"></i><span>'),__append(t("wmes-osh-common","FORM:ACTION:edit")),__append("</span>\n        ")):(__append('\n          <i class="fa fa-plus"></i><span>'),__append(t("FORM:ACTION:add")),__append("</span>\n        ")),__append("\n      </button>\n    </div>\n  </div>\n</form>\n");return __output}});