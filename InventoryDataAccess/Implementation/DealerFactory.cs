using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using OneEightyDataAccess.DataAccess.Interface;
using OneEightyDataAccess.Implementation.Interface;
using OneEightyDataAccess.Models.Export;

namespace OneEightyDataAccess.Implementation
{
    public class DealerFactory: IDealerFactory
    {
        private readonly IDealerDataRepository _dealerDataRepository;
        private readonly IMapper _mapper;

        public DealerFactory(IDealerDataRepository dealerDataRepository, IMapper mapper)
        {
            _dealerDataRepository = dealerDataRepository;
            _mapper = mapper;
        }
        public async Task<IEnumerable<DealerDataExport>> GetActiveDealers(string province)
        {
            var activeDealers = await _dealerDataRepository.GetActiveDealersInfo(province);
            return _mapper.Map<IEnumerable<DealerDataExport>>(activeDealers);
        }
    }
}
