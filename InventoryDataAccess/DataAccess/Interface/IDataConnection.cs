using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace OneEightyDataAccess.DataAccess.Interface
{
    public interface IDataConnection
    {
        IDbConnection GetConnection();
        IDbConnection GetReadOnlyConnection();
    }
}
