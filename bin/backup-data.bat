@ECHO OFF

FOR %%d IN (d8-attachments help kaizen-attachments kanban opinion order-documents paintshop qi-attachments suggestions-attachments xiconf-config xiconf-features xiconf-updates 12nc_to_cags.json mor.json) DO (
  ECHO %%d
  CALL robocopy "\\161.87.64.46\data\%%d" "C:\walkner\data\OneDrive\OneDrive - Miracle Systems Łukasz Walukiewicz\Backups\WMES\data\%%d" /MIR /FFT /R:3 /W:10 /Z /NP /NDL /XJD /MT:4
)
