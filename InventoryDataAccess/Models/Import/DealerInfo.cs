namespace OneEightyDataAccess.Models.Import
{
    public class DealerInfo
    {
        public int DealerId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string LegalName { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Province { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string Phone { get; set; }
        public string Fax { get; set; }
        public string EMail { get; set; }
        public string Website { get; set; }
        public string DealerNumber { get; set; }
        public bool IsDemoSite { get; set; }
        public bool Active { get; set; }
        public bool IsCustomer { get; set; }
        public bool Hidden { get; set; }
        public bool Inactive { get; set; }
        public string GroupName { get; set; }
        public string Franchise { get; set; }
    }
}
