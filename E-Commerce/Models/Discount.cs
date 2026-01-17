using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace E_Commerce.Models
{
    public class Discount
    {
        [Key]
        public int Id { get; set; }

        // 🔗 Relation with Product
        [Required]
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        // 📌 Discount type: Percentage / Fixed
        [Required]
        [MaxLength(20)]
        public _Type DiscountType { get; set; }
        // values: "percentage", "fixed"

        // 💰 Discount value
        [Required]
        public decimal DiscountValue { get; set; }

        // 🧮 Calculated discounted price (optional but useful)
        public decimal DiscountedPrice { get; set; }

        // 🕒 Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        public enum _Type
        {
            Percentage,
            Fixed
        }
    }
}
