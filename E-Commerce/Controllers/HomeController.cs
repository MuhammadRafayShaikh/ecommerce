using Microsoft.AspNetCore.Mvc;
using E_Commerce.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace E_Commerce.Controllers
{
    public class HomeController : Controller
    {
        private readonly MyDbContext _myDbContext;
        private string userId
        {
            get { return User.FindFirstValue(ClaimTypes.NameIdentifier); }
        }
        public HomeController(MyDbContext myDbContext)
        {
            _myDbContext = myDbContext;
        }
        public async Task<IActionResult> Index()
        {
            List<Category> categories = await _myDbContext.Categories.Where(x => x.IsActive).Include(x => x.Products).Take(4).ToListAsync();
            Product newProduct = await NewProduct();
            AttractiveDiscountDto attractiveDiscounts = await AttractiveDiscount();
            HomeViewModel homeViewModel = new HomeViewModel
            {
                Categories = categories,
                NewProduct = newProduct,
                AttractiveDiscount = attractiveDiscounts
            };
            return View(homeViewModel);
        }

        private async Task<Product> NewProduct()
        {
            return await _myDbContext.Products.Where(x => x.IsActive).Include(x => x.ProductColors).ThenInclude(x => x.Images).OrderBy(x => x.Id).LastOrDefaultAsync();
        }

        private async Task<List<Product>> GetNewProducts()
        {
            return await _myDbContext.Products.Where(x => x.IsActive).Include(x => x.ProductColors).ThenInclude(x => x.Images).OrderByDescending(x => x.Id).Take(8).ToListAsync();
        }

        private async Task<AttractiveDiscountDto> AttractiveDiscount()
        {
            return await _myDbContext.Discounts
                .Include(d => d.Product)
                .ThenInclude(x => x.ProductColors)
                .ThenInclude(x => x.Images)
                .Where(d => d.Product != null && d.Product.IsActive) // Active products only
                .Select(d => new
                {
                    Image = d.Product.ProductColors.SelectMany(x => x.Images).Select(x => x.ImagePath).FirstOrDefault(),
                    Discount = d,
                    // Score calculate karein
                    Score = d.DiscountType == 0
                        ? d.DiscountValue * 1.0m // Percentage discount - directly use
                        : (d.DiscountValue / (d.DiscountedPrice + 0.01m)) * 100, // Fixed to percentage

                    FinalPrice = d.DiscountedPrice,
                    IsPercentage = d.DiscountType == 0,
                    DiscountValue = d.DiscountValue,
                    Product = new Product
                    {
                        Name = d.Product.Name,
                        ProductColors = d.Product.ProductColors,
                    }
                })
                .OrderByDescending(x => x.Score) // Highest score first
                .ThenBy(x => x.FinalPrice) // Agar same score hai to sasta wala
                .Select(x => new AttractiveDiscountDto
                {
                    ProductId = x.Discount.ProductId,
                    Product = x.Product,
                    ProductImage = x.Image,
                    OriginalPrice = x.IsPercentage
                        ? x.DiscountValue == 100
                            ? x.FinalPrice
                            : (x.FinalPrice * 100) / (100 - x.DiscountValue)
                        : x.FinalPrice + x.DiscountValue,
                    DiscountedPrice = x.FinalPrice,
                    DiscountText = x.IsPercentage
                        ? $"{x.DiscountValue}% OFF"
                        : $"₹{x.DiscountValue} OFF",
                    Savings = x.IsPercentage
                        ? $"{x.DiscountValue}%"
                        : $"₹{x.DiscountValue}"
                })
                .FirstOrDefaultAsync();
        }

        private async Task<List<AttractiveDiscountDto>> AttractiveDiscountList()
        {
            return await _myDbContext.Discounts
                .Include(d => d.Product)
                .ThenInclude(x => x.ProductColors)
                .ThenInclude(x => x.Images)
                .Where(d => d.Product != null && d.Product.IsActive) // Active products only
                .Select(d => new
                {
                    Image = d.Product.ProductColors.SelectMany(x => x.Images).Select(x => x.ImagePath).FirstOrDefault(),
                    Discount = d,
                    // Score calculate karein
                    Score = d.DiscountType == 0
                        ? d.DiscountValue * 1.0m // Percentage discount - directly use
                        : (d.DiscountValue / (d.DiscountedPrice + 0.01m)) * 100, // Fixed to percentage

                    FinalPrice = d.DiscountedPrice,
                    IsPercentage = d.DiscountType == 0,
                    DiscountValue = d.DiscountValue,
                    Product = new Product
                    {
                        Name = d.Product.Name,
                        ProductColors = d.Product.ProductColors,
                    }
                })
                .OrderByDescending(x => x.Score) // Highest score first
                .ThenBy(x => x.FinalPrice) // Agar same score hai to sasta wala
                .Select(x => new AttractiveDiscountDto
                {
                    ProductId = x.Discount.ProductId,
                    Product = x.Product,
                    ProductImage = x.Image,
                    OriginalPrice = x.IsPercentage
                        ? x.DiscountValue == 100
                            ? x.FinalPrice
                            : (x.FinalPrice * 100) / (100 - x.DiscountValue)
                        : x.FinalPrice + x.DiscountValue,
                    DiscountedPrice = x.FinalPrice,
                    DiscountText = x.IsPercentage
                        ? $"{x.DiscountValue}% OFF"
                        : $"₹{x.DiscountValue} OFF",
                    Savings = x.IsPercentage
                        ? $"{x.DiscountValue}%"
                        : $"₹{x.DiscountValue}"
                })
                .ToListAsync();
        }

        public async Task<LimitedProductDto> GetLimitedProductAsync()
        {
            // 1️⃣ Lowest stock product
            var grouped = await _myDbContext.ProductColors
                .GroupBy(pc => pc.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    TotalStock = g.Sum(x => x.Stock)
                })
                .OrderBy(x => x.TotalStock)
                .FirstOrDefaultAsync();

            if (grouped == null)
                return null;

            // 2️⃣ Product basic info
            var product = await _myDbContext.Products
                .Where(p => p.Id == grouped.ProductId)
                .Select(p => new Product
                {
                    Id = p.Id,
                    Name = p.Name,
                    ShortDescription = p.ShortDescription,
                    Price = p.Price
                })
                .FirstOrDefaultAsync();

            // 3️⃣ Colors + Images
            var colors = await _myDbContext.ProductColors
                .Where(pc => pc.ProductId == grouped.ProductId)
                .Select(pc => new ProductColorDto
                {
                    ColorName = pc.ColorName,
                    ColorCode = pc.ColorCode,
                    Stock = pc.Stock,
                    ExtraPrice = pc.ExtraPrice,
                    Sizes = pc.Sizes,

                    Images = pc.Images.Select(img => new ProductImageDto
                    {
                        Id = img.Id,
                        ImagePath = img.ImagePath
                    }).ToList()
                })
                .ToListAsync();

            // 4️⃣ Final DTO
            return new LimitedProductDto
            {
                ProductId = grouped.ProductId,
                TotalStock = grouped.TotalStock,
                Product = product,
                Colors = colors
            };
        }



        private async Task GetCartProducts()
        {
            List<int> cartProducts = await _myDbContext.CartItems
                .Where(x => x.Cart.UserId == userId)
                .Select(x => x.ProductId)
                .Distinct()
                .ToListAsync();

            TempData["cartProducts"] = cartProducts;
        }

        public async Task<IActionResult> Collections(int id)
        {
            ViewData["currentAction"] = "collections";
            ViewData["categoryId"] = id;
            List<Category> categories = await _myDbContext.Categories
                .OrderByDescending(x => x.Id)
                .ToListAsync();
            List<Product> products;
            if (id == 0)
            {
                products = await _myDbContext.Products
               .Include(x => x.Discount)
               .Include(x => x.ProductColors)
                   .ThenInclude(x => x.Images)
               .Where(x => x.IsActive)
               .OrderByDescending(x => x.Id)
               .ToListAsync();
            }
            else
            {
                products = await _myDbContext.Products
                .Include(x => x.Discount)
                .Include(x => x.ProductColors)
                    .ThenInclude(x => x.Images)
                .Where(x => x.CategoryId == id && x.IsActive)
                .OrderByDescending(x => x.Id)
                .ToListAsync();
            }
            List<string> fabrics = products
                .Select(x => x.Fabric)
                .Distinct()
                .ToList();
            List<string> occasions = products
                .Select(x => x.Occasion)
                .Distinct()
                .ToList();
            List<string> colors = products
                .SelectMany(x => x.ProductColors)
                .Select(x => x.ColorName)
                .Distinct()
                .ToList();

            List<int> cartProductIds = new();

            if (userId != null)
            {
                await GetCartProducts();
                //return Json(cartProducts);
                //    var cartExistance = await _myDbContext.Products
                //.Select(p => new Collections
                //{
                //    IsInCart = cartProductIds.Contains(p.Id)
                //})
                //.ToListAsync();
                //    TempData["IsInCart"] = cartExistance;
                //    var isIncart = TempData["IsInCart"];
                //    return Json(isIncart);
            }
            //List<Colors> colors = products.SelectMany(x => x.ProductColors).Select(x => new Colors { ColorCode = x.ColorCode, ColorName = x.ColorName}).Distinct().ToList();
            E_Commerce.Models.Collections collections = new Collections
            {
                Categories = categories,
                Products = products,
                Fabrics = fabrics,
                Occasions = occasions,
                Colors = colors,

            };
            return View(collections);
        }

        public async Task<IActionResult> Filter(int categoryId, string fabric, string occasion, string color, int minPrice, int maxPrice)
        {
            //return Json(new { minPrice = minPrice, maxPrice = maxPrice });
            string fabricValue = fabric?.Trim();
            string occasionValue = occasion?.Trim();
            string colorValue = color?.Trim();
            IQueryable<Product> query;
            if (categoryId == 0)
            {

                query = _myDbContext.Products.Include(x => x.ProductColors).ThenInclude(x => x.Images).AsQueryable();
            }
            else
            {

                query = _myDbContext.Products.Include(x => x.ProductColors).ThenInclude(x => x.Images).Where(x => x.CategoryId == categoryId).AsQueryable();
            }

            if (minPrice > 0)
                query = query.Where(x => x.Price >= minPrice);

            if (maxPrice > 0)
                query = query.Where(x => x.Price <= maxPrice);

            if (!string.IsNullOrEmpty(fabricValue))
            {
                query = query.Where(x => x.Fabric == fabricValue);
            }

            if (!string.IsNullOrEmpty(occasionValue))
            {
                query = query.Where(x => x.Occasion == occasionValue);
            }

            if (!string.IsNullOrEmpty(colorValue))
            {
                query = query.Where(x => x.ProductColors.Any(pc => pc.ColorName == colorValue));
            }

            List<Product> products = await query.OrderByDescending(x => x.Id).ToListAsync();

            if (products == null || products.Count == 0)
            {
                TempData["error"] = "OOPS! No Product Found. Accordin to your filter";
            }
            //return Json(products);
            E_Commerce.Models.Collections collections = new Collections { Products = products };
            return PartialView("~/Views/Home/CollectionsPartial/_CollectionsCard.cshtml", collections);
            //return Json(new {fabric = fabric, occasion = occasion, color = color, minPrice = minPrice, maxPrice = maxPrice});
        }

        public async Task<IActionResult> Featured(string highlightedProduct = "")
        {
            ViewData["currentAction"] = "featured";
            Product newProduct = await NewProduct();
            AttractiveDiscountDto attractiveDiscount = await AttractiveDiscount();
            List<Product> getNewProducts = await GetNewProducts();
            List<AttractiveDiscountDto> attractiveDiscountList = await AttractiveDiscountList();
            //LimitedProductDto limitedProduct = await GetLimitedProductAsync();

            HomeViewModel homeViewModel = new HomeViewModel
            {
                NewProduct = newProduct,
                AttractiveDiscount = attractiveDiscount,
                LatestProducts = getNewProducts,
                AttractiveDiscountList = attractiveDiscountList
                //LimitedProduct = limitedProduct
            };

            if (userId != null)
            {
                await GetCartProducts();
            }
            ViewBag.HighlightedProduct = highlightedProduct;
            return View(homeViewModel);
        }

        // In your HomeController or SalesController
        public async Task<IActionResult> Sales()
        {
            var discounts = await _myDbContext.Discounts
                .Include(d => d.Product)
                    .ThenInclude(p => p.ProductColors)
                        .ThenInclude(pc => pc.Images)
                .Where(d => d.Product != null && d.Product.IsActive)
                .OrderByDescending(d => d.DiscountValue)
                .ToListAsync();

            foreach (var discount in discounts)
            {
                if (discount.DiscountType == Discount._Type.Percentage)
                {
                    discount.DiscountedPrice = discount.Product.Price * (1 - (discount.DiscountValue / 100));
                }
                else // Fixed discount
                {
                    discount.DiscountedPrice = discount.Product.Price - discount.DiscountValue;
                }

                // Ensure discounted price is not negative
                discount.DiscountedPrice = Math.Max(discount.DiscountedPrice, 0);
            }

            // Group by discount percentage for filtering
            var discountGroups = discounts
                .GroupBy(d => d.DiscountType == Discount._Type.Percentage ?
                    $"{(int)d.DiscountValue}% OFF" :
                    $"₹{(int)d.DiscountValue} OFF")
                .OrderByDescending(g => g.Key)
                .ToList();

            var viewModel = new SalesViewModel
            {
                Discounts = discounts,
                DiscountGroups = discountGroups.Select(g => g.Key).ToList(),
                TotalSavings = discounts.Sum(d => d.Product.Price - d.DiscountedPrice),
                ProductCount = discounts.Count
            };

            return View(viewModel);
        }

        public ViewResult About()
        {
            return View();
        }
    }
}
