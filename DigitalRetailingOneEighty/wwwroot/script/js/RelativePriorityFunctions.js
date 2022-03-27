
var WritePriorityTableCells = function(rstIssue, PriorityIndex, IssueID) {
    //table and row must be started outside of  this function

    //Display a different color for the first cell if the issue was saved today
    tcDate = new Date(rstIssue.Fields("TimeChanged"));
    now = new Date();
    today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    cellBgColor = '';
    if (tcDate >= today) {
        cellBgColor = "background-color:#96CDCD;";
    }


    Response.Write('<td style="' + cellBgColor + '">');
    if (rstIssue.Fields("ProjectID") > 0) {
        Response.Write('<a href="/webasp/changes/issueview.asp?IssueID=' + rstIssue.Fields("ProjectID") + '&ChildID=' + rstIssue.Fields("DLSupportID") + '">');
    }
    else if (rstIssue.Fields("Parent") > 0) {
        Response.Write('<a href="/webasp/changes/issueview.asp?IssueID=' + rstIssue.Fields("Parent") + '&ChildID=' + rstIssue.Fields("DLSupportID") + '">');
    }
    else {
        Response.Write('<a href="/webasp/changes/issueview.asp?IssueID=' + rstIssue.Fields("DLSupportID") + '">');
    } // end if has a parent
    Response.Write(rstIssue.Fields("DLSupportID"));
    Response.Write('<input type="hidden" name="txtDLSupportID' + PriorityIndex + '" id="txtDLSupportID' + PriorityIndex + '" value="' + rstIssue.Fields("DLSupportID") + '"/>');
    Response.Write('</a></td>');
    Response.Write('<td>');
    if (rstIssue.Fields("DLSupportID") == IssueID) {
        Response.Write('<input type="hidden" size="5" style="text-align:center;" name="txtRelativePriority' + PriorityIndex + '" id="txtRelativePriority' + PriorityIndex + '" value="' + rstIssue.Fields("RelativePriority") + '"/>');
        Response.Write(rstIssue.Fields("RelativePriority"));
        Response.Write('<input type="hidden" name="txtOldRelativePriority' + PriorityIndex + '" id="txtOldRelativePriority' + PriorityIndex + '" value="' + rstIssue.Fields("RelativePriority") + '"/>');
    }
    else {
        if (userPermissions.hasPermission("relativePriority")) {
            Response.Write('<input type="text" size="5" onblur="validateRelativePriority(this)" style="text-align:center;" name="txtRelativePriority' + PriorityIndex + '" id="txtRelativePriority' + PriorityIndex + '" value="' + rstIssue.Fields("RelativePriority") + '"/>');
        }
        else {
            Response.Write(rstIssue.Fields("RelativePriority")+'<input style="display:none" type="text" size="5" onblur="validateRelativePriority(this)" style="text-align:center;" name="txtRelativePriority' + PriorityIndex + '" id="txtRelativePriority' + PriorityIndex + '" value="' + rstIssue.Fields("RelativePriority") + '"/>');
        } 
        Response.Write('<input type="hidden" name="txtOldRelativePriority' + PriorityIndex + '" id="txtOldRelativePriority' + PriorityIndex + '" value="' + rstIssue.Fields("RelativePriority") + '"/>');
    }
    Response.Write('</td>');
    Response.Write('<td>' + IsNullOrEmptyReplace(rstIssue.Fields("SingleResourceDaysDev"), '&nbsp;') + '</td>');
    Response.Write('<td>' + IsNullOrEmptyReplace(rstIssue.Fields("SingleResourceDaysTest"), '&nbsp;') + '</td>');
    Response.Write('<td>' + FormatName(rstIssue.Fields("Priority"), rstIssue.Fields("PriorityName")) + '</td>');
    Response.Write('<td>' + FormatName(rstIssue.Fields("DealerID"), rstIssue.Fields("DealerName")) + '</td>');
    Response.Write('<td>' + IsNullOrEmptyReplace(rstIssue.Fields("ExternalContact"), '&nbsp;') + '</td>');
    Response.Write('<td><a href="/webasp/changes/issueview.asp?IssueID=' + rstIssue.Fields("Sprint") + '">' + FormatName(rstIssue.Fields("Sprint"), rstIssue.Fields("SprintName")) + '</a></td>');
    Response.Write('<td>' + rstIssue.Fields("TypeDescription") + '</td>');
    Response.Write('<td>' + rstIssue.Fields("StateDescription") + '</td>');
    if (rstIssue.Fields("IssueOwner2") > 0) {
        Response.Write('<td>' + FormatName(rstIssue.Fields("IssueOwner"), rstIssue.Fields("IssueOwnerName")) + ', ' + FormatName(rstIssue.Fields("IssueOwner2"), rstIssue.Fields("IssueOwner2Name")) + '</td>');
    }
    else {
        Response.Write('<td>' + FormatName(rstIssue.Fields("IssueOwner"), rstIssue.Fields("IssueOwnerName")) + '</td>');
    }
    Response.Write('<td>' + FormatName(rstIssue.Fields("AssignedTo"), rstIssue.Fields("AssignedToName"), rstIssue.Fields("AssignedDeveloper")) + '</td>');

    strDisplayDate = '&nbsp;'
    var defaultDate = new Date('01/01/1900');
    datReqCompDate = new Date(rstIssue.Fields("ReqCompletionDate"));
    datReqFUDate = new Date(rstIssue.Fields("DevFollowupDate"));

    if (datReqCompDate > defaultDate && datReqFUDate > defaultDate) {
        strDisplayDate = 'C: ' + (datReqCompDate.getMonth() + 1) + '/' + datReqCompDate.getDate() + '/' + datReqCompDate.getFullYear();
        strDisplayDate += '<br>';
        strDisplayDate += 'F: ' + (datReqFUDate.getMonth() + 1) + '/' + datReqFUDate.getDate() + '/' + datReqFUDate.getFullYear();
    }
    else if (datReqCompDate > defaultDate) {
        strDisplayDate = 'C: ' + (datReqCompDate.getMonth() + 1) + '/' + datReqCompDate.getDate() + '/' + datReqCompDate.getFullYear();
    }
    else if (datReqFUDate > defaultDate) {
        strDisplayDate = 'F: ' + (datReqFUDate.getMonth() + 1) + '/' + datReqFUDate.getDate() + '/' + datReqFUDate.getFullYear();
    } //end if
    Response.Write('<td>' + strDisplayDate + '</td>');
    Response.Write('<td style="text-align:left">' + rstIssue.Fields("Summary") + '</td>');
    Response.Write('<td style="text-align:left">' + FormatRelationshipLink(rstIssue.Fields("Relationships")) + '</td>');
};        //end WritePriorityTableCells

