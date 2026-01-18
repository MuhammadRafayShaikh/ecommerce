namespace E_Commerce.Models
{
    public class OrderAddress
    {
        public int Id { get; set; }
        public int OrderId { get; set; }

        public string FullName { get; set; }
        public string Phone { get; set; }

        public string AddressLine { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
    }

}
