using AutoMapper;
using OneEightyDataAccess.Models.Export;
using OneEightyDataAccess.Models.Import;

namespace OneEightyDataAccess.Utils
{
    public class DataMapperProfile: Profile
    {
        public DataMapperProfile()
        {
            CreateMap<DealerDataModel, DealerDataExport>();
        }
    }
}
