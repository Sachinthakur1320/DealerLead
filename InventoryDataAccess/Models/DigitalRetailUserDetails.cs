using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OneEightyDataAccess.Models
{
    public class DigitalRetailUserDetails
    {
        [Required]
        [Description("First name of the user")]
        public string FirstName { get; set; }
        [Required]
        [Description("Last name of the user")]
        public string LastName { get; set; }
        [Description("date and time of registration")]
        public string DateRegistered { get; set; }
        [Required]
        [Description("Email id of the user")]
        public string EmailId { get; set; }
        [Required]
        [MinLength(8, ErrorMessage = "Password's minimum length must be 8 characters")]
        [Description("password set by user to login")]
        public string Password { get; set; }
        [Description("Province of the user")]
        public string Province { get; set; }
        [Description("Home phone number")]
        public string HomePhone { get; set; }
        [Description("Office phone number")]
        public string OfficePhone { get; set; }
        [Description("Address of the user")]
        public string Address { get; set; }
        [Description("City of user")]
        public string City { get; set; }
        [Description("PostalCode of the user")]
        public string PostalCode { get; set; }
        [Description("Country of the user")]
        public string Country { get; set; }
    }
}