var WritePriorityTable = function(objIssue, minPriority, maxPriority) {

	var rstIssue = objIssue.GetRelativePriorityByRange(minPriority, maxPriority, objIssue.TypeID, objIssue.StateID, objIssue.ReqCompletionDate,
					objIssue.DevFollowupDate, objIssue.IssueOwner, objIssue.IssueOwner2, objIssue.AssignedTo, objIssue.AssignedDeveloper, objIssue.AssignedQA,
					objIssue.Priority, objIssue.ProjectID);

	var skippedRows = 0; //count of table rows not displayed
	var PriorityIndex = 1;

	Response.write('<span id="spanRowReport">' + rstIssue.RecordCount + '</span> Issues Returned');
	Response.Write('<table style="margin:auto; width:99%; vertical-align:top;" border="1" cellspacing="0" cellpadding="2">');

	if (rstIssue.RecordCount > 0) {
		Response.Write('<tr style="background-color:#FFFF99;">');
		Response.Write('<th style="width:4%;">ID</th>');
		Response.Write('<th style="width:3%;">Relative Priority</th>');
		Response.Write('<th style="width:2%;">SRDs Dev</th>');
		Response.Write('<th style="width:3%;">SRDs Test</th>');
		Response.Write('<th style="width:6%;">Priority</th>');
		Response.Write('<th style="width:3%;">Dealer</th>');
		Response.Write('<th style="width:5%;">External Contact</th>');
		Response.Write('<th style="Width:12%;">Sprint</th>');
		Response.Write('<th style="width:7%;">Type</th>');
		Response.Write('<th style="width:7%;">Status</th>');
		Response.Write('<th style="width:6%;">Issue Owner(s)</th>');
		Response.Write('<th style="width:7%;">Assigned To</th>');
		Response.Write('<th style="width:8%;">Next Action Date</th>');
		Response.Write('<th style="width:18%;">Issue</th>');
		Response.Write('<th style="width:14%;">Rel. To</th>');
		Response.Write('</tr>');

		while (!rstIssue.EOF) {
			if (!IsCategory(rstIssue.Fields("Parent")) && !IsCategory(rstIssue.Fields("DLSupportID"))) {
				Response.Write('<tr style="text-align:center">');
			}
			else {
				Response.Write('<tr style="display:none">');
				skippedRows++;
			} //end if is not a category

			WritePriorityTableCells(rstIssue, PriorityIndex, 0);
			Response.Write('</tr>');

			rstIssue.MoveNext();
			PriorityIndex++;
		} //end while
	} //end if recordcount>0
	Response.Write('</table>');
	Response.Write('<input type="hidden" value=' + (PriorityIndex - 1) + ' name="txtPriorityIndex" id="txtPriorityIndex"/>');
	Response.Write('<input type="hidden" value=' + (skippedRows) + ' name="txtSkippedRows" id="txtSkippedRows"/>');
	Response.Write('<br>')
};     // end WritePriorityTable

