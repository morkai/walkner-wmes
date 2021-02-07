#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <Date.au3>
#include "_Common.au3"

$t = "T_DP_CLR"

$plant = ReadIni($t, "Plant", "PL04")
$bomApplication = ReadIni($t, "BomApplication", "PP01")
$requiredQty = ReadIni($t, "RequiredQty", "1")
$validFrom = @MDAY & "." & @MON & "." & @YEAR
$valCol = "DOBJT"
$delCol = "LOEFG"

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & " <12ncs>")
  Exit(0)
EndIf

If $CmdLine[0] > 0 Then
  For $i = 1 To $CmdLine[0] Step 1
    If Not StringRegExp($CmdLine[$i], "^[0-9A-Z]{7,12}$") Then
      LogError("INVALID_12NC", 1)
    EndIf
  Next
EndIf

LogDebug($t)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

; Start transaction
$session.StartTransaction("CS11")

For $i = 1 To $CmdLine[0] Step 1
  $nc12 = $CmdLine[$i]

  LogDebug("NC12=" & $nc12)

  If StringLen($nc12) <> 12 Then
    LogDebug("IGNORE_CFG_NC12")
    ContinueLoop
  EndIf

  $session.FindById("wnd[0]/usr/ctxtRC29L-MATNR").Text = $nc12 ; Material
  $session.FindById("wnd[0]/usr/ctxtRC29L-WERKS").Text = $plant ; Plant
  $session.FindById("wnd[0]/usr/txtRC29L-STLAL").Text = "" ; Alternative BOM
  $session.FindById("wnd[0]/usr/ctxtRC29L-CAPID").Text = $bomApplication ; BOM Application
  $session.FindById("wnd[0]/usr/ctxtRC29L-DATUV").Text = $validFrom ; Valid from
  $session.FindById("wnd[0]/usr/ctxtRC29L-AENNR").Text = "" ; Change number
  $session.FindById("wnd[0]/usr/txtRC29L-EMENG").Text = $requiredQty ; Required qty

  ; Execute
  $session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

  ; Check for an error in the status bar
  $sbarText = $session.findById("wnd[0]/sbar").Text

  If $sbarText <> "" Then
    LogDebug("NON_EMPTY_SBAR=" & $sbarText)
    ContinueLoop
  EndIf

  ; Search for RAL component
  $table = $session.FindById("wnd[0]/usr/cntlGRID1/shellcont/shell/shellcont[1]/shell")

  If Not IsObj($table) Then
    LogDebug("NO_TABLE")
    ContinueLoop
  EndIf

  ; Set filter
  $session.FindById("wnd[0]/usr/cntlGRID1/shellcont/shell/shellcont[1]/shell").CurrentCellRow = -1
  $session.FindById("wnd[0]/usr/cntlGRID1/shellcont/shell/shellcont[1]/shell").SelectColumn("DOBJT")
  $session.FindById("wnd[0]/usr/cntlGRID1/shellcont/shell/shellcont[1]/shell").SelectedRows = ""
  $session.FindById("wnd[0]/usr/cntlGRID1/shellcont/shell/shellcont[1]/shell").ContextMenu()
  $session.FindById("wnd[0]/usr/cntlGRID1/shellcont/shell/shellcont[1]/shell").SelectContextMenuItem("&FILTER")
  $session.FindById("wnd[1]/usr/ssub%_SUBSCREEN_FREESEL:SAPLSSEL:1105/ctxt%%DYN001-LOW").Text = "*;*;*"
  $session.FindById("wnd[1]/tbar[0]/btn[0]").Press()

  $table = $session.FindById("wnd[0]/usr/cntlGRID1/shellcont/shell/shellcont[1]/shell")
  $rowCount = $table.RowCount() - 1
  $component = ""

  If StringLen($nc12) = 12 And $rowCount > 100 Then
    $rowCount = 100
  EndIf

  For $r = 0 To $rowCount Step 1
    $del = $table.GetCellValue($r, $delCol)

    If $del <> "" Then
      ContinueLoop
    EndIf

    $val = StringRegExpReplace($table.GetCellValue($r, $valCol), "\s+", "")

    If StringRegExp($val, "^[A-Za-z0-9\- ]+;[A-Za-z0-9\- ]+;[A-Za-z0-9\- ]+$") Then
      $component = $val
      ExitLoop
    EndIf
  Next

  LogDebug("COMPONENT=" & $component)

  ; Back to the initial screen
  $session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
Next

LogDebug("ENDING_TRANSACTION")

CloseSession()
