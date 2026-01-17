namespace E_Commerce.Models
{
    public class UpdateCartRequest
    {
        public int ProductId { get; set; }
        public List<SelectionRequest> Selections { get; set; }
    }

    public class SelectionRequest
    {
        public int ColorId { get; set; }
        public List<SizeSelectionRequest> Sizes { get; set; }
    }

    public class SizeSelectionRequest
    {
        public string Size { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
