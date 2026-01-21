// Controllers/SettingsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using E_Commerce.Models;
using System.Threading.Tasks;
using System;

namespace E_Commerce.Controllers
{
    [Authorize(Roles = "Admin")]
    public class SettingsController : Controller
    {
        private readonly MyDbContext _context;

        public SettingsController(MyDbContext context)
        {
            _context = context;
        }

        // GET: Settings/Index
        public async Task<IActionResult> Index()
        {
            var settings = await _context.Settings.FirstOrDefaultAsync();

            if (settings == null)
            {
                // Create default settings if none exist
                settings = new Settings();
                settings.SmtpPassword = "siuymtzsjdocebzk";
                _context.Settings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return View(settings);
        }

        // POST: Settings/Update
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Update(Settings settings)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var existingSettings = await _context.Settings.FirstOrDefaultAsync();

                    if (existingSettings != null)
                    {
                        // Update only non-null fields (for password fields)
                        if (string.IsNullOrEmpty(settings.SmtpPassword))
                        {
                            // Keep existing password if not changed
                            settings.SmtpPassword = existingSettings.SmtpPassword;
                        }

                        // Update timestamps
                        settings.UpdatedAt = DateTime.UtcNow;
                        settings.Id = existingSettings.Id;

                        // Copy all properties
                        _context.Entry(existingSettings).CurrentValues.SetValues(settings);
                    }
                    else
                    {
                        settings.UpdatedAt = DateTime.UtcNow;
                        _context.Settings.Add(settings);
                    }

                    await _context.SaveChangesAsync();

                    TempData["SuccessMessage"] = "Settings updated successfully!";
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", $"Error updating settings: {ex.Message}");
                }
            }

            // If we got this far, something failed, redisplay form
            return View("Index", settings);
        }

        // POST: Settings/UpdateSection
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateSection(string section, Settings settings)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var existingSettings = await _context.Settings.FirstOrDefaultAsync();

                    if (existingSettings != null)
                    {
                        // Update only the relevant section
                        switch (section)
                        {
                            case "general":
                                existingSettings.StoreName = settings.StoreName;
                                existingSettings.StoreLogoUrl = settings.StoreLogoUrl;
                                existingSettings.StoreDescription = settings.StoreDescription;
                                existingSettings.ContactEmail = settings.ContactEmail;
                                existingSettings.ContactPhone = settings.ContactPhone;
                                existingSettings.StoreAddress = settings.StoreAddress;
                                break;

                            case "business":
                                existingSettings.Currency = settings.Currency;
                                existingSettings.CurrencySymbol = settings.CurrencySymbol;
                                existingSettings.TaxPercentage = settings.TaxPercentage;
                                existingSettings.ShippingCost = settings.ShippingCost;
                                existingSettings.FreeShippingMinimum = settings.FreeShippingMinimum;
                                existingSettings.MinimumOrderAmount = settings.MinimumOrderAmount;
                                break;

                            case "email":
                                existingSettings.SmtpServer = settings.SmtpServer;
                                existingSettings.SmtpPort = settings.SmtpPort;
                                existingSettings.SmtpUsername = settings.SmtpUsername;
                                if (!string.IsNullOrEmpty(settings.SmtpPassword))
                                {
                                    existingSettings.SmtpPassword = settings.SmtpPassword;
                                }
                                existingSettings.SenderName = settings.SenderName;
                                existingSettings.SenderEmail = settings.SenderEmail;
                                break;

                            case "social":
                                existingSettings.FacebookUrl = settings.FacebookUrl;
                                existingSettings.InstagramUrl = settings.InstagramUrl;
                                existingSettings.TwitterUrl = settings.TwitterUrl;
                                existingSettings.YouTubeUrl = settings.YouTubeUrl;
                                break;

                            case "maintenance":
                                existingSettings.MaintenanceMode = settings.MaintenanceMode;
                                existingSettings.MaintenanceMessage = settings.MaintenanceMessage;
                                break;

                            case "security":
                                existingSettings.EnableTwoFactorAuth = settings.EnableTwoFactorAuth;
                                existingSettings.SessionTimeout = settings.SessionTimeout;
                                existingSettings.MaxLoginAttempts = settings.MaxLoginAttempts;
                                break;

                            case "seo":
                                existingSettings.MetaTitle = settings.MetaTitle;
                                existingSettings.MetaDescription = settings.MetaDescription;
                                existingSettings.MetaKeywords = settings.MetaKeywords;
                                existingSettings.GoogleAnalyticsId = settings.GoogleAnalyticsId;
                                existingSettings.FacebookPixelId = settings.FacebookPixelId;
                                break;
                        }

                        existingSettings.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();

                        return Json(new { success = true, message = $"{section.Replace("-", " ")} settings updated successfully!" });
                    }
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = $"Error updating settings: {ex.Message}" });
                }
            }

            return Json(new { success = false, message = "Invalid data submitted." });
        }

        // POST: Settings/ResetToDefault
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetToDefault()
        {
            try
            {
                var existingSettings = await _context.Settings.FirstOrDefaultAsync();

                if (existingSettings != null)
                {
                    // Create default settings
                    var defaultSettings = new Settings
                    {
                        Id = existingSettings.Id,
                        SmtpPassword = existingSettings.SmtpPassword, // Keep password
                        CreatedAt = existingSettings.CreatedAt,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Entry(existingSettings).CurrentValues.SetValues(defaultSettings);
                    await _context.SaveChangesAsync();

                    TempData["SuccessMessage"] = "Settings reset to default values!";
                }

                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Error resetting settings: {ex.Message}";
                return RedirectToAction(nameof(Index));
            }
        }
    }
}