namespace E_Commerce.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public string Provider { get; set; } // Stripe, JazzCash, EasyPaisa
        public string TransactionId { get; set; }

        public decimal Amount { get; set; }

        public PaymentStatus Status { get; set; }
        // Initiated | Success | Failed

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public enum PaymentStatus
        {
            Initiated, Success, Failed
        }
    }

}
