using E_Commerce.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_Commerce.Controllers
{
    public class OrderController : Controller
    {
        private readonly MyDbContext _myDbContext;
        public OrderController(MyDbContext myDbContext)
        {
            _myDbContext = myDbContext;
        }
        [HttpPost]
        public async Task<IActionResult> Index()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Json(new { success = false, message = "User not logged in" });

                // Get user's cart with all details
                var cart = await _myDbContext.Carts
                    .Include(c => c.Items)
                        .ThenInclude(i => i.Product)
                            .ThenInclude(p => p.Discount)
                    .Include(c => c.Items)
                        .ThenInclude(i => i.ProductColor)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null || !cart.Items.Any())
                    return Json(new { success = false, message = "Cart is empty" });

                var pendingOrder = await _myDbContext.Orders
    .Include(o => o.Items)
    .FirstOrDefaultAsync(o =>
        o.UserId == userId &&
        o.Status == Order.OrderStatus.Pending
    );
                if (pendingOrder != null)
                {
                    foreach (var cartItem in cart.Items)
                    {
                        bool existsInOrder = pendingOrder.Items.Any(oi =>
                            oi.ProductId == cartItem.ProductId &&
                            oi.ProductColorId == cartItem.ProductColorId &&
                            oi.Size == cartItem.Size
                        );

                        if (!existsInOrder)
                        {
                            var product = cartItem.Product;
                            var color = cartItem.ProductColor;
                            decimal extraPrice = color?.ExtraPrice ?? 0;

                            decimal unitPrice = product.Price + extraPrice;

                            if (product.Discount != null)
                            {
                                if (product.Discount.DiscountType == Discount._Type.Percentage)
                                    unitPrice = (product.Price - (product.Price * product.Discount.DiscountValue / 100)) + extraPrice;
                                else
                                    unitPrice = (product.Price - product.Discount.DiscountValue) + extraPrice;
                            }

                            pendingOrder.Items.Add(new OrderItem
                            {
                                ProductId = cartItem.ProductId,
                                ProductColorId = cartItem.ProductColorId,
                                Size = cartItem.Size,
                                Quantity = cartItem.Quantity,
                                UnitPrice = unitPrice,
                                TotalPrice = unitPrice * cartItem.Quantity
                            });
                        }

                        var itemsToRemove = pendingOrder.Items
                            .Where(oi => !cart.Items.Any(ci =>
                                ci.ProductId == oi.ProductId &&
                                ci.ProductColorId == oi.ProductColorId &&
                                ci.Size == oi.Size
                            ))
                            .ToList();

                        foreach (var item in itemsToRemove)
                        {
                            pendingOrder.Items.Remove(item);
                            _myDbContext.OrderItems.Remove(item);
                        }

                    }

                    pendingOrder.SubTotal = pendingOrder.Items.Sum(i => i.TotalPrice);
                    pendingOrder.GrandTotal = pendingOrder.SubTotal - pendingOrder.DiscountTotal + pendingOrder.Shipping;

                    await _myDbContext.SaveChangesAsync();

                    return Json(new
                    {
                        success = true,
                        orderId = pendingOrder.Id,
                        orderNumber = pendingOrder.OrderNumber,
                        resumed = true
                    });
                }



                // Calculate totals
                decimal subtotal = 0;
                decimal discountTotal = 0;
                decimal shipping = 99; // Fixed shipping

                foreach (var item in cart.Items)
                {
                    var product = item.Product;
                    var color = item.ProductColor;
                    decimal extraPrice = color?.ExtraPrice ?? 0;

                    // Calculate unit price with discount
                    decimal unitPrice = product.Price + extraPrice;
                    decimal discountAmount = 0;

                    if (product.Discount != null)
                    {
                        if (product.Discount.DiscountType == Discount._Type.Percentage)
                        {
                            discountAmount = product.Price * product.Discount.DiscountValue / 100;
                            unitPrice = (product.Price - discountAmount) + extraPrice;
                        }
                        else if (product.Discount.DiscountType == Discount._Type.Fixed)
                        {
                            discountAmount = product.Discount.DiscountValue;
                            unitPrice = (product.Price - discountAmount) + extraPrice;
                        }
                    }

                    discountTotal += discountAmount * item.Quantity;
                    subtotal += unitPrice * item.Quantity;
                }

                decimal grandTotal = subtotal + shipping;

                // Create Order
                var order = new Order
                {
                    OrderNumber = "ORD-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" +
                                 Guid.NewGuid().ToString("N")[..6].ToUpper(),
                    UserId = userId,
                    SubTotal = subtotal,
                    DiscountTotal = discountTotal,
                    Shipping = shipping,
                    GrandTotal = grandTotal,
                    Status = Order.OrderStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    Items = new List<OrderItem>()
                };

                // Create Order Items
                foreach (var cartItem in cart.Items)
                {
                    var product = cartItem.Product;
                    var color = cartItem.ProductColor;
                    decimal extraPrice = color?.ExtraPrice ?? 0;

                    // Calculate unit price with discount
                    decimal unitPrice = product.Price + extraPrice;

                    if (product.Discount != null)
                    {
                        if (product.Discount.DiscountType == Discount._Type.Percentage)
                        {
                            unitPrice = (product.Price - (product.Price * product.Discount.DiscountValue / 100)) + extraPrice;
                        }
                        else if (product.Discount.DiscountType == Discount._Type.Fixed)
                        {
                            unitPrice = (product.Price - product.Discount.DiscountValue) + extraPrice;
                        }
                    }

                    var orderItem = new OrderItem
                    {
                        ProductId = cartItem.ProductId,
                        ProductColorId = cartItem.ProductColorId,
                        Size = cartItem.Size,
                        Quantity = cartItem.Quantity,
                        UnitPrice = unitPrice,
                        TotalPrice = unitPrice * cartItem.Quantity
                    };

                    order.Items.Add(orderItem);
                }

                // Save order to database
                _myDbContext.Orders.Add(order);
                await _myDbContext.SaveChangesAsync();

                // Clear the cart
                //_myDbContext.CartItems.RemoveRange(cart.Items);
                //_myDbContext.Carts.Remove(cart);
                //await _myDbContext.SaveChangesAsync();

                // Return success with order ID
                return Json(new
                {
                    success = true,
                    orderId = order.Id,
                    orderNumber = order.OrderNumber
                });
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error creating order");
                return Json(new { success = false, message = "Error creating order: " + ex.Message });
            }
        }

        // GET: My Orders
        public async Task<IActionResult> MyOrders()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return RedirectToAction("Login", "Account");

                // Get orders with all related data
                var orders = await _myDbContext.Orders
                    .Where(o => o.UserId == userId)
                    .Include(o => o.Items)
                        .ThenInclude(oi => oi.Product)
                    .Include(o => o.Items)
                        .ThenInclude(oi => oi.ProductColor)
                            .ThenInclude(x => x.Images)
                    .Include(o => o.OrderAddress)
                    .Include(o => o.Payments)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                return View(orders);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error loading orders");
                return View(new List<Order>());
            }
        }

        // GET: Order Details
        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return RedirectToAction("Login", "Account");

                // Get order with all related data
                var order = await _myDbContext.Orders
                    .Where(o => o.Id == id && o.UserId == userId)
                    .Include(o => o.Items)
                        .ThenInclude(oi => oi.Product)
                            .ThenInclude(p => p.ProductColors)
                                .ThenInclude(pc => pc.Images)
                    .Include(o => o.Items)
                        .ThenInclude(oi => oi.ProductColor)
                    .Include(o => o.OrderAddress)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync();

                if (order == null)
                    return NotFound();

                return View(order);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error loading order details");
                return RedirectToAction("MyOrders");
            }
        }

        // POST: Retry Payment for cancelled/pending orders
        [HttpPost]
        public async Task<IActionResult> RetryPayment(int orderId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return Json(new { success = false, message = "User not logged in" });

                // Get the order
                var order = await _myDbContext.Orders
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

                if (order == null)
                    return Json(new { success = false, message = "Order not found" });

                // Check if order can be retried
                if (order.Status != Order.OrderStatus.Pending && order.Status != Order.OrderStatus.Cancelled)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Cannot retry payment for this order. Status: " + order.Status
                    });
                }

                // Check if there's already a successful payment
                var successfulPayment = await _myDbContext.Payments
                    .AnyAsync(p => p.OrderId == orderId && p.Status == Payment.PaymentStatus.Success);

                if (successfulPayment)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Order already has a successful payment"
                    });
                }

                // Reset order status to Pending if it was Cancelled
                if (order.Status == Order.OrderStatus.Cancelled)
                {
                    order.Status = Order.OrderStatus.Pending;
                    await _myDbContext.SaveChangesAsync();
                }

                return Json(new
                {
                    success = true,
                    redirectUrl = $"/Checkout?orderId={orderId}"
                });
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error retrying payment");
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // POST: Cancel Order (only for pending orders)
        [HttpPost]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return Json(new { success = false, message = "User not logged in" });

                // Get the order
                var order = await _myDbContext.Orders
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

                if (order == null)
                    return Json(new { success = false, message = "Order not found" });

                // Can only cancel pending orders
                if (order.Status != Order.OrderStatus.Pending)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Cannot cancel order. Current status: " + order.Status
                    });
                }

                // Update order status
                order.Status = Order.OrderStatus.Cancelled;
                await _myDbContext.SaveChangesAsync();

                return Json(new { success = true, message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error cancelling order");
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        // GET: Track Order
        public async Task<IActionResult> Track(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                    return RedirectToAction("Login", "Account");

                // Get order
                var order = await _myDbContext.Orders
                    .Where(o => o.Id == id && o.UserId == userId)
                    .Include(o => o.OrderAddress)
                    .FirstOrDefaultAsync();

                if (order == null)
                    return NotFound();

                // Create tracking timeline based on status
                var timeline = new List<TrackingEvent>();

                timeline.Add(new TrackingEvent
                {
                    Title = "Order Placed",
                    Description = "Your order has been received",
                    Date = order.CreatedAt,
                    Icon = "fas fa-shopping-cart",
                    IsCompleted = true
                });

                if (order.Status == Order.OrderStatus.Confirmed ||
                    order.Status == Order.OrderStatus.Shipped ||
                    order.Status == Order.OrderStatus.Delivered)
                {
                    timeline.Add(new TrackingEvent
                    {
                        Title = "Payment Confirmed",
                        Description = "Payment has been processed successfully",
                        Date = order.CreatedAt.AddHours(1),
                        Icon = "fas fa-credit-card",
                        IsCompleted = true
                    });
                }

                if (order.Status == Order.OrderStatus.Shipped ||
                    order.Status == Order.OrderStatus.Delivered)
                {
                    timeline.Add(new TrackingEvent
                    {
                        Title = "Order Shipped",
                        Description = "Your order has been shipped",
                        Date = order.CreatedAt.AddDays(1),
                        Icon = "fas fa-shipping-fast",
                        IsCompleted = true
                    });
                }

                if (order.Status == Order.OrderStatus.Delivered)
                {
                    timeline.Add(new TrackingEvent
                    {
                        Title = "Delivered",
                        Description = "Your order has been delivered",
                        Date = order.CreatedAt.AddDays(3),
                        Icon = "fas fa-box-open",
                        IsCompleted = true
                    });
                }

                ViewBag.Timeline = timeline;
                return View(order);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error loading tracking");
                return RedirectToAction("MyOrders");
            }
        }

        public class TrackingEvent
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public DateTime Date { get; set; }
            public string Icon { get; set; }
            public bool IsCompleted { get; set; }
        }

    }
}
