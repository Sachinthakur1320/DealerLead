using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.DataAccess
{
    public class AppointmentsDataRepository: IAppointmentsDataRepository
    {
        private readonly IDataConnection _dataConnection;

        public AppointmentsDataRepository(IDataConnection dataConnection)
        {
            _dataConnection = dataConnection;
        }

        public async Task<IEnumerable<string>> GetActiveDefaultSalesRep(int dealerId)
        {
            using(var connection = _dataConnection.GetReadOnlyConnection())
            {
                return await connection.QueryAsync<string>(
                    $@"
                         select ColValue from _DealerInfoIntegrationRows where DealerID = {dealerId} and ColName = 'NewSalesRep'
                        ",new { dealerId }

                );
            }
        }

        public async Task<IEnumerable<string>> AddCustomerOneEightyDb(DigitalRetailUserDetails digitalRetailUser, int dealerId, string salesRep)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspCustomerAdd2",
                    new
                    {
                        intDealer = dealerId,
                        lngChangedBy = salesRep,
                        lngExtChangedBy = 0,
                        title = "Mr.",
                        fname = digitalRetailUser.FirstName,
                        lname = digitalRetailUser.LastName,
                        hPhone = digitalRetailUser.HomePhone,
                        wPhone = digitalRetailUser.OfficePhone,
                        email = digitalRetailUser.EmailId,
                        datDateCreated = DateTime.Now,
                        datWishListDate = DateTime.Now,
                        intSalesRep = salesRep
                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Creates the entry in FollowUps table and returns the FollowUpID
        public async Task<IEnumerable<string>> CreateFollowUpsEntry()
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspFollowUpsAdd",
                    new
                    { },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Creates the entry in FollowUpsCustomers table and returns the created ID
        public async Task<IEnumerable<string>> CreateFollowUpsCustomersEntry()
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspFollowUpsCustomersAdd",
                    new
                        { },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Updates the follow up based on the comments and FollowId fetched from the CreateFollowUps method
        public async Task<IEnumerable<string>> FollowUpsUpdate(int dealerId, int salesRep, int customerId, int followUpId, string strComments, string appointmentTime, string appointmentDate)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspFollowUpsUpdate",
                    new
                    {
                        intFollowID = followUpId,
                        intDealerID = dealerId,
                        intCustomerID = customerId,
                        datDate = DateTime.Now,
                        intContactedBy = salesRep,
                        strResults = strComments,
                        intCreatedBy = salesRep,
                        strNext = appointmentDate,
                        strTime = appointmentTime,
                        
                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Updates the followUpCustomers table with the same data in FollowUps
        //Functionality in align with current OE Process of adding followUps
        public async Task<IEnumerable<string>> FollowUpsUpdateCustomers(int dealerId,int salesRep,int customerId,int followUpId,string strComments,string appointmentTime,string appointmentDate)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspFollowUpsCustomersUpdate",
                    new
                    {
                        intFollowID = followUpId,
                        intDealerID = dealerId,
                        intCustomerID = customerId,
                        datDate = DateTime.Now,
                        intContactedBy = salesRep,
                        strResults = strComments,
                        //intCreatedBy = salesRep,
                        strNext = appointmentDate,
                        strTime = appointmentTime,

                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Once the Update is completed in _FollowUps, call this method to complete the changes
        public async Task<IEnumerable<string>> FollowUpsUpdateComplete(int followUpId)
        {
            //Call this method as it is without any extra parameters so that IsDone parameter is not changed
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspFollowUpsUpdateIsDone",
                    new
                    {
                        intFollowID = followUpId
                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Once update is completed in _FollowUpsCustomers call this method to complete the changes
        public async Task<IEnumerable<string>> FollowUpsCustomersUpdateComplete(int followUpId)
        {
            //Call this method as it is without any extra parameters so that IsDone parameter is not changed
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspFollowUpsCustomersUpdateIsDone",
                    new
                    {
                        intFollowID = followUpId
                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Call the OECEvents to add in the Events, like customer added or appointment created.
        public async Task<IEnumerable<string>> AddOECEvents(int dealerId, int customerId, string eventString, int salesRep, int followUpId)
        {
            //Call this method as it is without any extra parameters so that IsDone parameter is not changed
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspOECEventsAdd",
                    new
                    {
                        DealerID = dealerId,
                        CustomerID = customerId,
                        EventDate = DateTime.Now,
                        EventString = eventString,
                        Details = $"Event added by DigitalRetailingPlatform, customer assigned to default salesRep",
                        FollowID = followUpId
                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        //Get CustomerID based on LogId in OE
        public async Task<IEnumerable<string>> GetCustomerId(string logId)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>(
                    @"
                         select CustomerID from _CustomerInfoChangeLog where LogId = @logId
                        ",new { logId }

                );
            }
        }

        //Check if the customer exists in OE DB
        public async Task<IEnumerable<string>> GetCustomerIdExisting(string emailId, int dealerId)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>(
                    @"
                         select CustomerID from _CustomerInfo where Email = @emailId and DealerID = @dealerId
                        ",new { emailId, dealerId }

                );
            }
        }

        //Add CustomerAppointment in DB
        public async Task<IEnumerable<string>> AddAppointmentsDigitalUsers(DigitalCustomerAppointments customerAppointments)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspAddAppointmentsDigitalUsersAppointments",
                    new
                    {
                        DigitalUserID = customerAppointments.DigitalUserId,
                        FollowUpID = customerAppointments.FollowUpId,
                        CustomerID = customerAppointments.CustomerId,
                        FollowUpCustomerID = customerAppointments.FollowUpCustomerId,
                        AppointmentDate = customerAppointments.AppointmentDate,
                        AppointmentTime = customerAppointments.AppointmentTime,
                        DealerName = customerAppointments.DealerName,
                        DealerAddress = customerAppointments.DealerAddress,
                        DealerCity = customerAppointments.DealerCity,
                        DealerPostalCode = customerAppointments.DealerPostalCode,
                        DealerProvince = customerAppointments.DealerProvince,
                        DealerCountry = customerAppointments.DealerCountry,
                        DealerPhone = customerAppointments.DealerPhone,
                        DealerEmail = customerAppointments.DealerEmail,
                        DealerWebsite = customerAppointments.DealerWebsite,
                        Comments = customerAppointments.Comments

                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        public async Task<IEnumerable<DigitalCustomerAppointments>> GetAppointmentsInfo(int digitalRetailCustomerId)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<DigitalCustomerAppointments>(
                    @"
                         select * from _DigitalRetailingAppointmentsInfo with (nolock) where DigitalUserID = @digitalRetailCustomerId order by AppointmentDate desc
                        ", new { digitalRetailCustomerId }
                );
            }
        }
    }
}
