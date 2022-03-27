using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace DigitalRetailingOneEighty.Controllers
{
    public class UserController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public UserController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }
        public IActionResult Dashboard()
        {
            var isLogin = HttpContext.Session.GetString("SessionEmail");
            if(string.IsNullOrWhiteSpace(isLogin))
            {
                return RedirectToAction("Login","User",new { area = "" });
            }

            return View();
        }

        public async Task<string> Appointments() {
            var email = HttpContext.Session.GetString("SessionEmail");
            using var httpClient = _httpClientFactory.CreateClient();
            using var response = await httpClient.GetAsync($"{_configuration.GetSection("APIs:Dealer").Get<string>()}Appointments/user/getappointments/{email}");
            var content = await response.Content.ReadAsStringAsync();
            return content;
        }

        public IActionResult Login()
        {
            var isLogin = HttpContext.Session.GetString("SessionEmail");
            if(!string.IsNullOrWhiteSpace(isLogin))
            {
               HttpContext.Session.Clear(); 
            }
            return View();
        }

        public IActionResult Register()
        {
            return View();
        }
        public IActionResult ContactUs()
        {
            return View();
        }
        public IActionResult AboutUs()
        {
            return View();
        }

        public async Task<string> UserRegistration(string strJson)
        {
            
            var userDetails = JObject.Parse(strJson);
            var keyValues = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("FirstName",(string)userDetails["FirstName"]),
                new KeyValuePair<string, string>("LastName",(string)userDetails["LastName"]),
                new KeyValuePair<string, string>("HomePhone",(string)userDetails["HomePhone"]),
                new KeyValuePair<string, string>("OfficePhone",(string)userDetails["OfficePhone"]),
                new KeyValuePair<string, string>("Province",(string)userDetails["Province"]),
                new KeyValuePair<string, string>("City",(string)userDetails["City"]),
                new KeyValuePair<string, string>("Address",(string)userDetails["Address"]),
                new KeyValuePair<string, string>("PostalCode",(string)userDetails["PostalCode"]),
                new KeyValuePair<string, string>("Country",(string)userDetails["Country"]),
                new KeyValuePair<string, string>("EmailId",(string)userDetails["Email"]),
                new KeyValuePair<string, string>("Password",(string)userDetails["password"])
            };
            HttpContext.Session.SetString("SessionName",
                (string) userDetails["FirstName"] + " " + (string) userDetails["LastName"]);
            HttpContext.Session.SetString("SessionEmail", (string)userDetails["Email"]);
            var formContent = new FormUrlEncodedContent(keyValues);
            using (var httpClient = _httpClientFactory.CreateClient())
            using (var response = await httpClient.PostAsync($"{_configuration.GetValue<string>("APIs:Dealer")}UsersAccount/user/register",formContent))
            {
                return await response.Content.ReadAsStringAsync();
            }
        } 
        public async Task<string> LoginUser(string userEmail, string userPswrd)
        {
            var formContent = new FormUrlEncodedContent(new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("EmailId", userEmail),
                new KeyValuePair<string, string>("Password", userPswrd)
            });
            using (var httpClient = _httpClientFactory.CreateClient())
            using (var response = await httpClient.PostAsync($"{_configuration.GetSection("APIs:Dealer").Get<string>()}UsersAccount/user/login", formContent))
            {
                var content= await response.Content.ReadAsStringAsync();
                var Jcontent = JObject.Parse(content);
                HttpContext.Session.SetString("SessionName",
                    (string)Jcontent["firstName"] +" "+ (string)Jcontent["lastName"]);
                HttpContext.Session.SetString("SessionEmail", (string)Jcontent["email"]);
                return (string)Jcontent["message"];
            }
        }

    }
}