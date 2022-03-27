using AutoMapper;
using DigitalRetailingOneEighty.Models;
using OneEightyDataAccess.Models.Export;

namespace DigitalRetailingOneEighty.Utils
{
    public class DataViewProfiler: Profile
    {
        public DataViewProfiler()
        {
            CreateMap<DealerDataExport,DealerProvinceView>();
        }
    }
}
