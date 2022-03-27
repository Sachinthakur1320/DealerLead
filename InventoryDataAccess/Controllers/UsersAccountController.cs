using System;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models;
using OneEightyDataAccess.Utils.Attributes;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OneEightyDataAccess.Controllers
{
    [ApiVersion("1.0")]
    [Microsoft.AspNetCore.Mvc.Route("api/v{api-version:apiVersion}/[controller]")]
    [ApiController]
    public class UsersAccountController:ControllerBase
    {
        private readonly ILogger<UsersAccountController> _logger;
        private readonly IUsersAccountFactory _usersAccount;

        public UsersAccountController(ILogger<UsersAccountController> logger, IUsersAccountFactory usersAccount)
        {
            _logger = logger;
            _usersAccount = usersAccount;
        }

        //POST user/login
        [HttpPost("user/login")]
        [Description("Posts the EmailId and Password of the user to validate his credentials and login")]
        [Parameter(Name = "userLogin", Description = "Login emailid and password")]
        public async Task<IActionResult> LoginDigitalRetailUser([FromForm] DigitalRetailLogin userLogin)
        {
            _logger.LogInformation($"Received request to Login customer with Email Id {userLogin.EmailId}.");
            try
            {
                var response = await _usersAccount.LoginUserAccounts(userLogin);
                return Ok(response);
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred while processing the request. Stack Trace {e}");
                return BadRequest("failed");
            }
        }


        // POST user/register
        [HttpPost("user/register")]
        [Description("Posts all the Data required for user registration.")]
        [Parameter(Name = "userDetails",Description = "ONE-EIGHTY dealer identifier")]
        public ActionResult RegisterDigitalRetailUsers([FromForm] DigitalRetailUserDetails userDetails)
        {
            _logger.LogInformation($"Received request to add customer with Email Id {userDetails.EmailId}.");
            try
            {
                var response = _usersAccount.RegisterUserAccount(userDetails);
                return Ok(response.Result);
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred while processing the request. Stack Trace {e}");
                return BadRequest("failed");
            }
        }
    }
}
