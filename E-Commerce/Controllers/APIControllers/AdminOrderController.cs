using E_Commerce.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace E_Commerce.Controllers.APIControllers
{
    [Route("api/orders")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly MyDbContext _context;

        public AdminOrdersController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<OrderResponse>> GetOrders(
            [FromQuery] int? status,
            [FromQuery] int? paymentStatus,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string search = "",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderAddress)
                    .Include(o => o.Items)
                        .ThenInclude(i => i.Product)
                    .Include(o => o.Items)
                        .ThenInclude(i => i.ProductColor)
                            .ThenInclude(x => x.Images)
                    .Include(o => o.Payments)
                    .AsQueryable();

                // Apply filters
                if (status.HasValue)
                {
                    query = query.Where(o => (int)o.Status == status.Value);
                }

                if (paymentStatus.HasValue)
                {
                    query = query.Where(o => o.Payments.Any(p => (int)p.Status == paymentStatus.Value));
                }

                if (startDate.HasValue)
                {
                    query = query.Where(o => o.CreatedAt >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(o => o.CreatedAt <= endDate.Value.AddDays(1));
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    query = query.Where(o =>
                        o.OrderNumber.ToLower().Contains(search) ||
                        o.User.FirstName.ToLower().Contains(search) ||
                        o.User.Email.ToLower().Contains(search) ||
                        o.OrderAddress.FullName.ToLower().Contains(search));
                }

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply pagination
                var orders = await query
                    .OrderByDescending(o => o.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(o => new OrderDto
                    {
                        Id = o.Id,
                        OrderNumber = o.OrderNumber,
                        User = new UserDto
                        {
                            Name = o.User.FirstName,
                            Email = o.User.Email,
                            JoinDate = o.User.CreatedAt
                        },
                        SubTotal = o.SubTotal,
                        DiscountTotal = o.DiscountTotal,
                        Shipping = o.Shipping,
                        GrandTotal = o.GrandTotal,
                        Status = (int)o.Status,
                        CreatedAt = o.CreatedAt,
                        Items = o.Items.Select(i => new OrderItemDto
                        {
                            ProductId = i.ProductId,
                            Product = new ProductDto
                            {
                                Name = i.Product.Name,
                                Image = i.Product.ProductColors.SelectMany(x => x.Images).Select(x => x.ImagePath).FirstOrDefault()
                            },
                            ProductColorId = i.ProductColorId,
                            ProductColor = new AdminProductColorDto
                            {
                                Name = i.ProductColor.ColorName,
                                Hex = i.ProductColor.ColorCode
                            },
                            Size = i.Size,
                            Quantity = i.Quantity,
                            UnitPrice = i.UnitPrice,
                            TotalPrice = i.TotalPrice
                        }).ToList(),
                        Payments = o.Payments.Select(p => new PaymentDto
                        {
                            Provider = p.Provider,
                            TransactionId = p.TransactionId,
                            Amount = p.Amount,
                            Status = (int)p.Status,
                            CreatedAt = p.CreatedAt
                        }).ToList(),
                        OrderAddress = new OrderAddressDto
                        {
                            FullName = o.OrderAddress.FullName,
                            Phone = o.OrderAddress.Phone,
                            AddressLine = o.OrderAddress.AddressLine,
                            City = o.OrderAddress.City,
                            PostalCode = o.OrderAddress.PostalCode
                        }
                    })
                    .ToListAsync();

                return Ok(new OrderResponse
                {
                    Orders = orders,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching orders", error = ex.Message });
            }
        }

        // GET: api/orders/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<OrderStatistics>> GetStatistics()
        {
            try
            {
                var statistics = new OrderStatistics
                {
                    Pending = await _context.Orders.CountAsync(o => o.Status == Order.OrderStatus.Pending),
                    Confirmed = await _context.Orders.CountAsync(o => o.Status == Order.OrderStatus.Confirmed),
                    Shipped = await _context.Orders.CountAsync(o => o.Status == Order.OrderStatus.Shipped),
                    Delivered = await _context.Orders.CountAsync(o => o.Status == Order.OrderStatus.Delivered),
                    Cancelled = await _context.Orders.CountAsync(o => o.Status == Order.OrderStatus.Cancelled)
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching statistics", error = ex.Message });
            }
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderAddress)
                    .Include(o => o.Items)
                        .ThenInclude(i => i.Product)
                    .Include(o => o.Items)
                        .ThenInclude(i => i.ProductColor)
                            .ThenInclude(x => x.Images)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                var orderDto = new OrderDto
                {
                    Id = order.Id,
                    OrderNumber = order.OrderNumber,
                    User = new UserDto
                    {
                        Name = order.User.FirstName,
                        Email = order.User.Email,
                        JoinDate = order.User.CreatedAt
                    },
                    SubTotal = order.SubTotal,
                    DiscountTotal = order.DiscountTotal,
                    Shipping = order.Shipping,
                    GrandTotal = order.GrandTotal,
                    Status = (int)order.Status,
                    CreatedAt = order.CreatedAt,
                    Items = order.Items.Select(i => new OrderItemDto
                    {
                        ProductId = i.ProductId,
                        Product = new ProductDto
                        {
                            Name = i.Product.Name,
                            Image = i.Product.ProductColors.SelectMany(x => x.Images).Select(x => x.ImagePath).FirstOrDefault()
                        },
                        ProductColorId = i.ProductColorId,
                        ProductColor = new AdminProductColorDto
                        {
                            Name = i.ProductColor.ColorName,
                            Hex = i.ProductColor.ColorCode
                        },
                        Size = i.Size,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice
                    }).ToList(),
                    Payments = order.Payments.Select(p => new PaymentDto
                    {
                        Provider = p.Provider,
                        TransactionId = p.TransactionId,
                        Amount = p.Amount,
                        Status = (int)p.Status,
                        CreatedAt = p.CreatedAt
                    }).ToList(),
                    OrderAddress = new OrderAddressDto
                    {
                        FullName = order.OrderAddress.FullName,
                        Phone = order.OrderAddress.Phone,
                        AddressLine = order.OrderAddress.AddressLine,
                        City = order.OrderAddress.City,
                        PostalCode = order.OrderAddress.PostalCode
                    }
                };

                return Ok(orderDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching order", error = ex.Message });
            }
        }

        // PUT: api/orders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                if (!Enum.IsDefined(typeof(Order.OrderStatus), request.Status))
                {
                    return BadRequest(new { message = "Invalid status value" });
                }

                order.Status = (Order.OrderStatus)request.Status;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Order status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating order status", error = ex.Message });
            }
        }

        // PUT: api/orders/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                // Check if order can be cancelled
                if (order.Status == Order.OrderStatus.Delivered || order.Status == Order.OrderStatus.Cancelled)
                {
                    return BadRequest(new { message = "Order cannot be cancelled" });
                }

                order.Status = Order.OrderStatus.Cancelled;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while cancelling order", error = ex.Message });
            }
        }

        // GET: api/orders/export
        [HttpGet("export")]
        public async Task<IActionResult> ExportOrders(
            [FromQuery] int? status,
            [FromQuery] int? paymentStatus,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string search = "")
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderAddress)
                    .Include(o => o.Payments)
                    .AsQueryable();

                // Apply filters (same as GetOrders)
                if (status.HasValue) query = query.Where(o => (int)o.Status == status.Value);
                if (paymentStatus.HasValue) query = query.Where(o => o.Payments.Any(p => (int)p.Status == paymentStatus.Value));
                if (startDate.HasValue) query = query.Where(o => o.CreatedAt >= startDate.Value);
                if (endDate.HasValue) query = query.Where(o => o.CreatedAt <= endDate.Value.AddDays(1));
                if (!string.IsNullOrEmpty(search)) query = query.Where(o =>
                    o.OrderNumber.ToLower().Contains(search) ||
                    o.User.FirstName.ToLower().Contains(search) ||
                    o.User.Email.ToLower().Contains(search));

                var orders = await query
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new
                    {
                        o.OrderNumber,
                        Customer = o.User.FirstName,
                        o.User.Email,
                        Date = o.CreatedAt.ToString("yyyy-MM-dd"),
                        Status = o.Status.ToString(),
                        PaymentStatus = o.Payments.FirstOrDefault().Status.ToString(),
                        PaymentMethod = o.Payments.FirstOrDefault().Provider,
                        ItemsCount = o.Items.Sum(i => i.Quantity),
                        o.SubTotal,
                        Discount = o.DiscountTotal,
                        o.Shipping,
                        Total = o.GrandTotal,
                        ShippingAddress = $"{o.OrderAddress.AddressLine}, {o.OrderAddress.City}, {o.OrderAddress.PostalCode}",
                        o.OrderAddress.Phone
                    })
                    .ToListAsync();

                // Generate CSV
                var csv = "Order Number,Customer,Email,Date,Status,Payment Status,Payment Method,Items,SubTotal,Discount,Shipping,Total,Shipping Address,Phone\n";
                csv += string.Join("\n", orders.Select(o =>
                    $"\"{o.OrderNumber}\",\"{o.Customer}\",\"{o.Email}\",{o.Date},{o.Status},{o.PaymentStatus},{o.PaymentMethod},{o.ItemsCount},{o.SubTotal},{o.Discount},{o.Shipping},{o.Total},\"{o.ShippingAddress}\",\"{o.Phone}\""));

                var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
                return File(bytes, "text/csv", $"orders_export_{DateTime.Now:yyyyMMdd}.csv");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while exporting orders", error = ex.Message });
            }
        }
    }

    // DTO Classes
    public class OrderResponse
    {
        public List<OrderDto> Orders { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public UserDto User { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountTotal { get; set; }
        public decimal Shipping { get; set; }
        public decimal GrandTotal { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; }
        public List<PaymentDto> Payments { get; set; }
        public OrderAddressDto OrderAddress { get; set; }
    }

    public class UserDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime JoinDate { get; set; }
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public ProductDto Product { get; set; }
        public int ProductColorId { get; set; }
        public AdminProductColorDto ProductColor { get; set; }
        public string Size { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class ProductDto
    {
        public string Name { get; set; }
        public string Image { get; set; }
    }

    public class AdminProductColorDto
    {
        public string Name { get; set; }
        public string Hex { get; set; }
    }

    public class PaymentDto
    {
        public string Provider { get; set; }
        public string TransactionId { get; set; }
        public decimal Amount { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class OrderAddressDto
    {
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string AddressLine { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
    }

    public class OrderStatistics
    {
        public int Pending { get; set; }
        public int Confirmed { get; set; }
        public int Shipped { get; set; }
        public int Delivered { get; set; }
        public int Cancelled { get; set; }
    }

    public class UpdateStatusRequest
    {
        public int Status { get; set; }
    }
}