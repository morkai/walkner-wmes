#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <Date.au3>
#include "_Common.au3"

$outputPath = ReadIni("T_LT23", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_LT23", "OutputFile", "T_LT23.txt")
$codePage = ReadIni("T_LT23", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$variant = ReadIni("T_LT23", "Variant", "")
$variantCreator = ReadIni("T_LT23", "VariantCreator", ReadIni("Transactions", "VariantCreator", ""))
$layout = ReadIni("T_LT23", "Layout", "")
$warehouse = ReadIni("T_LT23", "Warehouse", "")
$confirmStatus = ReadIni("T_LT23", "ConfirmStatus", "")
$fromDate = ""
$toDate = ""

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_LT23.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --variant")
  LogDebug("  --variant-creator")
  LogDebug("  --layout")
  LogDebug("  --warehouse")
  LogDebug("  --confirm-status: OPEN, CONFIRM or ALL")
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
      Case "--variant"
        $variant = $v
      Case "--variant-creator"
        $variantCreator = $v
      Case "--layout"
        $layout = $v
      Case "--warehouse"
        $warehouse = $v
      Case "--confirm-status"
        $confirmStatus = $v
      Case "--from-date"
        $fromDate = $v
      Case "--to-date"
        $toDate = $v
    EndSwitch
  Next
EndIf

If $variant = "" And ($fromDate = "" Or $toDate = "") Then
  Local $dateParts
  Local $timeParts

  _DateTimeSplit(_DateAdd("D", -1, _NowCalcDate()), $dateParts, $timeParts)

  $fromDate = $dateParts[3] & "." & $dateParts[2] & "." & $dateParts[1]
  $toDate = @MDAY & "." & @MON & "." & @YEAR
EndIf

LogDebug("T_LT23")
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--variant=" & $variant)
LogDebug("--variant-creator=" & $variantCreator)
LogDebug("--layout=" & $layout)
LogDebug("--warehouse=" & $warehouse)
LogDebug("--confirm-status=" & $confirmStatus)
LogDebug("--from-date=" & $fromDate)
LogDebug("--to-date=" & $toDate)

#include "_Logon.au3"

StartTransaction("LT23")

SetVariant($session, $variant, $variantCreator)

; Set Warehouse number
If $warehouse <> "" Then
  $session.FindById("wnd[0]/usr/ctxtT1_LGNUM").Text = $warehouse
EndIf

; Set Confirmation status
If $confirmStatus = "OPEN" Then
  $session.FindById("wnd[0]/usr/radT1_OFFTA").Select()
ElseIf $confirmStatus = "CONFIRMED" Then
  $session.FindById("wnd[0]/usr/radT1_QUITA").Select()
ElseIf $variant = "" Or $confirmStatus = "ALL" Then
  $session.FindById("wnd[0]/usr/radT1_ALLTA").Select()
EndIf

; Set Transfer order from date
If $fromDate <> "" Then
  $session.FindById("wnd[0]/usr/ctxtBDATU-LOW").Text = $fromDate
EndIf

; Set Transfer order to date
If $toDate <> "" Then
  $session.FindById("wnd[0]/usr/ctxtBDATU-HIGH").Text = $toDate
EndIf

; Set Layout
If $layout <> "" Then
  $session.FindById("wnd[0]/usr/ctxtLISTV").Text = $layout
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
