'use strict';

const PDFExtract = require('pdf.js-extract').PDFExtract;

const pdfExtract = new PDFExtract();

pdfExtract.extract(process.argv[2], {}, function(err, data)
{
  if (err)
  {
    console.error(err.stack);

    process.exit(1); // eslint-disable-line no-process-exit
  }

  const result = {
    meta: data.meta.info,
    pages: data.pages.sort((a, b) => a.pageInfo.num - b.pageInfo.num).map(page =>
    {
      const coords = findCoords(page.pageInfo, page.content);

      return {
        info: page.pageInfo,
        content: page.content
          .filter(text =>
          {
            return text.dir === 'ltr'
              && /^[0-9]{1,4}$/.test(text.str)
              && text.x > coords.left
              && text.x < coords.right
              && text.y > coords.top
              && text.y < coords.bottom;
          })
          .map(text =>
          {
            return {
              x: Math.round(text.x),
              y: Math.round(text.y),
              w: Math.round(text.width),
              h: Math.round(text.height),
              s: text.str
            };
          })
      };
    })
  };

  process.stdout.write(JSON.stringify(result, null, 2));
});

function findCoords(page, content)
{
  return {
    top: findTopBottomCoord('top', page, content),
    bottom: findTopBottomCoord('bottom', page, content),
    right: findRightLeftCoord('right', page, content),
    left: findRightLeftCoord('left', page, content)
  };
}

function findTopBottomCoord(dir, page, content)
{
  const maxY = dir === 'top' ? 50 : (page.height - 50);

  for (let i = 0; i < content.length; ++i)
  {
    const s1 = content[i];
    const s2 = content[i + 1];
    const s3 = content[i + 2];

    if (!s1 || !s2 || !s3)
    {
      continue;
    }

    if (dir === 'top' && (s1.y > maxY || s2.y > maxY || s3.y > maxY))
    {
      continue;
    }

    if (dir === 'bottom' && (s1.y < maxY || s2.y < maxY || s3.y < maxY))
    {
      continue;
    }

    const abc = s1.str === '1' && s2.str === '2' && s3.str === '3';
    const cba = s1.str === '3' && s2.str === '2' && s3.str === '1';

    if (!abc && !cba)
    {
      continue;
    }

    if (dir === 'top')
    {
      return Math.round(Math.max(s1.y, s2.y, s3.y) + 10);
    }

    if (dir === 'bottom')
    {
      return Math.round(Math.min(s1.y - s1.height, s2.y - s2.height, s3.y + s3.height) - 10);
    }
  }

  return dir === 'top' ? 0 : page.height;
}

function findRightLeftCoord(dir, page, content)
{
  const maxX = dir === 'left' ? 100 : (page.width - 80);

  for (let i = 0; i < content.length; ++i)
  {
    const s1 = content[i];
    const s2 = content[i + 1];
    const s3 = content[i + 2];

    if (!s1 || !s2 || !s3)
    {
      continue;
    }

    if (dir === 'left' && (s1.x > maxX || s2.x > maxX || s3.x > maxX))
    {
      continue;
    }

    if (dir === 'right' && (s1.x < maxX || s2.x < maxX || s3.x < maxX))
    {
      continue;
    }

    const abc = s1.str === 'a' && s2.str === 'b' && s3.str === 'c';
    const cba = s1.str === 'c' && s2.str === 'b' && s3.str === 'a';

    if (!abc && !cba)
    {
      continue;
    }

    if (dir === 'left')
    {
      return Math.round(Math.max(s1.x + s1.width, s2.x + s2.width, s3.x + s3.width) + 10);
    }

    if (dir === 'right')
    {
      return Math.round(Math.min(s1.x, s2.x, s3.x) - 10);
    }
  }

  return dir === 'left' ? 0 : page.width;
}