var WritePrioritySubTable = function(IssueID, IssueOwnerID, IssueOwnerID2) {
	var objIssue = new ActiveXObject("DLChangeReq.DLSupportIssue");
	objIssue.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);

	//get 5 issues in the same category around this issue
	var rstIssue = objIssue.GetRelativePriorityByIssueRange(IssueID, 5);

	Response.Write('<table style="margin:auto; width:99%; vertical-align:top;" border="1" cellspacing="0" cellpadding="2">');
	if (rstIssue.RecordCount > 0) {
		Response.Write('<tr style="background-color:#FFFF99;">');
		Response.Write('<th style="width:4%;">ID</th>');
		Response.Write('<th style="width:3%;">Relative Priority</th>');
		Response.Write('<th style="width:2%;">SRDs Dev</th>');
		Response.Write('<th style="width:3%;">SRDs Test</th>');
		Response.Write('<th style="width:6%;">Priority</th>');
		Response.Write('<th style="width:3%;">Dealer</th>');
		Response.Write('<th style="width:5%;">External Contact</th>');
		Response.Write('<th style="Width:12%;">Sprint</th>');
		Response.Write('<th style="width:7%;">Type</th>');
		Response.Write('<th style="width:7%;">Status</th>');
		Response.Write('<th style="width:6%;">Issue Owner(s)</th>');
		Response.Write('<th style="width:7%;">Assigned To</th>');
		Response.Write('<th style="width:8%;">Next Action Date</th>');
		Response.Write('<th style="width:18%;">Issue</th>');
		Response.Write('<th style="width:14%;">Rel. To</th>');
		Response.Write('</tr>');
		var PriorityIndex = 1;

		while (!rstIssue.EOF) {
			bgcolor = '';
			if (rstIssue.Fields("DLSupportID") == IssueID) {
				bgcolor = 'background-color:#CCC;';
			}
			Response.Write('<tr style="text-align:center; ' + bgcolor + '">');
			WritePriorityTableCells(rstIssue, PriorityIndex, IssueID);
			Response.Write('</tr>');
			rstIssue.MoveNext();
			PriorityIndex++;
		} //end while
	} //end if recordcount>0
	Response.Write('</table>');
	Response.Write('<input type="hidden" value=' + (PriorityIndex - 1) + ' name="txtPriorityIndex" id="txtPriorityIndex">');
	Response.Write('<br>');
};//end WritePrioritySubTable

var IsCategory = function(issueID) {
	if (blnIsDevBox) {
		if ((issueID == 7022) || //Jim Test
			(issueID == 7036) || //Tactical Proxy
			(issueID == 7040) || //Master Proxy
			(issueID == 7041)  //Forms and Documents
		   ) {
			return true;
		}
		else {
			return false;
		}//end if valid category
	}
	else {
		if ((issueID == 75243) ||	//Master
			(issueID == 75246) ||	//Tactical
			(issueID == 82879)  //Forms and Documents
		   ) {
			return true;
		}
		else {
			return false;
		}//end if valid category
	}//end if dev
};//end IsCategory

//updatePriorityTable requires that a table generated by WritePriorityTable be submitted via form.
var updatePriorityTable = function(objIssue) {
	intRows = Request.Form("txtPriorityIndex");
	for (intIndex = 1; intIndex <= intRows; intIndex++) {
		oldPriority = +Request.Form("txtOldRelativePriority" + intIndex);
		newPriority = +Request.Form("txtRelativePriority" + intIndex);
		if (oldPriority != newPriority) {
			//update
			objIssue.UpdateRelativePriority(+Request.Form("txtDLSupportID" + intIndex), newPriority, +Session("UserID"));
		}
	};
}; //end  updatePriorityTable

