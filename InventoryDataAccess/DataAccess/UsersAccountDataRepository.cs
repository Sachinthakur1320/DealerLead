using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Models;

namespace OneEightyDataAccess.DataAccess
{
    public class UsersAccountDataRepository: IUsersAccountDataRepository
    {
        private readonly IDataConnection _dataConnection;

        public UsersAccountDataRepository(IDataConnection dataConnection)
        {
            _dataConnection = dataConnection;
        }

        public async Task<IEnumerable<string>> LoginUser(DigitalRetailLogin userLogin)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspUserAccountLogin",
                    new
                    {
                        emailid = userLogin.EmailId,
                        password = userLogin.Password
                    },
                    commandType: CommandType.StoredProcedure);
            }
        }
        public async Task<IEnumerable<string>> RegisterUser(DigitalRetailUserDetails userDetails)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>("_uspUserAccountAdd",
                    new
                    {
                        fname = userDetails.FirstName,
                        lname = userDetails.LastName,
                        dateregistered = userDetails.DateRegistered ,
                        emailid = userDetails.EmailId,
                        password = userDetails.Password,
                        province = userDetails.Province,
                        homephone = userDetails.HomePhone,
                        officePhone = userDetails.OfficePhone,
                        address = userDetails.Address,
                        city = userDetails.City,
                        postalcode = userDetails.PostalCode,
                        country = userDetails.Country
                    },
                    commandType: CommandType.StoredProcedure);
            }
        }

        public async Task<IEnumerable<DigitalRetailUserDetails>> GetRegisteredUserDetails(string emailId)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<DigitalRetailUserDetails>(
                    @"
                         select
                            FirstName, LastName, DateRegistered, EmailId, Province, HomePhone, OfficePhone, Address, City, PostalCode, Country
                            from _DigitalRetailingCustomersInfo with(nolock) where EmailId = @emailId
                        ",new { emailId }

                );
            }
        }

        //Get CustomerId from DigitalUsers and add in DigitalUsers Appointments
        public async Task<IEnumerable<string>> GetRegisteredUserId(string emailId)
        {
            using(var connection = _dataConnection.GetConnection())
            {
                return await connection.QueryAsync<string>(
                    @"
                         select ID
                            from _DigitalRetailingCustomersInfo with(nolock) where EmailId = @emailId
                        ",new { emailId }

                );
            }
        }
    }
}
