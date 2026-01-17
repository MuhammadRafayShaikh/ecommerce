namespace E_Commerce.Models
{
    public class ProductColorDto
    {
        public string ColorName { get; set; }
        public int Stock { get; set; }
        public decimal? ExtraPrice { get; set; }
        public string ColorCode { get; set; }
        public string? Sizes { get; set; }
        public List<ProductImageDto> Images { get; set; }
    }

}
