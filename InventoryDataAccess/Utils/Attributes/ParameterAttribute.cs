using System;

namespace OneEightyDataAccess.Utils.Attributes
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
    public sealed class ParameterAttribute : Attribute
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
