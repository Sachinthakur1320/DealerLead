using System.Collections.Generic;

namespace OneEightyDataAccess.Models.Import
{
    public class InventoryInfo
    {
        public int DealerId { get; set; }
        public int VehicleId { get; set; }
        public string EstimatedTimeOfArrival { get; set; }
        public string StockNumber { get; set; }
        public string Availability { get; set; }
        public string ArrivalDate { get; set; }
        public bool InStock { get; set; }
        public int DayInInv { get; set; }
        public string RetailNotes { get; set; }
        public string Lot { get; set; }
        public string TotalSalesPrice { get; set; }
        public string TotalListPrice { get; set; }
        public string TotalCost { get; set; }
        public VehicleInfo Vehicle { get; set; }
        public List<MsrpOptionsInfo> MsrpOptions { get; set; }
        public DealerInfo Dealer { get; set; }
    }
}
