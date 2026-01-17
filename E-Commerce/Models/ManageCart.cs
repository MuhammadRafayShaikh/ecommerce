namespace E_Commerce.Models
{
    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public List<ColorSelectionDto> Selections { get; set; }
    }

    public class ColorSelectionDto
    {
        public int ColorId { get; set; }
        public List<SizeSelectionDto> Sizes { get; set; }
    }

    public class SizeSelectionDto
    {
        public string Size { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerItem { get; set; }
    }

}
