define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="prodShifts-editForm" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',escape(formMethod),'">\n  <div class="panel panel-primary">\n    <div class="panel-heading">',panelTitleText,'</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-master" class="control-label">',t("prodShifts","PROPERTY:master"),'</label>\n          <input id="',idPrefix,'-master" type="text" name="master" placeholder="',t("prodShifts","FORM:PLACEHOLDER:personnel"),'">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-leader" class="control-label">',t("prodShifts","PROPERTY:leader"),'</label>\n          <input id="',idPrefix,'-leader" type="text" name="leader" placeholder="',t("prodShifts","FORM:PLACEHOLDER:personnel"),'">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="',idPrefix,'-operator" class="control-label">',t("prodShifts","PROPERTY:operator"),'</label>\n          <input id="',idPrefix,'-operator" type="text" name="operator" placeholder="',t("prodShifts","FORM:PLACEHOLDER:personnel"),'">\n        </div>\n      </div>\n      <div class="form-group">\n        <label class="control-label">',t("prodShifts","PROPERTY:quantitiesDone"),'</label>\n        <table class="table table-bordered table-condensed prodShifts-editForm-quantitiesDone">\n          <thead>\n            <tr>\n              <th>',t("prodShifts","PROPERTY:quantitiesDone:hour"),"</th>\n              <th>",t("prodShifts","PROPERTY:quantitiesDone:planned"),"</th>\n              <th>",t("prodShifts","PROPERTY:quantitiesDone:actual"),"</th>\n            </tr>\n          </thead>\n          <tbody>\n            ");for(var e=0;8>e;++e)buf.push("\n            <tr>\n              <td>",e+1,'.</td>\n              <td><input class="form-control" type="number" name="quantitiesDone[',e,'].planned" value="0" min="0"></td>\n              <td><input class="form-control" type="number" name="quantitiesDone[',e,'].actual" value="0" min="0"></td>\n            </tr>\n            ');buf.push('\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">',formActionText,"</button>\n    </div>\n  </div>\n</form>\n")}();return buf.join("")}});