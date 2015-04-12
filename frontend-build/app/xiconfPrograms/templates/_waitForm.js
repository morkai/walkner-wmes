define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-wait">\n  <div class="panel-heading is-with-actions">\n    <span class="xiconfPrograms-form-stepNo">0.</span> '),__output.push(t("xiconfPrograms","step:wait")),__output.push("\n    "),function(){__output.push('<div class="panel-actions">\n  <button class="btn btn-default" type="button" role="moveStepUp"><i class="fa fa-arrow-up"></i></button>\n  <button class="btn btn-default" type="button" role="moveStepDown"><i class="fa fa-arrow-down"></i></button>\n  <button class="btn btn-danger" type="button" role="removeStep"><i class="fa fa-times"></i></button>\n</div>')}(),__output.push('\n  </div>\n  <div class="panel-body">\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-duration" class="control-label">'),__output.push(t("xiconfPrograms","PROPERTY:waitKind")),__output.push('</label>\n        <div class="radio">\n          <label>\n            <input type="radio" class="programs-form-waitKind" name="steps['),__output.push(stepIndex),__output.push('].kind" value="manual"> '),__output.push(t("xiconfPrograms","PROPERTY:waitKind:manual")),__output.push('\n          </label>\n        </div>\n        <div class="radio">\n          <label>\n            <input type="radio" class="programs-form-waitKind" name="steps['),__output.push(stepIndex),__output.push('].kind" value="auto" checked> '),__output.push(t("xiconfPrograms","PROPERTY:waitKind:auto")),__output.push('\n          </label>\n        </div>\n        <input id="'),__output.push(idPrefix),__output.push('-duration" class="form-control xiconfPrograms-form-duration xiconfPrograms-form-waitDuration" type="text" name="steps['),__output.push(stepIndex),__output.push('].duration" value="2s" required>\n      </div>\n    </div>\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__output.push(idPrefix),__output.push('-voltage" class="control-label is-required">'),__output.push(t("xiconfPrograms","PROPERTY:voltage")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-voltage" class="form-control" type="number" name="steps['),__output.push(stepIndex),__output.push('].voltage" min="0" max="99.9" step="0.1" value="0" required>\n      </div>\n    </div>\n  </div>\n  <input type="hidden" name="steps['),__output.push(stepIndex),__output.push('].type" value="wait">\n</div>\n');return __output.join("")}});