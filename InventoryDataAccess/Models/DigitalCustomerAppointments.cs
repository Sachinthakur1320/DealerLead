using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneEightyDataAccess.Models
{
    public class DigitalCustomerAppointments
    {
        public int DigitalUserId { get; set; }
        public int FollowUpId {get; set;}
        public int CustomerId {get; set;}
        public int FollowUpCustomerId {get; set; }
        public string AppointmentDate {get; set; }
        public string AppointmentTime {get; set; }
        public string DealerName {get; set; }
        public string DealerAddress {get; set; }
        public string DealerCity {get; set; }
        public string DealerPostalCode {get; set; }
        public string DealerProvince {get; set; }
        public string DealerCountry {get; set; }
        public string DealerPhone {get; set; }
        public string DealerEmail {get; set; }
        public string DealerWebsite { get; set; }
        public string Comments { get; set; }
    }
}
