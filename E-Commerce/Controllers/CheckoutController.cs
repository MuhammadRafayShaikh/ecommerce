using System.Security.Claims;
using E_Commerce.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace E_Commerce.Controllers
{
    public class CheckoutController : Controller
    {
        private readonly MyDbContext _context;
        private readonly ILogger<CheckoutController> _logger;

        public CheckoutController(MyDbContext context, ILogger<CheckoutController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: Checkout page
        public async Task<IActionResult> Index(int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return RedirectToAction("Login", "Account");

            // Get order details
            var order = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.Product)
                    .ThenInclude(oi => oi.ProductColors)
                        .ThenInclude(x => x.Images)
                //.Include(o => o.Items)
                    
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
                return NotFound();
            if(order.Status != Order.OrderStatus.Pending || order.Status == Order.OrderStatus.Cancelled)
            {
                TempData["error"] = "Already confirmed order";
                return RedirectToAction("MyOrders","Order");
            }
            // Get user's default address if exists
            var defaultAddress = await _context.OrderAddress
                .FirstOrDefaultAsync(a => a.OrderId == orderId);

            ViewBag.DefaultAddress = defaultAddress;

            return View(order);
        }

        // POST: Save shipping address
        [HttpPost]
        public async Task<IActionResult> SaveAddress([FromBody] SaveAddressModel model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return Json(new { success = false, message = "User not logged in" });

                // Validate order belongs to user
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.Id == model.OrderId && o.UserId == userId);

                if (order == null)
                    return Json(new { success = false, message = "Order not found" });
                OrderAddress existingAddress = await _context.OrderAddress.FirstOrDefaultAsync(x => x.OrderId == model.OrderId);
                if (existingAddress != null)
                {
                    existingAddress.FullName = model.FullName;
                    existingAddress.Phone = model.Phone;
                    existingAddress.AddressLine = model.AddressLine;
                    existingAddress.City = model.City;
                    existingAddress.PostalCode = model.PostalCode;

                    await _context.SaveChangesAsync();

                    return Json(new
                    {
                        success = true,
                        message = "Address updated successfully",
                        addressId = existingAddress.Id
                    });
                }
                // Save or update address

                var address = new OrderAddress
                {
                    OrderId = model.OrderId,
                    FullName = model.FullName,
                    Phone = model.Phone,
                    AddressLine = model.AddressLine,
                    City = model.City,
                    PostalCode = model.PostalCode
                };
                _context.OrderAddress.Add(address);
                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = "Address saved successfully",
                    addressId = address.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving address");
                return Json(new { success = false, message = "Error saving address: " + ex.Message });
            }
        }

        // POST: Process payment
        [HttpPost]
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentModel model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return Json(new { success = false, message = "User not logged in" });

                // Get order
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.Id == model.OrderId && o.UserId == userId);

                if (order == null)
                    return Json(new { success = false, message = "Order not found" });

                // Create payment record
                var payment = new Payment
                {
                    OrderId = model.OrderId,
                    Provider = model.Provider,
                    TransactionId = model.TransactionId ?? "PENDING-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
                    Amount = order.GrandTotal,
                    Status = Payment.PaymentStatus.Initiated,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Payments.Add(payment);

                // Update order status based on payment
                if (model.IsSuccess)
                {
                    order.Status = Order.OrderStatus.Confirmed;
                    payment.Status = Payment.PaymentStatus.Success;

                    var cartItems = await _context.CartItems
                               .Where(x => x.Cart.UserId == userId)
                               .ToListAsync();

                    _context.CartItems.RemoveRange(cartItems);

                    // Update stock
                    var orderItems = await _context.OrderItems
                        .Where(oi => oi.OrderId == order.Id)
                        .ToListAsync();

                    foreach (var item in orderItems)
                    {
                        var productColor = await _context.ProductColors
                            .FirstOrDefaultAsync(pc => pc.Id == item.ProductColorId);

                        if (productColor != null)
                        {
                            productColor.Stock -= item.Quantity;
                            if (productColor.Stock < 0) productColor.Stock = 0;
                        }
                    }
                }
                else
                {
                    order.Status = Order.OrderStatus.Cancelled;
                    payment.Status = Payment.PaymentStatus.Failed;
                }

                await _context.SaveChangesAsync();

                return Json(new
                {
                    success = true,
                    message = model.IsSuccess ? "Payment successful!" : "Payment failed",
                    orderStatus = order.Status.ToString(),
                    redirectUrl = model.IsSuccess ? "/Order/MyOrders" : "/Checkout/Failed"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment");
                return Json(new
                {
                    success = false,
                    message = "Error processing payment: " + ex.Message
                });
            }
        }

        // GET: Payment failed page
        public IActionResult Failed()
        {
            return View();
        }
    }

    public class SaveAddressModel
    {
        public int OrderId { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string AddressLine { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
    }

    public class PaymentModel
    {
        public int OrderId { get; set; }
        public string Provider { get; set; }
        public string TransactionId { get; set; }
        public bool IsSuccess { get; set; }
    }
}