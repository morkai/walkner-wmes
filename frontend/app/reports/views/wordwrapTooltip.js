define(function()
{
  'use strict';

  return function wordwrapTooltip(line)
  {
    if (line < 45)
    {
      return line;
    }

    var words = line.split(' ');
    var lines = [];

    words.forEach(function(word)
    {
      var lastLine = lines.length === 0 ? '' : lines[lines.length - 1];

      if (lines.length === 0 || lastLine.length + word.length > 40)
      {
        lines.push(word);
      }
      else
      {
        lines[lines.length - 1] += ' ' + word;
      }
    });

    return lines.join('</span><br><span style="font-size: 10px">');
  };
});
