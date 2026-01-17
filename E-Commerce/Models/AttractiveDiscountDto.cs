namespace E_Commerce.Models
{
    public class AttractiveDiscountDto
    {
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public string ProductImage { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal DiscountedPrice { get; set; }
        public string DiscountText { get; set; }
        public string Savings { get; set; }
    }

}