var GetPriorityRange = function(intSelection) {
	return RelativePriorityList[intSelection];
}; //end GetPriorityRange

var WritePriorityOptions = function(intSelected) {
	//to be replaced by a loop when I have a priority matrix
	strOptions = '';
	for (var i = 0; i < RelativePriorityList.length; i++) {
		strOptions = strOptions + '<option value="' + i + '">'+RelativePriorityList[i].Name+'</option>';
	}
	strOptions = strOptions.replace('<option value="' + intSelected, '<OPTION SELECTED value="' + intSelected);
	response.write(strOptions);
}; //end WritePriorityOptions

//for now, only checks for "bugs".  To be generalized in the future.
var WriteCategoryLinksHorizontal = function(objIssue) {
	Response.Write('<span>');
	for (var i = 1; i < RelativePriorityList.length; i++) {
		if (objIssue.RelativePriority >= RelativePriorityList[i].Min && objIssue.RelativePriority <= RelativePriorityList[i].Max) {
			if (blnIsDevBox) {
				for (var j = 0; j < RelativePriorityList[i].DevIssueID.length; j++) {
					WriteCategoryFullLink(RelativePriorityList[i].DevIssueID[j], objIssue);
				};
			}
			else {
				for (var j = 0; j < RelativePriorityList[i].IssueID.length; j++) {
					WriteCategoryFullLink(RelativePriorityList[i].IssueID[j], objIssue);
				};
			}
		}
	} //end for
	Response.Write('</span>');
};  //end WriteCategoryLinksHorizontal

var WriteCategoryFullLink = function(issueID, objIssue) {
	var objIssueCategory = new ActiveXObject("DLChangeReq.DLSupportIssue");
	objIssueCategory.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);

	//Get the details for the category this issue matches a range with
	var today = new Date();
	today = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
	objIssueCategory.LoadIssue(+issueID, +Session('UserID'), today);

	spacer = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';

	//Only write the link if the issue matchs all all filters in the category
	match = true;
	if (objIssueCategory.TypeID > 0 && objIssueCategory.TypeID != objIssue.TypeID) {
		match = false;
	}
	if (objIssueCategory.StateID > -1 && objIssueCategory.StateID != objIssue.StateID) {
		match = false;
	}
	defaultDate = new Date('01/01/1900');
	datReqCompDate = new Date(objIssueCategory.ReqCompletionDate);
	datReqFUDate = new Date(objIssueCategory.DevFollowupDate);
	if (datReqCompDate > defaultDate && objIssueCategory.ReqCompletionDate != objIssue.ReqCompletionDate) {
		match = false;
	}
	if (datReqFUDate > defaultDate && objIssueCategory.DevFollowupDate != objIssue.DevFollowupDate) {
		match = false;
	}
	if (objIssueCategory.IssueOwner > 0 && objIssueCategory.IssueOwner != objIssue.IssueOwner) {
		match = false;
	}
	if (objIssueCategory.IssueOwner2 > 0 && objIssueCategory.IssueOwner2 != objIssue.IssueOwner2) {
		match = false;
	}
	if (objIssueCategory.AssignedTo > 0 && objIssueCategory.AssignedTo != objIssue.AssignedTo) {
		match = false;
	}
	if (objIssueCategory.AssignedDeveloper > 0 && objIssueCategory.AssignedDeveloper != objIssue.AssignedDeveloper) {
		match = false;
	}
	if (objIssueCategory.AssignedQA > 0 && objIssueCategory.AssignedQA != objIssue.AssignedQA) {
		match = false;
	}
	if (objIssueCategory.Priority > 0 && objIssueCategory.Priority != objIssue.Priority) {
		match = false;
	}
	if (objIssueCategory.ProjectID > 0 && objIssueCategory.ProjectID != objIssue.ProjectID) {
		match = false;
	}

	if (match) {
		if (objIssueCategory.ParentID) {
			Response.Write('<a href=/webasp/changes/issueview.asp?IssueID=' + objIssueCategory.ParentID + '&ChildID=' + objIssueCategory.DLSupportID + '>' + objIssueCategory.ParentKeyword + ': ' + objIssueCategory.Keyword + '</a>' + spacer);
		}
		else {
			Response.Write('<a href=/webasp/changes/issueview.asp?IssueID=' + objIssueCategory.DLSupportID + '>' + objIssueCategory.Keyword + '</a>' + spacer);
		}
	}

};           //end WriteFullCategoryLink

