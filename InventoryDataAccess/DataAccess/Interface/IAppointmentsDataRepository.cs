using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.DataAccess.Interface
{
    public interface IAppointmentsDataRepository
    {
        public Task<IEnumerable<string>> GetActiveDefaultSalesRep(int dealerId);
        public Task<IEnumerable<string>> CreateFollowUpsEntry();

        public Task<IEnumerable<string>> AddCustomerOneEightyDb(DigitalRetailUserDetails digitalRetailUser,
            int dealerId, string salesRep);

        public Task<IEnumerable<string>> CreateFollowUpsCustomersEntry();

        public Task<IEnumerable<string>> FollowUpsUpdate(int dealerId, int salesRep, int customerId,
            int followUpId, string strComments, string appointmentTime, string appointmentDate);

        public Task<IEnumerable<string>> FollowUpsUpdateCustomers(int dealerId, int salesRep, int customerId,
            int followUpId, string strComments, string appointmentTime, string appointmentDate);

        public Task<IEnumerable<string>> FollowUpsUpdateComplete(int followUpId);
        public Task<IEnumerable<string>> FollowUpsCustomersUpdateComplete(int followUpId);

        public Task<IEnumerable<string>> AddOECEvents(int dealerId, int customerId, string eventString,
            int salesRep, int followUpId);
        public Task<IEnumerable<string>> GetCustomerId(string logId);
        public Task<IEnumerable<string>> GetCustomerIdExisting(string emailId, int dealerId);

        public Task<IEnumerable<string>> AddAppointmentsDigitalUsers(
            DigitalCustomerAppointments customerAppointments);

        public Task<IEnumerable<DigitalCustomerAppointments>> GetAppointmentsInfo(int digitalRetailCustomerId);
    }
}
