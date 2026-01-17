using E_Commerce.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace E_Commerce.Models
{

    public class Product
    {
        [Key]
        public int Id { get; set; }

        // BASIC INFO
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [MaxLength(50)]
        public string SKU { get; set; }

        // CATEGORY
        [Required]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        // OPTIONAL DETAILS
        [MaxLength(100)]
        public string? Brand { get; set; }

        [MaxLength(100)]
        public string? Fabric { get; set; }
        [MaxLength(100)]
        public string? Occasion { get; set; }

        public decimal? Weight { get; set; }
        [MaxLength(200)]
        public string? CareInstruction { get; set; }

        // DESCRIPTIONS
        [MaxLength(200)]
        public string? ShortDescription { get; set; }

        public string? FullDescription { get; set; }

        // STATUS & AVAILABILITY
        public bool IsActive { get; set; } = true;

        [MaxLength(20)]
        public string Availability { get; set; } // in-stock / out-of-stock / pre-order

        // NAVIGATION
        public Discount? Discount { get; set; }
        public ICollection<ProductColor>? ProductColors { get; set; }
        public ICollection<ProductVideo>? Videos { get; set; }

        // AUDIT
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }


}