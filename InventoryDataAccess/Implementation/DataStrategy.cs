using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models.Import;

namespace OneEightyDataAccess.Implementation
{
    public class DataStrategy: IDataStrategy
    {
        private readonly ILogger<DataStrategy> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IGetConfiguration _getConfiguration;

        public DataStrategy(ILogger<DataStrategy> logger, IHttpClientFactory httpClientFactory, IGetConfiguration getConfiguration)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _getConfiguration = getConfiguration;
        }

        public async Task<IEnumerable<InventoryInfo>> GetInventoryDataAvailability(int dealerId, string availability)
        {
            _logger.LogInformation($"Request to get Inventory Data for DealerId {dealerId} and on availability {availability}.");

            try
            {
                var client = _httpClientFactory.CreateClient();
                //client.BaseAddress = new Uri(_getConfiguration.GetDataStrategyConfig().HostApi);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",_getConfiguration.GetDataStrategyConfig().AuthorizationHeader);
                var response = await client.GetAsync($"{_getConfiguration.GetDataStrategyConfig().HostApi}/Inventories/{dealerId}/Availability/{availability}").ConfigureAwait(false);
                
                _logger.LogInformation(
                    $"Response received from /Inventories/{{dealerid}}/Availability/{{availability}} : {response} with status {response.StatusCode}");

                var inventoryData = await response.Content.ReadAsStringAsync();

                var result = JsonConvert.DeserializeObject<IEnumerable<InventoryInfo>>(inventoryData);
                return result;
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred while processing the request on Data Strategy endpoint. Stack Trace: {e}");
                return new List<InventoryInfo>();
            }
        }
    }
}
