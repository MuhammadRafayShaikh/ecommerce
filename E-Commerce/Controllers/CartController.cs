using E_Commerce.Migrations;
using E_Commerce.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace E_Commerce.Controllers
{
    public class CartController : Controller
    {
        private readonly MyDbContext _myDbContext;
        private string userId
        {
            get { return User.FindFirstValue(ClaimTypes.NameIdentifier); }
        }
        public CartController(MyDbContext myDbContext)
        {
            _myDbContext = myDbContext;
        }

        public async Task<IActionResult> Index()
        {
            var carts = await _myDbContext.CartItems
                .Include(x => x.Product)
                .ThenInclude(x => x.Discount)
                .Include(x => x.Product)
                    .ThenInclude(p => p.ProductColors)
                        .ThenInclude(pc => pc.Images)
                .Include(x => x.ProductColor)
                .Include(x => x.Cart)
                .Where(x => x.Cart.UserId == userId)
                .OrderByDescending(x => x.Id)
                .ToListAsync();

            return View(carts);
        }


        //[HttpPost]
        //public async Task<JsonResult> Index(int productId, string currentUrl)
        //{
        //    if (!User.Identity.IsAuthenticated)
        //    {
        //        TempData["error"] = "Please login first to add to cart";
        //        return Json(new { success = false, redirect = "/Account/Login" });
        //    }
        //    //string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        //    bool cartExist = await _myDbContext.Carts.AnyAsync(x => x.UserId == userId && x.ProductId == productId);

        //    if (cartExist)
        //    {
        //        return Json(new { success = false, message = "Already in cart", redirect = "/Cart/Index" });
        //    }

        //    await _myDbContext.Carts.AddAsync(new Cart { ProductId = productId, Quantity = 1, UserId = userId });

        //    await _myDbContext.SaveChangesAsync();

        //    return Json(new { success = true, message = "Add to cart successfully!" });
        //}

        [HttpPost]
        public async Task<IActionResult> Index([FromBody] AddToCartDto model)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Json(new { success = false, message = "Please login first", redirect = "/Account/Login" });
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 1️⃣ Get or create cart
            var cart = await _myDbContext.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    Items = new List<CartItem>()
                };

                _myDbContext.Carts.Add(cart);
                await _myDbContext.SaveChangesAsync();
            }

            // 2️⃣ Insert cart items
            foreach (var color in model.Selections)
            {
                foreach (var size in color.Sizes)
                {
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ProductId = model.ProductId,
                        ProductColorId = color.ColorId,
                        Size = size.Size,
                        Quantity = size.Quantity,
                        UnitPrice = size.PricePerItem
                    };

                    cart.Items.Add(cartItem);
                }
            }

            await _myDbContext.SaveChangesAsync();

            return Json(new { success = true });
        }


        // In your CartController.cs
        [HttpGet]
        public async Task<IActionResult> GetProductWithSelections(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var cart = await _myDbContext.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.ProductColors)
                .Include(c => c.Items)
                    .ThenInclude(i => i.ProductColor)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
                return Json(new { success = false, message = "Cart not found" });

            // Get product with discount and colors
            var product = await _myDbContext.Products
                .Include(p => p.Discount)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Images)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                return Json(new { success = false, message = "Product not found" });

            // Get current selections from cart
            var currentSelections = cart.Items
                .Where(i => i.ProductId == productId)
                .Select(i => new
                {
                    colorId = i.ProductColorId,
                    colorName = i.ProductColor.ColorName,
                    colorCode = i.ProductColor.ColorCode,
                    size = i.Size,
                    quantity = i.Quantity,
                    unitPrice = i.UnitPrice
                })
                .ToList();

            // Calculate discounted price
            decimal originalPrice = product.Price;
            decimal discountedPrice = originalPrice;

            if (product.Discount != null)
            {
                if (product.Discount.DiscountType == Discount._Type.Percentage)
                {
                    discountedPrice = originalPrice - (originalPrice * product.Discount.DiscountValue / 100);
                }
                else if (product.Discount.DiscountType == Discount._Type.Fixed)
                {
                    discountedPrice = originalPrice - product.Discount.DiscountValue;
                }

                // Ensure price doesn't go below 0
                discountedPrice = Math.Max(discountedPrice, 0);
            }

            // Prepare response
            var response = new
            {
                success = true,
                data = new
                {
                    id = product.Id,
                    name = product.Name,
                    price = discountedPrice, // ✅ Discounted price
                    originalPrice = originalPrice, // ✅ Original price
                    discount = product.Discount == null ? null : new
                    {
                        id = product.Discount.Id,
                        type = (int)product.Discount.DiscountType, // ✅ Convert enum to int
                        value = product.Discount.DiscountValue,
                        discountedPrice = discountedPrice,
                        createdAt = product.Discount.CreatedAt
                    },
                    image = product.ProductColors
                        .SelectMany(pc => pc.Images)
                        .Select(img => img.ImagePath)
                        .FirstOrDefault(),
                    colors = product.ProductColors.Select(pc => new
                    {
                        id = pc.Id,
                        name = pc.ColorName,
                        code = pc.ColorCode,
                        extraPrice = pc.ExtraPrice,
                        stock = pc.Stock, // ✅ Stock per color
                        sizes = pc.Sizes?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => s.Trim())
                            .ToArray() ?? Array.Empty<string>()
                    }).ToList(),
                    currentSelections = currentSelections
                }
            };

            return Json(response);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _myDbContext.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
                return Json(new { success = false, message = "Cart not found" });

            try
            {
                // Remove existing items for this product
                var existingItems = cart.Items.Where(i => i.ProductId == request.ProductId).ToList();
                foreach (var item in existingItems)
                {
                    _myDbContext.CartItems.Remove(item);
                }

                // Add new selections
                foreach (var selection in request.Selections)
                {
                    var color = await _myDbContext.ProductColors.FindAsync(selection.ColorId);
                    if (color == null) continue;

                    foreach (var sizeSelection in selection.Sizes)
                    {
                        var unitPrice = await GetPriceForProductAndColor(request.ProductId, color.Id);

                        var cartItem = new CartItem
                        {
                            CartId = cart.Id,
                            ProductId = request.ProductId,
                            ProductColorId = selection.ColorId,
                            Size = sizeSelection.Size,
                            Quantity = sizeSelection.Quantity,
                            UnitPrice = unitPrice
                        };

                        _myDbContext.CartItems.Add(cartItem);
                    }
                }

                await _myDbContext.SaveChangesAsync();
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        private async Task<decimal> GetPriceForProductAndColor(int productId, int colorId)
        {
            var product = await _myDbContext.Products.FindAsync(productId);
            var color = await _myDbContext.ProductColors.FindAsync(colorId);

            if (product == null || color == null)
                return 0;

            return product.Price + (color.ExtraPrice ?? 0);
        }

        public async Task<JsonResult> ClearCart()
        {
            if (string.IsNullOrEmpty(userId))
                return Json(new { success = false, message = "User not logged in" });

            var cartItems = await _myDbContext.CartItems
                                .Where(x => x.Cart.UserId == userId)
                                .ToListAsync();

            _myDbContext.CartItems.RemoveRange(cartItems);
            await _myDbContext.SaveChangesAsync();

            return Json(new { success = true, deletedCount = cartItems.Count });
        }


    }
}
