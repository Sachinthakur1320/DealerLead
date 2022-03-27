using System;
using System.Collections.Generic;
using System.Data;
using System.Configuration;
using OneEightyDataAccess.DataAccess.Interface;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace OneEightyDataAccess.DataAccess
{
    public class DataConnection: IDataConnection
    {
        private readonly IConfiguration _configuration;

        public DataConnection(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IDbConnection GetConnection()
        {
            var connectionString = _configuration.GetSection("DealerLease").GetValue<string>("ConnectionString");
            return new SqlConnection(connectionString);
        }
        public IDbConnection GetReadOnlyConnection()
        {
            var connectionString = _configuration.GetSection("DealerLease-ReadOnly").GetValue<string>("ConnectionString");
            return new SqlConnection(connectionString);
        }
    }
}
