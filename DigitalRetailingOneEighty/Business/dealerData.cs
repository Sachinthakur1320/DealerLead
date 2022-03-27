using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DigitalRetailingOneEighty.Business.Interface;
using OneEightyDataAccess.Implementation;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models.Export;

namespace DigitalRetailingOneEighty.Business
{
    public class dealerData : IdealerData
    {
        private readonly IDealerFactory _dealerFactory;

        public dealerData(IDealerFactory dealerFactory)
        {
            _dealerFactory = dealerFactory;
        }
        public async Task<IEnumerable<DealerDataExport>> Result(string province)
        {
            return await _dealerFactory.GetActiveDealers(province);
        }
    }
}
