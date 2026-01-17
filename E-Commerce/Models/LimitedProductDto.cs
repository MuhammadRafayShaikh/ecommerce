namespace E_Commerce.Models
{
    public class LimitedProductDto
    {
        public int ProductId { get; set; }
        public int TotalStock { get; set; }
        public Product Product { get; set; }
        public List<ProductColorDto> Colors { get; set; }
    }
    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImagePath { get; set; }
    }

    
}
