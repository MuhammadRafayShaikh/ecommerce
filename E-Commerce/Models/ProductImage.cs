using E_Commerce.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace E_Commerce.Models
{

    public class ProductImage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ImagePath { get; set; }

        public bool IsPrimary { get; set; } = false;

        // 🔥 IMPORTANT CHANGE
        [Required]
        public int ProductColorId { get; set; }

        [ForeignKey("ProductColorId")]
        public ProductColor ProductColor { get; set; }
    }

}