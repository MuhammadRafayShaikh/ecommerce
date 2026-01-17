namespace E_Commerce.Models
{
    public class SalesViewModel
    {
        public List<Discount> Discounts { get; set; } = new List<Discount>();
        public List<string> DiscountGroups { get; set; } = new List<string>();
        public decimal TotalSavings { get; set; }
        public int ProductCount { get; set; }
        public string SelectedDiscountGroup { get; set; } = "All";
    }
}
