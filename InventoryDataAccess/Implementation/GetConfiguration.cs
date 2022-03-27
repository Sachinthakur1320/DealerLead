using Microsoft.Extensions.Configuration;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.Implementation
{
    public class GetConfiguration: IGetConfiguration
    {
        private readonly IConfiguration _configuration;
        
        public GetConfiguration(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public DataStrategyInfo GetDataStrategyConfig()
        {
            var apiConfig = new DataStrategyInfo
            {
                HostApi = _configuration.GetSection("DataStrategy").GetValue<string>("ApiHostUrl"),
                AuthorizationHeader = _configuration.GetSection("DataStrategy").GetValue<string>("AuthHeader")
            };
            return apiConfig;
        }
    }
}
