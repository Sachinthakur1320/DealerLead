using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.Implementation
{
    public class AppointmentsFactory: IAppointmentsFactory
    {
        private readonly ILogger<AppointmentsFactory> _logger;
        private readonly IAppointmentsDataRepository _appointmentsData;
        private readonly IUsersAccountDataRepository _usersAccountData;
        private readonly IDealerDataRepository _dealerData;

        public AppointmentsFactory(ILogger<AppointmentsFactory> logger, IAppointmentsDataRepository appointmentsData,
            IUsersAccountDataRepository usersAccountData,IDealerDataRepository dealerData)
        {
            _logger = logger;
            _appointmentsData = appointmentsData;
            _usersAccountData = usersAccountData;
            _dealerData = dealerData;
        }

        public async Task<string> BookAppointmentOneEighty(string emailId, int dealerId, string appointmenDate,
            string appointmentTime, string strComments)
        {
            var strStatus = "error";
            var customerId = string.Empty;
            //Verify if customer exists
            var userDetailsData = await _usersAccountData.GetRegisteredUserDetails(emailId);
            if (userDetailsData.Any())
            {
                var userDetails = userDetailsData.FirstOrDefault();
                try
                {
                    //User details found, now get the default SalesRep to add it to OE
                    var salesRep = await _appointmentsData.GetActiveDefaultSalesRep(dealerId);
                    //check to see if customer already exists, for particular Dealer
                    var customerExists = await _appointmentsData.GetCustomerIdExisting(userDetails.EmailId, dealerId);
                    if (customerExists.Any())
                    {
                        customerId = customerExists.FirstOrDefault();
                    }
                    else
                    {
                        //add customer to OE. 
                        var customerAddLogId = await _appointmentsData.AddCustomerOneEightyDb(userDetails, dealerId, salesRep.FirstOrDefault());
                        var customerIdStr = await _appointmentsData.GetCustomerId(customerAddLogId.FirstOrDefault());
                        customerId = customerIdStr.FirstOrDefault();
                        await CustomerOneEightyEvents(userDetails,salesRep.FirstOrDefault(),dealerId,"Customer was added to database.","CustomerCreated","", "",customerId);
                    }
                    
                    //book the appointment.
                    var followUpIds = await CustomerOneEightyEvents(userDetails, salesRep.FirstOrDefault(), dealerId, strComments,"AppointmentCreated", appointmenDate, appointmentTime,customerId);

                    //Get DealerInfo to populate the Appointments Table for DigitalUsers
                    var dealerInfoDetailsDealerInfo = await _dealerData.GetDealerInfo(dealerId);
                    var digitalUserIdDetails = await _usersAccountData.GetRegisteredUserId(emailId);

                    var customerAppointments = dealerInfoDetailsDealerInfo.FirstOrDefault();

                    customerAppointments.DigitalUserId = Convert.ToInt32(digitalUserIdDetails.FirstOrDefault());
                    customerAppointments.FollowUpId = followUpIds.First();
                    customerAppointments.FollowUpCustomerId = followUpIds.Last();
                    customerAppointments.CustomerId = Convert.ToInt32(customerId);
                    customerAppointments.AppointmentDate = appointmenDate;
                    customerAppointments.AppointmentTime = appointmentTime;
                    customerAppointments.Comments = strComments;

                    var logId = await _appointmentsData.AddAppointmentsDigitalUsers(customerAppointments);

                    _logger.LogInformation($"Added the Appointment in DigitalAppointments table with logId{logId.FirstOrDefault()}");

                    strStatus = "success";
                }
                catch (Exception e)
                {
                    _logger.LogError($"Error occurred while populating DataBase of OE for Email {userDetails.EmailId}, Stack Trace:{e}");
                    strStatus = "error";
                }
            }
            else
            {
                strStatus = "email_not_exist";
            }
            return strStatus;
        }

        private async Task<IEnumerable<int>> CustomerOneEightyEvents(DigitalRetailUserDetails userDetails, string salesRep, int dealerId, string strResults, string eventString, string appointmentDate, string time, string customerId)
        {
            
            var followUpId = await _appointmentsData.CreateFollowUpsEntry();
            var followUpCustomerId = await _appointmentsData.CreateFollowUpsCustomersEntry();
            
            var followUpIdstr = Convert.ToInt32(followUpId.FirstOrDefault());
            var followUpCustomerIdstr = Convert.ToInt32(followUpCustomerId.FirstOrDefault());

            await _appointmentsData.FollowUpsUpdate(dealerId, Convert.ToInt32(salesRep),
                Convert.ToInt32(customerId), followUpIdstr, strResults, time, appointmentDate);

            await _appointmentsData.FollowUpsUpdateCustomers(dealerId, Convert.ToInt32(salesRep),
                Convert.ToInt32(customerId), followUpCustomerIdstr, strResults, time,
                appointmentDate);

            await _appointmentsData.FollowUpsUpdateComplete(followUpIdstr);
            await _appointmentsData.FollowUpsCustomersUpdateComplete(followUpCustomerIdstr);

            await _appointmentsData.AddOECEvents(dealerId, Convert.ToInt32(customerId), eventString,
                    Convert.ToInt32(salesRep), followUpIdstr);

            var listIds = new List<int> {followUpIdstr, followUpCustomerIdstr};
            return listIds;
        }


        public async Task<IEnumerable<DigitalCustomerAppointments>> GetAllAppointments(string emailId)
        {
            var digitalUserIdDetails = await _usersAccountData.GetRegisteredUserId(emailId);
            var getAppointmentsInfo =
                await _appointmentsData.GetAppointmentsInfo(Convert.ToInt32(digitalUserIdDetails.FirstOrDefault()));
            return getAppointmentsInfo;
        }
    }
}
