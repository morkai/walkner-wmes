define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel-body" data-tab="',metric,'">\n  ',renderColorPicker({idPrefix:idPrefix,property:"reports."+metric+".color",label:t("reports","settings:color"),value:colors[metric]}),"\n  "+function(){var e=[];return e.push("<label>",t("reports","settings:metricRefs"),'</label>\n<div class="reports-settings-metricRefs">\n  <div class="form-group">\n    <label for="',idPrefix,"-",metric,'-overall">',t("reports","settings:overall"),'</label>\n    <input id="',idPrefix,"-",metric,'-overall" class="form-control" name="reports.',metric,'.overall" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  //--><div class="form-group">\n    <label for="',idPrefix,"-",metric,'-prod">',t("reports","settings:prod"),'</label>\n    <input id="',idPrefix,"-",metric,'-prod" class="form-control" name="reports.',metric,'.prod" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  //--><div class="form-group">\n    <label for="',idPrefix,"-",metric,'-press">',t("reports","settings:press"),'</label>\n    <input id="',idPrefix,"-",metric,'-press" class="form-control" name="reports.',metric,'.press" type="number" value="0" step="1" min="0" max="100">\n  </div>\n</div>\n'),divisions.forEach(function(r){e.push('\n<div class="reports-settings-metricRefs">\n  <div class="form-group">\n    <label for="',idPrefix,"-",metric,"-",r._id,'">',escape(r.label),'</label>\n    <input id="',idPrefix,"-",metric,"-",r._id,'" class="form-control" name="reports.',metric,".",r._id,'" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  '),r.subdivisions.forEach(function(r){e.push('\n  //--><div class="form-group">\n    <label for="',idPrefix,"-",metric,"-",r._id,'">',escape(r.label),'</label>\n    <input id="',idPrefix,"-",metric,"-",r._id,'" class="form-control" name="reports.',metric,".",r._id,'" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  ')}),e.push("\n  //-->\n</div>\n")}),e.push("\n"),e.join("")}()+"\n</div>\n")}();return buf.join("")}});