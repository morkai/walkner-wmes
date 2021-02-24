#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <Date.au3>
#include "_Common.au3"

$outputPath = ReadIni("T_ZOIN", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_ZOIN", "OutputFile", "T_ZOIN.txt")
$codePage = ReadIni("T_ZOIN", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$plant = ReadIni("T_ZOIN", "Plant", "")
$mrp = ReadIni("T_ZOIN", "MRP", "")
$fromDate = ""
$toDate = ""

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_ZOIN.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --plant")
  LogDebug("  --mrp")
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
      case "--plant"
        $plant = $v
      case "--mrp"
        $mrp = $v
      Case "--from-date"
        $fromDate = $v
      Case "--to-date"
        $toDate = $v
    EndSwitch
  Next
EndIf

If $fromDate = "" Or $toDate = "" Then
  Local $dateParts
  Local $timeParts

  _DateTimeSplit(_DateAdd("D", -1, _NowCalcDate()), $dateParts, $timeParts)

  $fromDate = $dateParts[3] & "." & $dateParts[2] & "." & $dateParts[1]
  $toDate = @MDAY & "." & @MON & "." & @YEAR
EndIf

LogDebug("T_ZOIN")
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--plant=" & $plant)
LogDebug("--mrp=" & $mrp)
LogDebug("--from-date=" & $fromDate)
LogDebug("--to-date=" & $toDate)

#include "_Logon.au3"

StartTransaction("ZOIN")

; Set Plant
$session.FindById("wnd[0]/usr/ctxtP_WERKS").Text = $plant

; Set MRP Controller
$session.FindById("wnd[0]/usr/ctxtS_DISPO-LOW").Text = $mrp

; Set Created from & to
$session.FindById("wnd[0]/usr/ctxtP_ERDATF").Text = $fromDate
$session.FindById("wnd[0]/usr/ctxtP_ERDATT").Text = $toDate

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
