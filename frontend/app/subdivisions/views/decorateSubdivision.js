define([
  'app/i18n',
  'app/data/aors',
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath'
],
function(
  t,
  aors,
  divisions,
  renderOrgUnitPath
) {
  'use strict';

  return function decorateSubdivision(model)
  {
    var obj = model.toJSON();

    obj.division = renderOrgUnitPath(divisions.get(obj.division), true, false);

    obj.type = t('subdivisions', 'TYPE:' + obj.type);

    obj.prodTaskTags =
      obj.prodTaskTags && obj.prodTaskTags.length ? obj.prodTaskTags.join('; ') : null;

    var aor = aors.get(obj.aor);

    obj.aor = aor ? aor.getLabel() : null;

    return obj;
  }
});
