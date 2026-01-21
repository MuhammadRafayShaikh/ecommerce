using System.Net.Mail;
using System.Net;
using E_Commerce.Models;
using E_Commerce.Migrations;
using System.Security.Claims;

namespace E_Commerce.Services
{
    public class EmailService
    {
        private readonly SettingsService _settingsService;
        public EmailService(SettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        public async Task SendEmailAsync(string email, string name)
        {
            Settings setting = await _settingsService.GetSettingsAsync();

            var smtpClient = new SmtpClient(setting.SmtpServer)
            {
                Port = setting.SmtpPort,
                Credentials = new NetworkCredential(setting.SmtpUsername, setting.SmtpPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(setting.SmtpUsername),
                Subject = "Successfully Registration",
                Body = $"Congratulations! Hi, {name}, You have successfully registered",
                IsBodyHtml = false,
            };

            mailMessage.To.Add(email);

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
