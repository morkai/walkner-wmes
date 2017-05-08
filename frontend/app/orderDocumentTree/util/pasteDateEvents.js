// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time'
], function(
  time
) {
  'use strict';

  return {

    'keydown input[type="date"]': function(e)
    {
      if (e.ctrlKey && e.keyCode === 17)
      {
        var $el = this.$(e.target);

        $el
          .attr('data-type', 'date')
          .css('width', $el.outerWidth() + 'px')
          .prop('type', 'text')
          .select();
      }
    },
    'keyup input[data-type="date"]': function(e)
    {
      if (e.ctrlKey || e.keyCode !== 17)
      {
        return;
      }

      var $el = this.$(e.target);
      var val = $el.val();
      var matches = val.match(/([0-9]{4}).([0-9]{1,2}).([0-9]{1,2})/);

      if (!matches)
      {
        matches = val.match(/([0-9]{1,2}).([0-9]{1,2}).([0-9]{4})/);

        if (!matches)
        {
          matches = val.match(/([0-9]{1,2}).([0-9]{1,2}).([0-9]{1,2})/);
        }
      }

      if (!matches)
      {
        val = '';
      }
      else
      {
        var y = matches[1];
        var m = matches[2];
        var d = matches[3];

        if (matches[1].length === 4 || matches[3].length === 4)
        {
          y = matches[1].length === 4 ? matches[1] : matches[3];
          d = matches[1].length === 4 ? matches[3] : matches[1];
        }

        var moment = time.getMoment(y + '-' + m + '-' + d, 'YYYY-MM-DD');

        if (moment.isValid())
        {
          val = moment.format('YYYY-MM-DD');
        }
        else
        {
          val = '';
        }
      }

      $el
        .attr('data-type', '')
        .css('width', '')
        .prop('type', 'date')
        .val(val)
        .change()
        .focus();
    }

  };
});
