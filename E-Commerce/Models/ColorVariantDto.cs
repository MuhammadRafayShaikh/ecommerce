namespace E_Commerce.Models
{
    public class ColorVariantDto
    {
        public string ColorCode { get; set; }
        public int Stock { get; set; }
        public decimal ExtraPrice { get; set; }
        public List<string> Sizes { get; set; }
        public List<string> Images { get; set; }
    }
}
