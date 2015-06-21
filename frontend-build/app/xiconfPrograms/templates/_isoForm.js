define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-iso xiconfPrograms-stepPanel-glp2">\n  <div class="panel-heading is-with-actions">\n    <span class="xiconfPrograms-form-stepNo">0.</span> '),__output.push(t("xiconfPrograms","step:iso")),__output.push("\n    "),function(){__output.push('<div class="panel-actions">\n  <button class="btn btn-default" type="button" role="moveStepUp"><i class="fa fa-arrow-up"></i></button>\n  <button class="btn btn-default" type="button" role="moveStepDown"><i class="fa fa-arrow-down"></i></button>\n  <button class="btn btn-danger" type="button" role="removeStep"><i class="fa fa-times"></i></button>\n</div>')}(),__output.push('\n  </div>\n  <div class="panel-body has-lastElementRow">\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-label" class="control-label is-required">'),__output.push(t("xiconfPrograms","PROPERTY:label")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-label" class="form-control" type="text" name="steps['),__output.push(stepIndex),__output.push('].label" value="'),__output.push(t("xiconfPrograms","step:iso")),__output.push('" required maxlength="32">\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-startTime" class="control-label is-required">'),__output.push(t("xiconfPrograms","PROPERTY:startTime")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-startTime" class="form-control xiconfPrograms-form-duration" type="text" name="steps['),__output.push(stepIndex),__output.push('].startTime" value="0s" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-duration" class="control-label is-required">'),__output.push(t("xiconfPrograms","PROPERTY:duration")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-duration" class="form-control xiconfPrograms-form-duration" type="text" name="steps['),__output.push(stepIndex),__output.push('].duration" value="1s" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-totalTime" class="control-label">'),__output.push(t("xiconfPrograms","PROPERTY:totalTime")),__output.push('</label>\n        <p class="form-control-static xiconfPrograms-form-totalTime">1s</p>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-mode" class="control-label is-required">'),__output.push(t("xiconfPrograms","PROPERTY:mode")),__output.push('</label>\n        <select id="'),__output.push(idPrefix),__output.push('-mode" class="form-control xiconfPrograms-form-glp2-mode" name="steps['),__output.push(stepIndex),__output.push('].mode">\n          <option value="0" data-label="glp2:iso:mode:0:label" data-min="1.0" data-max="500.0" data-step="0.1" selected>'),__output.push(t("xiconfPrograms","glp2:iso:mode:0")),__output.push('</option>\n          <option value="1" data-label="glp2:iso:mode:1:label" data-min="0.001" data-max="3.000" data-step="0.001">'),__output.push(t("xiconfPrograms","glp2:iso:mode:1")),__output.push('</option>\n          <option value="2" data-label="glp2:iso:mode:2:label" data-min="10" data-max="1000" data-step="1">'),__output.push(t("xiconfPrograms","glp2:iso:mode:2")),__output.push('</option>\n        </select>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-setValue" class="control-label is-required">'),__output.push(t("xiconfPrograms","glp2:iso:mode:0:label")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-setValue" class="form-control xiconfPrograms-form-glp2-setValue" type="number" name="steps['),__output.push(stepIndex),__output.push('].setValue" min="1.0" max="500.0" step="0.1" value="2" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-u" class="control-label is-required">'),__output.push(t("xiconfPrograms","glp2:iso:u")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-u" class="form-control" type="number" name="steps['),__output.push(stepIndex),__output.push('].u" min="100" max="1000" step="1" value="500" required>\n      </div>\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-rMax" class="control-label is-required">'),__output.push(t("xiconfPrograms","glp2:iso:rMax")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-rMax" class="form-control" type="number" name="steps['),__output.push(stepIndex),__output.push('].rMax" min="0" max="500" step="1" value="0" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-ramp" class="control-label is-required">'),__output.push(t("xiconfPrograms","glp2:iso:ramp")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-ramp" class="form-control xiconfPrograms-form-duration" type="text" name="steps['),__output.push(stepIndex),__output.push('].ramp" data-min="0" data-max="60" value="0s" required>\n      </div>\n    </div>\n  </div>\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].probe" value="0">\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].connection" value="1">\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].retries" value="0">\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].cancelOnFailure" value="1">\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].enabled" value="1">\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].multi" value="0">\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].minSetValue" value="0">\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].type" value="iso">\n</div>\n');return __output.join("")}});