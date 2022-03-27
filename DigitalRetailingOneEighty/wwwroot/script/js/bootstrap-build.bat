@echo off

set hr=---------------------------------------------------

set src=bootstrap

set transition=%src%\bootstrap-transition.js
set alert=%src%\bootstrap-alert.js
set button=%src%\bootstrap-button.js
set carousel=%src%\bootstrap-carousel.js
set collapse=%src%\bootstrap-collapse.js
set dropdown=%src%\bootstrap-dropdown.js
set tooltip=%src%\bootstrap-tooltip.js
set popover=%src%\bootstrap-popover.js
set scrollspy=%src%\bootstrap-scrollspy.js
set typeahead=%src%\bootstrap-typeahead.js
set tab=%src%\bootstrap-tab.js
set affix=%src%\bootstrap-affix.js
set modal=%src%\bootstrap-modal.js
set modalmanager=%src%\bootstrap-modalmanager.js
set pane=%src%\bootstrap-pane.js
set panemanager=%src%\bootstrap-panemanager.js
set datagrid=%src%\bootstrap-datagrid.js
set searchfield=%src%\bootstrap-searchfield.js
set loading=%src%\bootstrap-loading.js
set datepicker=%src%\bootstrap-datepicker.js
set timepicker=%src%\bootstrap-timepicker.js

set dest=bootstrap-extended.js

echo.
echo %hr%
echo Combining javascript...
echo %hr%
copy /b %transition%+%alert%+%button%+%carousel%+%collapse%+%dropdown%+%tooltip%+%popover%+%scrollspy%+%tab%+%typeahead%+%affix%+%modalmanager%+%modal%+%datagrid%+%searchfield%+%loading%+%datepicker%+%timepicker%+%panemanager%+%pane% %dest%
echo %hr%
echo Output to %dest% on %date%
echo %hr%
echo.

pause