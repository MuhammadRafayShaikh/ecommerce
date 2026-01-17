using E_Commerce.Migrations;
using E_Commerce.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace E_Commerce.Controllers
{
    [Authorize(Roles = "Admin")]
    public class ProductController : Controller
    {
        private readonly MyDbContext _myDbContext;
        private readonly IWebHostEnvironment webHostEnvironment;
        public ProductController(MyDbContext myDbContext, IWebHostEnvironment webHostEnvironment)
        {
            _myDbContext = myDbContext;
            this.webHostEnvironment = webHostEnvironment;
        }
        public async Task<IActionResult> Index()
        {
            List<Product> products = await _myDbContext.Products.Include(x => x.Category).Include(x => x.ProductColors).ThenInclude(x => x.Images).OrderByDescending(x => x.Id).ToListAsync();
            ViewData["totalProducts"] = products.Count();
            ViewData["activeProducts"] = products.Where(x => x.IsActive).Count();
            ViewData["inStockProducts"] = products.Where(x => x.Availability == "in-stock").Count();
            ViewData["inventoryValue"] = null;
            return View(products);
        }
        private async Task<List<Category>> GetCategories()
        {
            List<Category> categories = await _myDbContext.Categories.ToListAsync();
            return categories;
        }

        private async void SendCategoriesToView()
        {
            var categories = await GetCategories();
            ViewData["categories"] = categories;
        }
        public async Task<IActionResult> Add()
        {
            var categories = await GetCategories();
            ViewData["categories"] = categories;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Add(Product product, string ColorVariantsJson, List<IFormFile> EcommerceProductVideos)
        {
            //return Json(new { product= product, success = false });
            //return Json(new
            //{
            //    videos = EcommerceProductVideos.Count,
            //    allFiles = Request.Form.Files.Count
            //});
            ModelState.Remove("ColorVariantsJson");
            //        var errors = ModelState
            //.Where(x => x.Value.Errors.Count > 0)
            //.Select(x => new
            //{
            //    Field = x.Key,
            //    Errors = x.Value.Errors.Select(e => e.ErrorMessage)
            //});
            if (!ModelState.IsValid)
            {
                return Json(new
                {
                    success = false,
                    message = "Invalid product data"
                });
            }

            if (EcommerceProductVideos != null && EcommerceProductVideos.Any())
            {
                foreach (var video in EcommerceProductVideos)
                {
                    if (video.Length > 50 * 1024 * 1024)
                    {
                        return Json(new
                        {
                            success = false,
                            message = "Video size must be less than 50 MB."
                        });
                    }
                }
            }


            var colorVariants = JsonConvert.DeserializeObject<Dictionary<string, ColorVariantDto>>(ColorVariantsJson);
            //return Json(colorVariants);
            foreach (var images in colorVariants)
            {
                int count = 0;
                //return Json(images.Value.Images);
                //return Json(images.Value.Images.Count);
                string color = "";
                foreach (var image in images.Value.Images)
                {
                    //color += images.Key;
                    if (color != images.Key)
                    {
                        color += images.Key;
                    }
                    if (image != null)
                    {
                        count++;
                    }
                }
                if (count < 2)
                {
                    return Json(new
                    {
                        success = false,
                        message = $"Please select 2 images of each selected color but you select {count} image of {color}"
                    });
                }
                //count++;
            }

            await _myDbContext.Products.AddAsync(product);
            await _myDbContext.SaveChangesAsync();


            //return Json(colorVariants);
            foreach (var color in colorVariants)
            {
                //var productColor = await _myDbContext.ProductColors.AddAsync(new ProductColor { });
                var productColor = new ProductColor
                {
                    ProductId = product.Id,
                    ColorName = color.Key,
                    ColorCode = color.Value.ColorCode,
                    Stock = color.Value.Stock,
                    ExtraPrice = color.Value.ExtraPrice,
                    Sizes = string.Join(", ", color.Value.Sizes)
                };
                await _myDbContext.ProductColors.AddAsync(productColor);
                foreach (var base64Image in color.Value.Images)
                {
                    if (string.IsNullOrEmpty(base64Image))
                        continue;

                    string imageName = SaveBase64Image(
                        base64Image,
                        Path.Combine(webHostEnvironment.WebRootPath, "ProductImages")
                    );

                    await _myDbContext.ProductImages.AddAsync(
                        new ProductImage
                        {
                            ProductColor = productColor,
                            ImagePath = imageName,
                            IsPrimary = false
                        });
                }

            }
            //return Json(colorVariant0);
            //await _myDbContext.ProductColors.AddAsync();

            //return Json(colorVariants);
            if (EcommerceProductVideos != null && EcommerceProductVideos.Any())
            {
                foreach (var video in EcommerceProductVideos)
                {
                    var videoName = await SaveVideoAsync(video);

                    await _myDbContext.ProductVideos.AddAsync(
                        new ProductVideo
                        {
                            ProductId = product.Id,
                            VideoPath = videoName,
                            VideoSize = video.Length
                        });
                }
            }

            await _myDbContext.SaveChangesAsync();

            return Json(new
            {
                success = true,
                message = "Product added successfully",
                productId = product.Id,
                videoCount = EcommerceProductVideos?.Count ?? 0
            });
        }

        public async Task<IActionResult> Detail(int id)
        {
            Product product = await _myDbContext.Products
                .Include(x => x.Category)
                .Include(x => x.Videos)
                .Include(x => x.ProductColors)
                    .ThenInclude(x => x.Images)
                .Where(x => x.Id == id)
                .FirstOrDefaultAsync();
            return View(product);
        }

        public async Task<IActionResult> Edit(int id)
        {
            Product products = await _myDbContext.Products
                .Include(x => x.Category)
                .Include(x => x.ProductColors)
                    .ThenInclude(x => x.Images)
                .Where(x => x.Id == id)
                .FirstOrDefaultAsync();
            ViewData["categories"] = await _myDbContext.Categories.OrderByDescending(x => x.Id).ToListAsync();
            var productColors = products.ProductColors.Select(c => new ProductColorDto
            {
                ColorName = c.ColorName,
                Stock = c.Stock,
                ExtraPrice = c.ExtraPrice,
                ColorCode = c.ColorCode,
                Sizes = c.Sizes,
                //Images = c.Images.Select(i => i.ImagePath).ToList()
            }).ToList();

            ViewBag.ProductColors = productColors;

            return View(products);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(Product product, string ColorVariantsJson)
        {
            return Json(new { value = ColorVariantsJson });
        }

        [HttpPost]
        public async Task<JsonResult> CheckActive(int productId)
        {
            var product = await _myDbContext.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
                return Json(new { success = false });

            product.IsActive = !product.IsActive;
            await _myDbContext.SaveChangesAsync();

            return Json(new
            {
                success = true,
                isActive = product.IsActive
            });
        }

        public async Task<IActionResult> Discounts()
        {
            List<Product> discounts = await _myDbContext.Products.Include(x => x.Discount).Include(x => x.ProductColors).ThenInclude(x => x.Images).OrderByDescending(x => x.Id).ToListAsync();
            //string firstImage = discounts.Select(x => x.Product.ProductColors.FirstOrDefault(x => x.Images.FirstOrDefault()));
            var firstImage = discounts.SelectMany(x => x.ProductColors).SelectMany(x => x.Images).Select(x => x.ImagePath).FirstOrDefault();
            int count = discounts.Select(x => x.Discount).Count();
            ViewData["firstImage"] = firstImage;
            //return Json(firstImage);
            return View(discounts);
        }

        [HttpPost]
        public async Task<IActionResult> ApplyBulkDiscount(List<int> productIds, string discountType, decimal discountValue)
        {
            if (productIds == null || !productIds.Any())
            {
                TempData["error"] = "No products selected";
                return Json(new { success = false, message = "No products selected" });
            }

            Discount._Type discountEnum = discountType == "percentage"
                ? Discount._Type.Percentage
                : Discount._Type.Fixed;

            List<Product> products = await _myDbContext.Products
                .Include(x => x.Discount)
                .Include(x => x.ProductColors)
                .ThenInclude(x => x.Images)
                .Where(x => productIds.Contains(x.Id))
                .ToListAsync();

            foreach (var product in products)
            {
                decimal discountedPrice;

                if (discountEnum == Discount._Type.Percentage)
                {
                    if (discountValue > 100)
                        continue;

                    discountedPrice = product.Price - (product.Price * discountValue / 100);
                }
                else
                {
                    if (discountValue >= product.Price)
                        continue;

                    discountedPrice = product.Price - discountValue;
                }

                if (product.Discount != null)
                {
                    product.Discount.DiscountType = discountEnum;
                    product.Discount.DiscountValue = discountValue;
                    product.Discount.DiscountedPrice = discountedPrice;
                }
                else
                {
                    await _myDbContext.Discounts.AddAsync(new Discount
                    {
                        ProductId = product.Id,
                        DiscountType = discountEnum,
                        DiscountValue = discountValue,
                        DiscountedPrice = discountedPrice
                    });
                }
            }

            await _myDbContext.SaveChangesAsync();

            var allProducts = await _myDbContext.Products
                .Include(x => x.Discount)
                .Include(x => x.ProductColors)
                .ThenInclude(x => x.Images)
                .OrderByDescending(x => x.Id)
                .ToListAsync();
            TempData["success"] = "Discount applied successfully";
            return PartialView("_DiscountProductsTable", allProducts);
        }

        public async Task<IActionResult> ApplySingleDiscount(int productId, string discountType, decimal discountValue)
        {
            Discount._Type discountEnum = discountType == "percentage" ? Discount._Type.Percentage : Discount._Type.Fixed;

            Product product = await _myDbContext.Products.Include(x => x.Discount).Where(x => x.Id == productId).FirstOrDefaultAsync();

            List<Product> allProducts = await GetProducts();

            decimal discountedPrice;
            if (discountEnum == Discount._Type.Percentage)
            {
                discountedPrice = product.Price - (product.Price * discountValue / 100);
            }
            else
            {
                if (discountValue >= product.Price)
                {
                    TempData["error"] = "Fixed discount cannot exceed product price";
                    return PartialView("_DiscountProductsTable", allProducts);
                }
                discountedPrice = product.Price - discountValue;
            }

            if (product.Discount != null)
            {
                product.Discount.DiscountType = discountEnum;
                product.Discount.DiscountValue = discountValue;
                product.Discount.DiscountedPrice = discountedPrice;
            }
            else
            {
                await _myDbContext.Discounts.AddAsync(new Discount { ProductId = productId, DiscountType = discountEnum, DiscountValue = discountValue, DiscountedPrice = discountedPrice });
            }

            await _myDbContext.SaveChangesAsync();

            List<Product> updatedProducts = await GetProducts();

            TempData["success"] = "Discount applied successfully";
            return PartialView("_DiscountProductsTable", updatedProducts);
        }

        public async Task<PartialViewResult> RemoveDiscount(int productId)
        {
            Discount discount = await _myDbContext.Discounts.Where(x => x.ProductId == productId).FirstOrDefaultAsync();
            List<Product> allProducts = await GetProducts();
            if (discount == null)
            {
                TempData["error"] = "Discount not found for this product";
                return PartialView("_DiscountProductsTable", allProducts);
            }

            _myDbContext.Discounts.Remove(discount);
            await _myDbContext.SaveChangesAsync();

            List<Product> updatedProducts = await GetProducts();

            TempData["success"] = "Discount remove successfully";
            return PartialView("_DiscountProductsTable", updatedProducts);
        }

        private async Task<List<Product>> GetProducts()
        {
            return await _myDbContext.Products
                .Include(x => x.Discount)
                .Include(x => x.ProductColors)
                .ThenInclude(x => x.Images)
                .OrderByDescending(x => x.Id)
                .ToListAsync();
        }

        public string SaveBase64Image(string base64Image, string folderPath)
        {
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            // data:image/png;base64, hatao
            var base64Data = base64Image.Split(',')[1];

            byte[] imageBytes = Convert.FromBase64String(base64Data);

            string fileName = Guid.NewGuid() + ".png";
            string fullPath = Path.Combine(webHostEnvironment.WebRootPath, folderPath, fileName);

            System.IO.File.WriteAllBytes(fullPath, imageBytes);

            return fileName; // DB me ye save hoga
        }

        private async Task<string> SaveVideoAsync(IFormFile video)
        {
            var uploadsFolder = Path.Combine(webHostEnvironment.WebRootPath, "ProductVideos");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(video.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await video.CopyToAsync(stream);
            }

            return fileName;
        }

    }
}
