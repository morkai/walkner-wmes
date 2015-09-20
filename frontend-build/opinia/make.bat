wkhtmltopdf ^
  --page-size A4 ^
  --dpi 600 ^
  --image-dpi 600 ^
  --image-quality 100 ^
  -T 23mm -R 0 -B 20mm -L 0 ^
  --orientation Portrait ^
  --no-pdf-compression ^
  --no-outline ^
  --disable-smart-shrinking ^
  --header-html "http://localhost/opinionSurveys/2015-09.html?template=print-hd" ^
  --footer-html "http://localhost/opinionSurveys/2015-09.html?template=print-ft" ^
  "http://localhost/opinionSurveys/2015-09.html?template=print-intro" ^
  "http://localhost/opinionSurveys/2015-09.html?template=print-survey" ^
  opinia.pdf