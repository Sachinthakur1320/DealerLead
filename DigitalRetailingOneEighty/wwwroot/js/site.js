// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
$(document).ready(function () {
    $(".rollingLoader2").hide();
    $("#spinner").hide();
});
var createProperty = function(property, value) {
    return `<td class='col-3'>${property}</td><td class='col-3'>${value}</td>`;
}
var createDataTable = function (data) {
    var content = "";
    content += "<div class='container'><table class='table table-striped'><thead><tr class='row'>";
    content += "<th class='col-3'>Property</th><th class='col-3'>Value</th><th class='col-3'>Property</th><th class='col-3'>Value</th></tr></thead><tbody>";
    content += "<tr class='row'>";
    content += createProperty("dayInInv", data?.["dayInInv"] ?? "-");
    content += createProperty("inStock", data?.["inStock"] ?? "-");
    content += "</tr><tr class='row'>";
    content += createProperty("totalCost", data?.["totalCost"] ?? "-");
    content += createProperty("totalSalesPrice", data?.["totalSalesPrice"] ?? "-");
    content += "</tr><tr class='row'>";
    content += createProperty("classification", data?.["vehicle"]?.["classification"] ?? "-");
    content += createProperty("countryName", data?.["vehicle"]?.["countryName"] ?? "-");
    content += "</tr><tr class='row'>";
    content += createProperty("currentKms", data?.["vehicle"]?.["currentKms"] ?? "-");
    content += createProperty("fuel", data?.["vehicle"]?.["fuel"] ?? "-");
    content += "</tr><tr class='row'>";
    content += createProperty("intColName", data?.["vehicle"]?.["intColName"] ?? "-");
    content += createProperty("description", data?.["vehicle"]?.["model"]?.["description"] ?? "-");
    content += "</tr><tr class='row'>";
    content += createProperty("isMotorcycle", data?.["vehicle"]?.["model"]?.["make"]?.["isMotorcycle"] ?? "-");
    content += createProperty("spStatus", data?.["vehicle"]?.["spStatus"] ?? "-");
    content += "</tr><tr class='row'>";
    content += createProperty("status", data?.["vehicle"]?.["status"] ?? "-");
    content += createProperty("transDescription", data?.["vehicle"]?.["transDescription"] ?? "-");
    content += "</tr><tr class='row'>";
    content += createProperty("trimDescription", data?.["vehicle"]?.["trimDescription"] ?? "-");
    content += createProperty("", "");
    content += "</tr>";
    content += "</tbody></table></div>";
    return content;
}
var getDealer = async function () {
    $(".rollingLoader1").prop("disabled", true);
    $(".rollingLoader2").show();

    var Province = $("#select1").val();
    if (Province && Province != "") {
        await $.get("/Home/GetProvinces", { Province }, function (data, status) {
            if (status && status === "success") {
                $("#table1").html("");
                data = JSON.parse(data);
                //if(data && data != "")
                var content = "";
                if (data && data.length !== 0) {
                    content += "<table class='table table-hover'>";
                    content += "<thead><tr><th scope='col'>S.No.</th><th scope='col'>Dealer Name</th><th scope='col'>Make Name</th></tr></thead><tbody>";
                    for (var i = 0; i < data.length; i++) {
                        content += `<tr style='cursor: pointer;' onclick='GetInventory(${data[i]["dealerID"]})'>`;
                        content += `<td>${i + 1}</td>`;
                        content += `<td>${data[i]["dealerName"]}</td>`;
                        content += `<td>${data[i]["makeName"]}</td>`;
                        content += "</tr>";
                    }
                    content += "</tbody></table>";
                } else {
                    content += "<div class='container'>No Dealers to Show</div>";
                }
                $(".rollingLoader2").hide();
                $(".rollingLoader1").prop("disabled", false);
                $("#table1").html(content);
            } else {
                $(".rollingLoader2").hide();
                $(".rollingLoader1").prop("disabled", false);
                alert("Error at Server");
                $("#select1").focus();
            }
        });
    } else {
        $(".rollingLoader2").hide();
        $(".rollingLoader1").prop("disabled", false);
        alert("Select valid Province");
        $("#select1").focus();
    }
};
var GetInventory = async function (dealerId) {
    var availability = $("#vehicleAvailability").val();
    $("#table1").html("");
    $("#spinner").show();
    await $.get("/Home/GetVehicleData", { dealerId, availability }, function (data, status) {
        if (status && status === "success") {
            $("#table1").html("");
            data = JSON.parse(data);
            var content = "<table style='width:100%;'><tbody>";
            if (data && data["inventoryDetails"]) {
                var inventoryDetails = data["inventoryDetails"];
                content += "<tr><div class='h1'>Dealer Details</div></tr><tr><table class='container-fluid table table-striped'><thead><tr class='row'>";
                content += `<th class='col-2'>address</th>`;
                content += `<th class='col-1'>city</th>`;
                content += `<th class='col-1'>country</th>`;
                content += `<th class='col-2'>eMail</th>`;
                content += `<th class='col-1'>name</th>`;
                content += `<th class='col-2'>phone</th>`;
                content += `<th class='col-1'>postalCode</th>`;
                content += `<th class='col-1'>province</th>`;
                content += `<th class='col-1'>website</th>`;
                content += "</tr></thead><tbody><tr class='row'>";
                content += `<td class='col-2'>${inventoryDetails[0]?.["dealer"]?.["address"] ?? "-"}</td>`;
                content += `<td class='col-1'>${inventoryDetails[0]?.["dealer"]?.["city"] ?? "-"}</td>`;
                content += `<td class='col-1'>${inventoryDetails[0]?.["dealer"]?.["country"] ?? "-"}</td>`;
                content += `<td class='col-2'>${inventoryDetails[0]?.["dealer"]?.["eMail"] ?? "-"}</td>`;
                content += `<td class='col-1'>${inventoryDetails[0]?.["dealer"]?.["name"] ?? "-"}</td>`;
                content += `<td class='col-2'>${inventoryDetails[0]?.["dealer"]?.["phone"] ?? "-"}</td>`;
                content += `<td class='col-1'>${inventoryDetails[0]?.["dealer"]?.["postalCode"] ?? "-"}</td>`;
                content += `<td class='col-1'>${inventoryDetails[0]?.["dealer"]?.["province"] ?? "-"}</td>`;
                content += `<td class='col-1'>${inventoryDetails[0]?.["dealer"]?.["website"] ?? "-"}</td>`;
                content += "</tr></tbody></table>";
                for (var i = 0; i < inventoryDetails.length; i++) {
                    content += "<tr><div class='h3'>Vehicle Details</div></tr><tr><table class='container-fluid table table-striped'><thead><tr class='row'>";
                    content += "<th class='col-1'>Year</th>";
                    content += "<th class='col-2'>Manufacturer</th>";
                    content += "<th class='col-2'>Model Name</th>";
                    content += "<th class='col-2'>Edition</th>";
                    content += "<th class='col-1'>Transmission</th>";
                    content += "<th class='col-2'>Exterior Color</th>";
                    content += "<th class='col-2'>Car Type</th>";
                    content += "</tr></thead><tbody><tr class='row'>";
                    content += `<td class='col-1'>${inventoryDetails[i]?.["vehicle"]?.["model"]?.["year"] ?? "-"}</td>`;
                    content += `<td class='col-2'>${inventoryDetails[i]?.["vehicle"]?.["model"]?.["make"]?.["name"] ?? "-"}</td>`;
                    content += `<td class='col-2'>${inventoryDetails[i]?.["vehicle"]?.["model"]?.["modelName"] ?? "-"}</td>`;
                    content += `<td class='col-2'>${inventoryDetails[i]?.["vehicle"]?.["model"]?.["edition"] ?? "-"}</td>`;
                    content += `<td class='col-1'>${inventoryDetails[i]?.["vehicle"]?.["transmission"] ?? "-"}</td>`;
                    content += `<td class='col-2'>${inventoryDetails[i]?.["vehicle"]?.["extColName"] ?? "-"}</td>`;
                    content += `<td class='col-2'>${inventoryDetails[i]?.["vehicle"]?.["model"]?.["bodyStyleName"] ?? "-"}</td>`;
                    content += "</tr></tbody></table></tr><tr>";
                    content += `<p><button type='button' class='btn btn-danger' data-toggle='collapse' data-target='#apt${i}'>Book an Appointment</button></p>`;
                    content += `<div id='apt${i}' class='collapse'>`;
                    content += createAppointmentTable(i, inventoryDetails[0]?.["dealer"]?.["dealerId"], inventoryDetails[i]?.["vehicle"]);
                    content += "<br/></div></tr><tr>";
                    content += `<p><button type='button' class='btn btn-primary' data-toggle='collapse' data-target='#demo${i}'>Show All Details</button></p>`;
                    content += `<div id='demo${i}' class='collapse'>`;
                    content +=  createDataTable(inventoryDetails[i]);
                    content += "</div></tr><tr><hr/></tr>";
                }
            }
            content += "</tbody></table>";
            $("#spinner").hide();
            $("#table1").html(content);
        } else {
            alert("Error");
            $("#spinner").hide();
        }
    });
}

