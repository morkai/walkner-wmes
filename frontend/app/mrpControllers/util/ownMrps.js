// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/util/getInputLabel',
  'i18n!app/nls/mrpControllers'
], function(
  _,
  $,
  t,
  user,
  viewport,
  getInputLabel
) {
  'use strict';

  function trigger(view, $input, forcePopover)
  {
    var data = (user.data.mrps || []).map(function(mrp)
    {
      return {
        id: mrp,
        text: mrp
      };
    });

    if (!data.length || forcePopover)
    {
      return showPopover(view, $input);
    }

    $input.select2('data', data);
    $input.change();
  }

  function showPopover(view, $input)
  {
    var disabled = $input.val().length === 0 ? 'disabled' : '';
    var content = [
      '<p>' + t('mrpControllers', 'ownMrps:info', {link: '#users/' + user.data._id}) + '</p>',
      '<p><button class="btn btn-primary" ' + disabled + '>' + t('mrpControllers', 'ownMrps:save') + '</button></p>'
    ];

    if (_.isEmpty(user.data.mrps))
    {
      content.unshift('<p>' + t('mrpControllers', 'ownMrps:empty') + '</p>');
    }

    var $ownMrps = view.$id('ownMrps').popover({
      trigger: 'manual',
      html: true,
      placement: 'right',
      content: content.join('')
    });

    $ownMrps.popover('show');

    $ownMrps.next('.popover').click(function(e)
    {
      if (e.target.tagName === 'BUTTON' && !e.target.disabled)
      {
        e.preventDefault();

        saveSelectedMrps(view, $input);
      }
    });

    $input.one('select2-focus', destroy.bind(view));

    $(document.body).one('click.ownMrps.' + view.idPrefix, destroy.bind(view));
  }

  function saveSelectedMrps(view, $input)
  {
    viewport.msg.saving();

    var mrps = $input.val().split(',').filter(function(v) { return v.length > 0; });

    var req = view.ajax({
      method: 'PUT',
      url: '/users/' + user.data._id,
      data: JSON.stringify({mrps: mrps})
    });

    req.fail(function() { viewport.msg.savingFailed(); });
    req.done(function()
    {
      viewport.msg.saved();

      user.noReload = true;
    });
  }

  function destroy()
  {
    this.$id('ownMrps').popover('destroy');

    $(document.body).off('.ownMrps');
  }

  return {
    attach: function(view, $input)
    {
      var $ownMrps = view.$id('ownMrps');

      if ($ownMrps.attr('data-input-id'))
      {
        return;
      }

      if (!$ownMrps.length)
      {
        getInputLabel($input).append(
          ' (<a id="' + view.idPrefix + '-ownMrps" href="#">' + t('mrpControllers', 'ownMrps:trigger') + '</a>)'
        );
      }

      view.$id('ownMrps').attr('data-input-id', $input.prop('id')).on('click', function(e)
      {
        trigger(view, $input, e.ctrlKey);

        return false;
      });

      view.off('remove', destroy, view);
      view.once('remove', destroy, view);
    }
  };
});
