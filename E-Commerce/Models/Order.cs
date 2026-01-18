namespace E_Commerce.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public decimal SubTotal { get; set; }
        public decimal DiscountTotal { get; set; }
        public decimal Shipping { get; set; }
        public decimal GrandTotal { get; set; }

        public OrderStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> Items { get; set; }
        public ICollection<Payment> Payments { get; set; }
        public OrderAddress OrderAddress { get; set; }
        public enum OrderStatus
        {
            Pending,        // Order created, payment pending
            Confirmed,      // Payment success
            Cancelled,      // Payment failed / user cancel
            Shipped,
            Delivered
        }

    }

}
