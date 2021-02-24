#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$t = "T_MB51"
$outputPath = ReadIni($t, "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni($t, "OutputFile", $t & ".txt")
$codePage = ReadIni($t, "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$layout = ReadIni($t, "Layout", $t)
$fromDate = ""
$toDate = ""

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & " <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --layout")
  LogDebug("  --from-date")
  LogDebug("  --to-date")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--output-path"
        $outputPath = $v
      Case "--output-file"
        $outputFile = $v
      Case "--code-page"
        $codePage = $v
      Case "--layout"
        $layout = $v
      Case "--from-date"
        $fromDate = $v
      Case "--to-date"
        $toDate = $v
    EndSwitch
  Next
EndIf

If $fromDate = "" Or $toDate = "" Then
  $fromDate = ""
  $toDate = ""
EndIf

LogDebug($t)
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--layout=" & $layout)
LogDebug("--from-date=" & $fromDate)
LogDebug("--to-date=" & $toDate)

#include "_Logon.au3"

StartTransaction("MB51")

$session.FindById("wnd[0]/tbar[1]/btn[17]").Press()
$session.FindById("wnd[1]/usr/txtV-LOW").Text = $layout
$session.FindById("wnd[1]/tbar[0]/btn[8]").Press()

If $fromDate <> "" Then
  $session.FindById("wnd[0]/usr/ctxtBUDAT-LOW").text = $fromDate
  $session.FindById("wnd[0]/usr/ctxtBUDAT-HIGH").text = $toDate
EndIf

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Save to file (replace)
$session.FindById("wnd[0]/mbar/menu[0]/menu[1]/menu[2]").Select()
$session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
$session.FindById("wnd[1]/usr/ctxtDY_PATH").Text = $outputPath
$session.FindById("wnd[1]/usr/ctxtDY_FILENAME").Text = $outputFile
$session.FindById("wnd[1]/usr/ctxtDY_FILE_ENCODING").Text = $codePage
$session.FindById("wnd[1]/tbar[0]/btn[11]").Press()

; Back to main screen
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()

LogDebug("ENDING_TRANSACTION")

CloseSession()
