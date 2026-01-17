using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace E_Commerce.Models
{
    public class ProductColor
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        [Required]
        [MaxLength(50)]
        public string ColorName { get; set; }   // Black, Yellow

        // Optional: color code for UI (#000000)
        [MaxLength(10)]
        public string? ColorCode { get; set; }
        public int Stock { get; set; }
        public decimal? ExtraPrice { get; set; }
        public string? Sizes { get; set; }

        // Navigation
        public ICollection<ProductImage>? Images { get; set; }
    }

}