var createAppointmentTable = function (index, dealerId, vehicleData) {
    var comment = "";
    comment += `${vehicleData?.["model"]?.["year"] ?? "-"} `;
    comment += `${vehicleData?.["model"]?.["make"]?.["name"] ?? "-"} `;
    comment += `${vehicleData?.["model"]?.["modelName"] ?? "-"} `;
    comment += `${vehicleData?.["model"]?.["edition"] ?? "-"} `;
    comment += `${vehicleData?.["transmission"] ?? "-"} `;
    comment += `${vehicleData?.["extColName"] ?? "-"} `;
    comment += `${vehicleData?.["model"]?.["bodyStyleName"] ?? "-"} `;
    var content = "";
    content += "<div class='container well'>";
    content += "<div class='row'>";
    content += "<div class='col-7'>";
    content += "<label id='date1'>Select Date Time Slot: </label>";
    content += `<input type='datetime-local' id='date${index}' data-format='dd/MM/yyyy hh:mm:ss'/>`;
    content += "</div>";
    content += "<div class='col-1'>";
    content += `<input type='text' id='comments${index}' class='form-group' value='${comment}' hidden/>`;
    content += "</div>";
    content += "<div class='col-4'>";
    content += "<label id='date1'> </label>";
    content += `<button type='button' class='btn btn-primary' onclick='bookAppointment(${index}, ${dealerId})'>Send Appointment</button>`;
    content += "</div>";
    content += "</div>";
    content += "</div>";
    return content;
};

