using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OneEightyDataAccess.Models.Export;

namespace OneEightyDataAccess.Implementation.Interface
{
    public interface IDealerFactory
    {
        public Task<IEnumerable<DealerDataExport>> GetActiveDealers(string province);
    }
}
