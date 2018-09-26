define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-iso xiconfPrograms-stepPanel-glp2">\n  <div class="panel-heading is-with-actions">\n    <span class="xiconfPrograms-form-stepNo">0.</span> '),__append(t("xiconfPrograms","step:iso")),__append("\n    "),function(){__append('<div class="panel-actions">\n  <button class="btn btn-default" type="button" role="moveStepUp"><i class="fa fa-arrow-up"></i></button>\n  <button class="btn btn-default" type="button" role="moveStepDown"><i class="fa fa-arrow-down"></i></button>\n  <button class="btn btn-danger" type="button" role="removeStep"><i class="fa fa-times"></i></button>\n</div>')}.call(this),__append('\n  </div>\n  <div class="panel-body has-lastElementRow">\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-label" class="control-label is-required">'),__append(t("xiconfPrograms","PROPERTY:label")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-label" class="form-control" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].label" value="'),__append(t("xiconfPrograms","step:iso")),__append('" required maxlength="32">\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-startTime" class="control-label is-required">'),__append(t("xiconfPrograms","PROPERTY:startTime")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-startTime" class="form-control xiconfPrograms-form-duration" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].startTime" value="0s" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-duration" class="control-label is-required">'),__append(t("xiconfPrograms","PROPERTY:duration")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-duration" class="form-control xiconfPrograms-form-duration" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].duration" value="1s" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-totalTime" class="control-label">'),__append(t("xiconfPrograms","PROPERTY:totalTime")),__append('</label>\n        <p class="form-control-static xiconfPrograms-form-totalTime">1s</p>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-mode" class="control-label is-required">'),__append(t("xiconfPrograms","PROPERTY:mode")),__append('</label>\n        <select id="'),__append(idPrefix),__append('-mode" class="form-control xiconfPrograms-form-glp2-mode" name="steps['),__append(stepIndex),__append('].mode" required>\n          <option value="0" data-label="glp2:iso:mode:0:label" data-min="1.0" data-max="500.0" data-step="0.1" selected>'),__append(t("xiconfPrograms","glp2:iso:mode:0")),__append('</option>\n          <option value="1" data-label="glp2:iso:mode:1:label" data-min="0.001" data-max="3.000" data-step="0.001">'),__append(t("xiconfPrograms","glp2:iso:mode:1")),__append('</option>\n          <option value="2" data-label="glp2:iso:mode:2:label" data-min="10" data-max="1000" data-step="1">'),__append(t("xiconfPrograms","glp2:iso:mode:2")),__append('</option>\n        </select>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-setValue" class="control-label is-required">'),__append(t("xiconfPrograms","glp2:iso:mode:0:label")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-setValue" class="form-control xiconfPrograms-form-glp2-setValue" type="number" name="steps['),__append(stepIndex),__append('].setValue" min="1.0" max="500.0" step="0.1" value="2" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-u" class="control-label is-required">'),__append(t("xiconfPrograms","glp2:iso:u")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-u" class="form-control" type="number" name="steps['),__append(stepIndex),__append('].u" min="100" max="1000" step="1" value="500" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-rMax" class="control-label is-required">'),__append(t("xiconfPrograms","glp2:iso:rMax")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-rMax" class="form-control" type="number" name="steps['),__append(stepIndex),__append('].rMax" min="0" max="500" step="1" value="0" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-ramp" class="control-label is-required">'),__append(t("xiconfPrograms","glp2:iso:ramp")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-ramp" class="form-control xiconfPrograms-form-duration" type="text" autocomplete="new-password" name="steps['),__append(stepIndex),__append('].ramp" data-min="0" data-max="60" value="0s" required>\n      </div>\n    </div>\n  </div>\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].probe" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].connection" value="1">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].retries" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].cancelOnFailure" value="1">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].enabled" value="1">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].multi" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].minSetValue" value="0">\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].type" value="iso">\n</div>\n');return __output.join("")}});