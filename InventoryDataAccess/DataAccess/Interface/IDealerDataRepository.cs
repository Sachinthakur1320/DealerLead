using System.Collections.Generic;
using System.Threading.Tasks;
using OneEightyDataAccess.Models;
using OneEightyDataAccess.Models.Import;

namespace OneEightyDataAccess.DataAccess.Interface
{
    public interface IDealerDataRepository
    {
        public Task<IEnumerable<DealerDataModel>> GetActiveDealersInfo(string province);
        public Task<IEnumerable<DigitalCustomerAppointments>> GetDealerInfo(int dealerId);
    }
}
