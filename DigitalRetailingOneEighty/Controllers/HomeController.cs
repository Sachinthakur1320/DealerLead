using AutoMapper;
using DigitalRetailingOneEighty.Business.Interface;
using DigitalRetailingOneEighty.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Security.Authentication;
using System.Threading.Tasks;

namespace DigitalRetailingOneEighty.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IdealerData _dealerData;
        private readonly IMapper _mapper;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public HomeController(ILogger<HomeController> logger, IdealerData dealerData, IMapper mapper, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _logger = logger;
            _dealerData = dealerData;
            _mapper = mapper;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }

        public async Task<string> GetProvinces(string province) => await GetCaller(
            $"{_configuration.GetSection("APIs:Dealer").Get<string>()}Dealer/activedealers/province/{province}");

        public async Task<string> GetVehicleData(int dealerId, string availability) => await GetCaller(
            $"{_configuration.GetSection("APIs:Inventory").Get<string>()}inventoryInfo/{dealerId}/availability/{availability}");

        public async Task<string> GetCaller(string url = "") {
            using var client = _httpClientFactory.CreateClient();
            using var httpResponse = await client.GetAsync(url).ConfigureAwait(false);
            var inventoryData = await httpResponse.Content.ReadAsStringAsync();
            return inventoryData;
        }

        public async Task<string> BookAppointment(int dealerId, string date, string time, string vehicleDetails)
        {
            var email = HttpContext.Session.GetString("SessionEmail");
            try
            {
                if (!string.IsNullOrWhiteSpace(email))
                {
                    var keyValuePairs = new List<KeyValuePair<string, string>> {
                        new KeyValuePair<string, string>("strComments", vehicleDetails)
                    };
                    var formContent = new FormUrlEncodedContent(keyValuePairs);
                    using var client = _httpClientFactory.CreateClient();
                    var url = $"{_configuration.GetValue<string>("APIs:Dealer")}Appointments/user/book/{email}/dealer/{dealerId}/appointment/{date}/{time}";
                    using var content = await client.PostAsync(url, formContent);
                    return await content.Content.ReadAsStringAsync();
                }

                throw new AuthenticationException("LOGIN_ERROR");
            }
            catch (AuthenticationException exp)
            {
                return exp.Message;
            }
            catch (Exception)
            {
                return "INTERNAL_SERVER_ERROR";
            }
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}