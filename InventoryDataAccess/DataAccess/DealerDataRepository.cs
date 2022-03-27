using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Models;
using OneEightyDataAccess.Models.Import;

namespace OneEightyDataAccess.DataAccess
{
    public class DealerDataRepository:IDealerDataRepository
    {
        private readonly IDataConnection _dataConnection;

        public DealerDataRepository(IDataConnection dataConnection)
        {
            _dataConnection = dataConnection;
        }
        public async Task<IEnumerable<DealerDataModel>> GetActiveDealersInfo(string province)
        {
            using (var connection = _dataConnection.GetReadOnlyConnection())
            {
                return await connection.QueryAsync<DealerDataModel>(
                    @"
                         select Name as MakeName,s.* from (select _DealerInfo.DealerID,
			            dbo._udfGetProvince(_DealerInfo.Province) as Province,
			            _DealerInfo.Name as DealerName,
			            _DealerInfo.Code as Code,
						_DealerFranchise.MakeID 
			            from  _DealerDefaults with(nolock)
			            join _DealerInfo with(nolock) on _DealerInfo.DealerId = _DealerDefaults.DealerId
						join _DealerFranchise  WITH(NOLOCK) on _DealerFranchise.DealerID = _DealerInfo.DealerId
			            where _DealerInfo.active  = 1
			            and (_DealerInfo.IsCustomer =1 or _DealerInfo.IsDemoSite = 1)
                        and province = @province) as s join _Makes on  s.MakeID = _Makes.ID
                        ", new {province}

                );
            }
        }

        public async Task<IEnumerable<DigitalCustomerAppointments>> GetDealerInfo(int dealerId)
        {
            using(var connection = _dataConnection.GetReadOnlyConnection())
            {
                return await connection.QueryAsync<DigitalCustomerAppointments>(
                    @"
                         select
		                    Name as DealerName,
		                    Address as DealerAddress,
		                    City as DealerCity,
		                    PostalCode as DealerPostalCode,
		                    Province as DealerProvince,
		                    Country as DealerCountry,
		                    Phone as DealerPhone,
		                    EMail as DealerEmail,
		                    Website as DealerWebsite
                        from _DealerInfo with(nolock)
                        where DealerID = @dealerId
                        ",new { dealerId }

                );
            }
        }
    }
}
