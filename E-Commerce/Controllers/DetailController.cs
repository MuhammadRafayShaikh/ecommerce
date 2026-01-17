using E_Commerce.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace E_Commerce.Controllers
{
    public class DetailController : Controller
    {
        private readonly MyDbContext _myDbContext;
        public DetailController(MyDbContext myDbContext)
        {
            _myDbContext = myDbContext;
        }
        public async Task<IActionResult> Index(int id)
        {
            Product products = await _myDbContext.Products
                .Include(x => x.ProductColors)
                    .ThenInclude(x => x.Images)
                .Include(x => x.Discount)
                .Include(x => x.Videos)
                .Where(x => x.Id == id)
                .FirstOrDefaultAsync();
            return View(products);
        }

        [HttpGet]
        public IActionResult GetColorData(int colorId)
        {
            try
            {
                var color = _myDbContext.ProductColors
                    .Include(c => c.Images)
                    .FirstOrDefault(c => c.Id == colorId);

                if (color == null)
                {
                    return Json(new { success = false, message = "Color not found" });
                }

                var imageUrls = color.Images
                    .Select(img => Url.Content($"~/ProductImages/{img.ImagePath}"))
                    .ToList();

                var sizes = color.Sizes;

                return Json(new
                {
                    success = true,
                    images = imageUrls,
                    sizes = sizes
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
