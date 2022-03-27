using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Utils.Attributes;

namespace OneEightyDataAccess.Controllers
{
    [ApiVersion("1.0")]
    [Route("api/v{api-version:apiVersion}/[controller]")]
    [ApiController]
    public class AppointmentsController:ControllerBase
    {
        private readonly IAppointmentsFactory _appointmentsFactory;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(IAppointmentsFactory appointmentsFactory,ILogger<AppointmentsController> logger)
        {
            _appointmentsFactory = appointmentsFactory;
            _logger = logger;
        }

        [HttpPost("user/book/{emailId}/dealer/{dealerId}/appointment/{appointmentDate}/{appointmentTime}")]
        [Description("Posts the EmailId and Password of the user to validate his credentials and login")]
        [Parameter(Name = "emailId", Description = "Email of digital user")]
        [Parameter(Name = "dealerId", Description = "DealerId where the Appointment will be booked")]
        [Parameter(Name = "appointmentDate", Description = "Date of Scheduled appointment")]
        [Parameter(Name = "appointmentTime", Description = "Time of Scheduled appointment in 24hr format")]
        public async Task<IActionResult> CustomerAppointmentCreate(string emailId, int dealerId, string appointmentDate, string appointmentTime, [FromForm]string strComments)
        {
            try
            {
                _logger.LogInformation($"Received request to book appointment with Email {emailId}, Dealer {dealerId}, AppointmentDate {appointmentDate}");
                var response = await _appointmentsFactory.BookAppointmentOneEighty(emailId, dealerId,appointmentDate, appointmentTime, strComments);
                return Ok(response);
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred: {e}");
                return BadRequest("Failed");
            }
            
        }

        [HttpGet("user/getappointments/{emailId}")]
        [Description("Posts the EmailId and Password of the user to validate his credentials and login")]
        [Parameter(Name = "emailId",Description = "Email of digital user")]
        public async Task<IActionResult> GetAppointments(string emailId)
        {
            try
            {
                _logger.LogInformation($"Received request to fetch all appointments with Email {emailId}");
                var response = await _appointmentsFactory.GetAllAppointments(emailId);
                return Ok(response);
            }
            catch(Exception e)
            {
                _logger.LogError($"Error occurred: {e}");
                return BadRequest("Failed");
            }

        }
    }
}
