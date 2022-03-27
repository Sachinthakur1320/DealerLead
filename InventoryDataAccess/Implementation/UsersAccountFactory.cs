using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.Implementation
{
    public class UsersAccountFactory: IUsersAccountFactory
    {
        private readonly IUsersAccountDataRepository _usersAccountData;

        public UsersAccountFactory(IUsersAccountDataRepository usersAccountData)
        {
            _usersAccountData = usersAccountData;
        }

        public async Task<LoginResponse> LoginUserAccounts(DigitalRetailLogin userLogin)
        {
            try
            {
                var result = await _usersAccountData.LoginUser(userLogin);
                var customerDetails = await _usersAccountData.GetRegisteredUserDetails(userLogin.EmailId);

                var customerDetailsInfo = customerDetails.FirstOrDefault();
                var response = new LoginResponse();

                response.Message = result.FirstOrDefault();
                if (response.Message == "success_login")
                {
                    response.Email = customerDetailsInfo.EmailId;
                    response.FirstName = customerDetailsInfo.FirstName;
                    response.LastName = customerDetailsInfo.LastName;
                }

                return response;
            }
            catch(Exception e)
            {
                throw e;
            }
        }

        public async Task<string> RegisterUserAccount(DigitalRetailUserDetails userDetails)
        {
            try
            {
                var result = await _usersAccountData.RegisterUser(userDetails);
                return result.FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
