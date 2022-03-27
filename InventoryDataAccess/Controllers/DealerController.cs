using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models.Export;
using OneEightyDataAccess.Utils.Attributes;

namespace OneEightyDataAccess.Controllers
{
    [ApiVersion("1.0")]
    [Route("api/v{api-version:apiVersion}/[controller]")]
    [ApiController]
    public class DealerController:ControllerBase
    {
        private readonly ILogger<DealerController> _logger;
        private readonly IDealerFactory _dealerFactory;

        public DealerController(ILogger<DealerController> logger, IDealerFactory dealerFactory)
        {
            _logger = logger;
            _dealerFactory = dealerFactory;
        }

        [HttpGet("activedealers/province/{province}")]
        [Description("Gets all the active dealers along with their makes based on Province")]
        [Parameter(Name = "province", Description = "Provinces")]
        public async Task<IEnumerable<DealerDataExport>> GetAllActiveDealers(string province)
        {
            return await _dealerFactory.GetActiveDealers(province);
        }
    }
}