var WriteCategoryLink = function(issueID, blnTitle) {
	var objIssue = new ActiveXObject("DLChangeReq.DLSupportIssue");
	objIssue.SetDataSource(m_Server, m_Catalog, m_Username, m_Password);

	var today = new Date();
	today = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
	objIssue.LoadIssue(+issueID, +Session('UserID'), today);

	strEndSpan = '</span>';
	spacer = '';

	if (blnTitle) {
		strSpan = '<span style="color:White; text-decoration:underline; font-weight:bold;">';
	}
	else {
		strSpan = '<span style="color:White;">';
	}

	if (objIssue.ParentID) {
		Response.Write('<a href=/webasp/changes/issueview.asp?IssueID=' + objIssue.ParentID + '&ChildID=' + objIssue.DLSupportID + '>' + strSpan + objIssue.Keyword + strEndSpan + '</a>' + spacer);
	}
	else {
		Response.Write('<a href=/webasp/changes/issueview.asp?IssueID=' + objIssue.DLSupportID + '>' + strSpan + objIssue.Keyword + strEndSpan + '</a>' + spacer);
	}

};  //end WriteCategoryLink


var FormatName = function(id, name, id2) {
	//display a blank if the id=0
	//highlight the name in red & bold if it is the name of the logged in user
	strName = '';
	if (id > 0 || id2 > 0) {
		if (id == Session('UserID') || id2 == Session('UserID')) {
			strName += '<span style="font-weight:bold; color:red;">';
			strName += IsNullOrEmptyReplace(name, '&nbsp;');
			strName += '</span>';
		}
		else {
			strName += IsNullOrEmptyReplace(name, '&nbsp;');
		}
	}
	else {
		strName = '&nbsp;';
	}
	return strName;
}; //end highlightUserName

var FormatRelationshipLink = function(link) {
	link = '' + link;
	if (link.length == 0) {
		return '&nbsp;'
	}
	else {
		return link.replace('edit_issue.asp?ID=', 'issueview.asp?IssueID=');
	}
}    //end formatRelationshipLink

//Master Relative Priority List
//Name appears in dropdown
//Array must be added to in order to create a new priority range (ie, 51 - 100)
var RelativePriorityList = [];
var IssueIDArray = [0];
var DevIssueIDArray = [0];

RelativePriorityList[0] = { Name: "All",		            Min: -2147483648,	Max: 2147483647 };
RelativePriorityList[1] = { Name: "1 - 25",		            Min: 1,				Max: 25};
RelativePriorityList[2] = { Name: "26 - 50",	            Min: 26,			Max: 50};
RelativePriorityList[3] = { Name: "1 - 150",	            Min: 1,				Max: 150};
RelativePriorityList[4] = { Name: "0",                      Min: 0,             Max: 0 };
RelativePriorityList[5] = { Name: "Forms and Documents",	Min: 0,				Max: 2147483647 };
RelativePriorityList[6] = { Name: "Strategic",				Min: 0,				Max: 2147483647 };

//all
IssueIDArray = [0];	
DevIssueIDArray = [0];
RelativePriorityList[0].IssueID = IssueIDArray;
RelativePriorityList[0].DevIssueID = DevIssueIDArray;

//Tactical 1 - 25
IssueIDArray = [75247];
DevIssueIDArray = [7037];
RelativePriorityList[1].IssueID = IssueIDArray;
RelativePriorityList[1].DevIssueID = DevIssueIDArray;

//Tactical 26 - 50
IssueIDArray = [75248];
DevIssueIDArray = [7038];
RelativePriorityList[2].IssueID = IssueIDArray;
RelativePriorityList[2].DevIssueID = DevIssueIDArray;

//Master 1 - 150
IssueIDArray = [75245, 75249];
DevIssueIDArray = [7029, 7039];
RelativePriorityList[3].IssueID = IssueIDArray;
RelativePriorityList[3].DevIssueID = DevIssueIDArray;

//0, 0, 0
IssueIDArray = [0];
DevIssueIDArray = [0];
RelativePriorityList[4].IssueID = IssueIDArray;
RelativePriorityList[4].DevIssueID = DevIssueIDArray;

//Forms & Documents
IssueIDArray = [82882];
DevIssueIDArray = [7091];
RelativePriorityList[5].IssueID = IssueIDArray;
RelativePriorityList[5].DevIssueID = DevIssueIDArray;

//Strategic
IssueIDArray = [75244]; 
DevIssueIDArray = [7023];
RelativePriorityList[6].IssueID = IssueIDArray;
RelativePriorityList[6].DevIssueID = DevIssueIDArray;