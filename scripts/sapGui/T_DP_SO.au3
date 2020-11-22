#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$t = "T_DP_SO"

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & " <orders>")
  Exit(0)
EndIf

If $CmdLine[0] > 0 Then
  For $i = 1 To $CmdLine[0] Step 1
    If Not StringRegExp($CmdLine[$i], "^[0-9]{9}$") Then
      LogError("INVALID_ORDERS", 1)
    EndIf
  Next
EndIf

LogDebug($t)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

; Start transaction
$session.StartTransaction("CO03")

For $orderI = 1 To $CmdLine[0] Step 1
  $order = $CmdLine[$orderI]

  LogDebug("ORDER=" & $order)

  $ctrlId = "wnd[0]/usr/ctxtCAUFVD-AUFNR"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)

  ; Set Order
  $session.FindById("wnd[0]/usr/ctxtCAUFVD-AUFNR").Text = $order
  ; Select Order entered
  $session.FindById("wnd[0]/usr/radR62CLORD-FLG_KNOT").Select()
  ; Press Order Header
  $session.FindById("wnd[0]/tbar[1]/btn[18]").Press()

  $ctrlId = "wnd[0]/usr/ctxtCAUFVD-MATNR"
  $ctrl = $session.FindById($ctrlId)
  AssertControl($ctrl, $ctrlId)

  $nc12 = $session.FindById("wnd[0]/usr/ctxtCAUFVD-MATNR").Text
  $name = $session.FindById("wnd[0]/usr/txtCAUFVD-MATXT").Text
  $salesOrderNo = $session.FindById("wnd[0]/usr/tabsTABSTRIP_0115/tabpKOZE/ssubSUBSCR_0115:SAPLCOKO1:0120/ctxtAFPOD-KDAUF").Text
  $salesOrderItem = $session.FindById("wnd[0]/usr/tabsTABSTRIP_0115/tabpKOZE/ssubSUBSCR_0115:SAPLCOKO1:0120/ctxtAFPOD-KDPOS").Text

  LogDebug("ORDER_NC12=" & $nc12)
  LogDebug("ORDER_NAME=" & $name)
  LogDebug("SALES_ORDER_NO=" & $salesOrderNo)
  LogDebug("SALES_ORDER_ITEM=" & $salesOrderItem)

  ; Back to the initial screen
  $session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
Next

LogDebug("ENDING_TRANSACTION")

CloseSession()
