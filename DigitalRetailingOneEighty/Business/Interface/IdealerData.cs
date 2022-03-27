using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OneEightyDataAccess.Models.Export;

namespace DigitalRetailingOneEighty.Business.Interface
{
    public interface IdealerData
    {
        public Task<IEnumerable<DealerDataExport>> Result(string province);
    }
}