var bookAppointment = async function (index, dealerId) {
    var strDate = $(`#date${index}`).val() || "";
    var dateObj = new Date(strDate);
    
    var vehicleDetails = $(`#comments${index}`).val() || "";
    if (strDate && strDate.length > 0) {
        if (dateObj >= (new Date())) {
            var date = `${dateObj.getFullYear()}-${("0" + (dateObj.getMonth() + 1)).slice(-2)}-${("0" + (dateObj.getDate())).slice(-2)}`;
            var time = `${("0" + (dateObj.getHours())).slice(-2)}:${("0" + (dateObj.getMinutes())).slice(-2)}`;
            if (confirm(`Confirm the appointment at date: ${date} and time ${time} for \n${vehicleDetails}`)) {
                await $.get("/Home/BookAppointment",
                    { dealerId, date, time, vehicleDetails },
                    function (result, status) {
                        if (status && status === "success" && result === "success") {
                            alert(`Your appointment is booked for date: ${date} and time: ${time}`);
                        } else if (status && status === "success" && result === "LOGIN_ERROR") {
                            alert("Please Login to book a appointment.");
                        } else {
                            alert("Internal Server Error.");
                        }
                    });
            }
        } else {
            alert("Appointments can not be in past.");
        }
    } else {
        alert("Please enter a valid Date.");
    }
};