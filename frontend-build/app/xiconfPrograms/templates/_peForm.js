define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-pe">\n  <div class="panel-heading is-with-actions">\n    <span class="xiconfPrograms-form-stepNo">0.</span> '),__append(helpers.t("step:pe")),__append("\n    "),function(){__append('<div class="panel-actions">\n  <button class="btn btn-default" type="button" role="moveStepUp"><i class="fa fa-arrow-up"></i></button>\n  <button class="btn btn-default" type="button" role="moveStepDown"><i class="fa fa-arrow-down"></i></button>\n  <button class="btn btn-danger" type="button" role="removeStep"><i class="fa fa-times"></i></button>\n</div>')}.call(this),__append("\n  </div>\n  "),"t24vdc"===programType&&(__append('\n  <div class="panel-body has-lastElementRow">\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-startTime" class="control-label is-required">'),__append(helpers.t("PROPERTY:startTime")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-startTime" class="form-control xiconfPrograms-form-duration" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].startTime" value="2s" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-duration" class="control-label is-required">'),__append(helpers.t("PROPERTY:duration")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-duration" class="form-control xiconfPrograms-form-duration" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].duration" value="3s" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-totalTime" class="control-label">'),__append(helpers.t("PROPERTY:totalTime")),__append('</label>\n        <p class="form-control-static xiconfPrograms-form-totalTime">5s</p>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-voltage" class="control-label is-required">'),__append(helpers.t("PROPERTY:voltage")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-voltage" class="form-control" type="number" name="steps['),__append(stepIndex),__append('].voltage" min="0.1" max="99.9" step="0.1" value="10" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-resistanceMax" class="control-label is-required">'),__append(helpers.t("PROPERTY:resistance:max")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-resistanceMax" class="form-control" type="number" name="steps['),__append(stepIndex),__append('].resistanceMax" min="0.001" step="0.001" value="1" required>\n      </div>\n    </div>\n  </div>\n  ')),__append("\n  "),"glp2"===programType&&(__append('\n  <div class="panel-body">\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-label" class="control-label is-required">'),__append(helpers.t("PROPERTY:label")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-label" class="form-control" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].label" value="'),__append(helpers.t("step:pe")),__append('" required maxlength="32">\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-duration" class="control-label is-required">'),__append(helpers.t("PROPERTY:duration")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-duration" class="form-control xiconfPrograms-form-duration" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].duration" value="1s" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-setValue" class="control-label is-required">'),__append(helpers.t("PROPERTY:resistance:max")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-setValue" class="form-control" type="number" name="steps['),__append(stepIndex),__append('].setValue" min="0.01" max="3.00" step="0.01" value="0.2" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-ipr" class="control-label is-required">'),__append(helpers.t("PROPERTY:current")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-ipr" class="form-control" type="number" name="steps['),__append(stepIndex),__append('].ipr" min="1" max="30" step="1" value="10" required>\n      </div>\n    </div>\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-u" class="control-label is-required">'),__append(helpers.t("PROPERTY:voltage")),__append('</label>\n      <div class="radio-inline-group">\n        <label class="radio-inline"><input type="radio" name="steps['),__append(stepIndex),__append('].u" value="6" required> 6</label>\n        <label class="radio-inline"><input type="radio" name="steps['),__append(stepIndex),__append('].u" value="12" checked required> 12</label>\n      </div>\n    </div>\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-u" class="control-label is-required">'),__append(helpers.t("PROPERTY:buzzer")),__append('</label>\n      <div class="radio-inline-group">\n        <label class="radio-inline"><input type="radio" name="steps['),__append(stepIndex),__append('].buzzer" value="0" checked required> '),__append(helpers.t("PROPERTY:buzzer:0")),__append('</label>\n        <label class="radio-inline"><input type="radio" name="steps['),__append(stepIndex),__append('].buzzer" value="1" required> '),__append(helpers.t("PROPERTY:buzzer:1")),__append('</label>\n      </div>\n    </div>\n  </div>\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].directConnection" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].startOnTouch" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].multi" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].setProbe" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].retries" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].cancelOnFailure" value="1">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].minSetValue" value="0">\n  ')),__append('\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].type" value="pe">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].enabled" value="1">\n</div>\n');return __output.join("")}});