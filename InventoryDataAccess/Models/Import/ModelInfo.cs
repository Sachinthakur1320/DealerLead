namespace OneEightyDataAccess.Models.Import
{
    public class ModelInfo
    {
        public string Year { get; set; }
        public string ModelName { get; set; }
        public string Edition { get; set; }
        public string Description { get; set; }
        public bool IsReady { get; set; }
        public string BodyStyleName { get; set; }
        public MakeInfo Make { get; set; }
    }
}
