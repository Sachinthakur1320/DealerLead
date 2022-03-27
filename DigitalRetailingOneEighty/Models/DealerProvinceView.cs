using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DigitalRetailingOneEighty.Models
{
    public class DealerProvinceView
    {
        public string MakeName { get; set; }
        public int DealerID { get; set; }
        public string Province { get; set; }
        public string DealerName { get; set; }
        public string Code { get; set; }
        public string MakeID { get; set; }
    }

    public class DealerProvinceList
    {
        public IEnumerable<DealerProvinceView> DealerProvinceData { get; set; }
    }
}
