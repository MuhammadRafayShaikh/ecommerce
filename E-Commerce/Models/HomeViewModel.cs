namespace E_Commerce.Models
{
    public class HomeViewModel
    {
        public List<Category> Categories { get; set; }
        public Product NewProduct { get; set; }

        public AttractiveDiscountDto AttractiveDiscount { get; set; }
        public LimitedProductDto LimitedProduct { get; set; }
        public List<Product> LatestProducts { get; set; }
        public List<AttractiveDiscountDto> AttractiveDiscountList { get; set; }
    }
}
