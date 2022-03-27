using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.DataAccess.Interface
{
    public interface IUsersAccountDataRepository
    {
        public Task<IEnumerable<string>> LoginUser(DigitalRetailLogin userLogin);
        public Task<IEnumerable<string>> RegisterUser(DigitalRetailUserDetails userDetails);
        public Task<IEnumerable<DigitalRetailUserDetails>> GetRegisteredUserDetails(string emailId);
        public Task<IEnumerable<string>> GetRegisteredUserId(string emailId);
    }
}
