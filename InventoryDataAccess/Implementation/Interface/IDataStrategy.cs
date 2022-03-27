using System.Collections.Generic;
using System.Threading.Tasks;
using OneEightyDataAccess.Models.Import;

namespace OneEightyDataAccess.Implementation.Interface
{
    public interface IDataStrategy
    {
        public Task<IEnumerable<InventoryInfo>> GetInventoryDataAvailability(int dealerId,string availability);
    }
}
