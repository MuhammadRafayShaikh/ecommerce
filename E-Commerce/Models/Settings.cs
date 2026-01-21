// Models/Settings.cs
using System.ComponentModel.DataAnnotations;

namespace E_Commerce.Models
{
    public class Settings
    {
        [Key]
        public int Id { get; set; } = 1; // Only one settings record

        // General Settings
        [Required(ErrorMessage = "Store name is required")]
        [Display(Name = "Store Name")]
        [StringLength(100)]
        public string StoreName { get; set; } = "Luxe Suits";

        [Display(Name = "Store Logo URL")]
        public string StoreLogoUrl { get; set; } = "/images/logo.png";

        [Display(Name = "Store Description")]
        [StringLength(500)]
        public string StoreDescription { get; set; } = "Premium Gents Fashion Store";

        [Display(Name = "Contact Email")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        public string ContactEmail { get; set; } = "contact@luxesuits.com";

        [Display(Name = "Contact Phone")]
        [Phone(ErrorMessage = "Please enter a valid phone number")]
        public string ContactPhone { get; set; } = "+92 312 3456789";

        [Display(Name = "Store Address")]
        public string StoreAddress { get; set; } = "123 Fashion Street, Karachi, Pakistan";

        // Business Settings
        [Display(Name = "Currency")]
        public string Currency { get; set; } = "PKR";

        [Display(Name = "Currency Symbol")]
        public string CurrencySymbol { get; set; } = "Rs";

        [Display(Name = "Tax Percentage")]
        [Range(0, 100, ErrorMessage = "Tax must be between 0 and 100")]
        public decimal TaxPercentage { get; set; } = 16;

        [Display(Name = "Shipping Cost")]
        [Range(0, 10000, ErrorMessage = "Shipping cost must be reasonable")]
        public decimal ShippingCost { get; set; } = 200;

        [Display(Name = "Free Shipping Minimum")]
        public decimal FreeShippingMinimum { get; set; } = 3000;

        [Display(Name = "Minimum Order Amount")]
        public decimal MinimumOrderAmount { get; set; } = 500;

        // Email Settings
        [Display(Name = "SMTP Server")]
        public string SmtpServer { get; set; } = "smtp.gmail.com";

        [Display(Name = "SMTP Port")]
        public int SmtpPort { get; set; } = 587;

        [Display(Name = "SMTP Username")]
        public string SmtpUsername { get; set; } = "noreply@luxesuits.com";

        [Display(Name = "SMTP Password")]
        [DataType(DataType.Password)]
        public string? SmtpPassword { get; set; }

        [Display(Name = "Sender Name")]
        public string SenderName { get; set; } = "Luxe Suits";

        [Display(Name = "Sender Email")]
        [EmailAddress]
        public string SenderEmail { get; set; } = "noreply@luxesuits.com";

        // Social Media
        [Display(Name = "Facebook URL")]
        [Url]
        public string FacebookUrl { get; set; } = "https://facebook.com/luxesuits";

        [Display(Name = "Instagram URL")]
        [Url]
        public string InstagramUrl { get; set; } = "https://instagram.com/luxesuits";

        [Display(Name = "Twitter URL")]
        [Url]
        public string TwitterUrl { get; set; } = "https://twitter.com/luxesuits";

        [Display(Name = "YouTube URL")]
        [Url]
        public string YouTubeUrl { get; set; } = "https://youtube.com/luxesuits";

        // Maintenance
        [Display(Name = "Maintenance Mode")]
        public bool MaintenanceMode { get; set; } = false;

        [Display(Name = "Maintenance Message")]
        public string MaintenanceMessage { get; set; } = "We're currently upgrading our store. We'll be back soon!";

        // Security
        [Display(Name = "Enable Two-Factor Authentication")]
        public bool EnableTwoFactorAuth { get; set; } = false;

        [Display(Name = "Session Timeout (minutes)")]
        [Range(1, 480, ErrorMessage = "Session timeout must be between 1 and 480 minutes")]
        public int SessionTimeout { get; set; } = 30;

        [Display(Name = "Max Login Attempts")]
        [Range(1, 10, ErrorMessage = "Max login attempts must be between 1 and 10")]
        public int MaxLoginAttempts { get; set; } = 5;

        // Analytics
        [Display(Name = "Google Analytics ID")]
        public string? GoogleAnalyticsId { get; set; }

        [Display(Name = "Facebook Pixel ID")]
        public string? FacebookPixelId { get; set; }

        // SEO
        [Display(Name = "Meta Title")]
        [StringLength(60)]
        public string MetaTitle { get; set; } = "Luxe Suits - Premium Gents Fashion";

        [Display(Name = "Meta Description")]
        [StringLength(160)]
        public string MetaDescription { get; set; } = "Shop premium suits, sherwanis, and traditional wear at Luxe Suits. Best quality fabric with custom stitching.";

        [Display(Name = "Meta Keywords")]
        public string MetaKeywords { get; set; } = "suits, sherwani, mens fashion, traditional wear, luxury clothing";

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}