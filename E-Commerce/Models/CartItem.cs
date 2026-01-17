
using System.ComponentModel.DataAnnotations;

namespace E_Commerce.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        public int CartId { get; set; }
        public Cart Cart { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }

        public int ProductColorId { get; set; }
        public ProductColor ProductColor { get; set; }

        [MaxLength(20)]
        public string Size { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; } // snapshot price
    }

}
