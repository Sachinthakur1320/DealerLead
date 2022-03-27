using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.Implementation.Interface
{
    public interface IAppointmentsFactory
    {
        public Task<string> BookAppointmentOneEighty(string emailId, int dealerId, string appointmenDate,
            string appointmentTime, string strComments);

        public Task<IEnumerable<DigitalCustomerAppointments>> GetAllAppointments(string emailId);
    }
}
