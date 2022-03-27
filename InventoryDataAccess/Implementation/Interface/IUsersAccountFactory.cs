using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.Implementation.Interface
{
    public interface IUsersAccountFactory
    {
        public Task<LoginResponse> LoginUserAccounts(DigitalRetailLogin userLogin);
        public Task<string> RegisterUserAccount(DigitalRetailUserDetails userDetails);
    }
}
