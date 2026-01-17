using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace E_Commerce.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; }

        [Required]
        [MaxLength(150)]
        public string Slug { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Image { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public List<Product>? Products { get; set; }
    }

}
