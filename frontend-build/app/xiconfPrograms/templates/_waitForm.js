define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-wait">\n  <div class="panel-heading is-with-actions">\n    <span class="xiconfPrograms-form-stepNo">0.</span> '),__append(t("xiconfPrograms","step:wait")),__append("\n    "),function(){__append('<div class="panel-actions">\n  <button class="btn btn-default" type="button" role="moveStepUp"><i class="fa fa-arrow-up"></i></button>\n  <button class="btn btn-default" type="button" role="moveStepDown"><i class="fa fa-arrow-down"></i></button>\n  <button class="btn btn-danger" type="button" role="removeStep"><i class="fa fa-times"></i></button>\n</div>')}.call(this),__append('\n  </div>\n  <div class="panel-body has-lastElementRow">\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-duration" class="control-label">'),__append(t("xiconfPrograms","PROPERTY:waitKind")),__append('</label>\n        <div class="radio">\n          <label>\n            <input type="radio" class="programs-form-waitKind" name="steps['),__append(stepIndex),__append('].kind" value="manual"> '),__append(t("xiconfPrograms","PROPERTY:waitKind:manual")),__append('\n          </label>\n        </div>\n        <div class="radio">\n          <label>\n            <input type="radio" class="programs-form-waitKind" name="steps['),__append(stepIndex),__append('].kind" value="auto" checked> '),__append(t("xiconfPrograms","PROPERTY:waitKind:auto")),__append('\n          </label>\n        </div>\n        <input id="'),__append(idPrefix),__append('-duration" class="form-control xiconfPrograms-form-duration xiconfPrograms-form-waitDuration" type="text" name="steps['),__append(stepIndex),__append('].duration" value="2s" required>\n      </div>\n    </div>\n    '),"t24vdc"===programType&&(__append('\n    <div class="row">\n      <div class="form-group col-md-3">\n        <label for="'),__append(idPrefix),__append('-voltage" class="control-label is-required">'),__append(t("xiconfPrograms","PROPERTY:voltage")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-voltage" class="form-control" type="number" name="steps['),__append(stepIndex),__append('].voltage" min="0" max="99.9" step="0.1" value="0" required>\n      </div>\n    </div>\n    ')),__append("\n  </div>\n  "),"glp2"===programType&&(__append('\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].voltage" value="0">\n  ')),__append('\n  <input type="hidden" name="steps['),__append(stepIndex),__append('].type" value="wait">\n</div>\n');return __output.join("")}});