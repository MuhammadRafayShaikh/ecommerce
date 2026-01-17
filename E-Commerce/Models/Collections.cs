namespace E_Commerce.Models
{
    public class Collections
    {
        public List<Category> Categories { get; set; }
        public List<Product> Products { get; set; }
        public List<string> Fabrics { get; set; }
        public List<string> Occasions { get; set; }
        public List<string> Colors { get; set; }
        public bool IsInCart { get; set; }
    }
}
