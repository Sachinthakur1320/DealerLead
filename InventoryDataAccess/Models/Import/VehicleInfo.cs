namespace OneEightyDataAccess.Models.Import
{
    public class VehicleInfo
    {
        public string Vin { get; set; }
        public string ModelId { get; set; }
        public string FuelTypeId { get; set; }
        public string CountryId { get; set; }
        public string Transmission { get; set; }
        public string ExtColName { get; set; }
        public string IntColName { get; set; }
        public string CurrentKms { get; set; }
        public string TransDescription { get; set; }
        public string Fuel { get; set; }
        public bool IsWholesale { get; set; }
        public string CountryName { get; set; }
        public string DateCurrentKms { get; set; }
        public string TrimDescription { get; set; }
        public string Status { get; set; }
        public string SpStatus { get; set; }
        public string Classification { get; set; }
        public ModelInfo Model { get; set; }
    }
}
