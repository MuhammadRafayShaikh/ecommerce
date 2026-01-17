using E_Commerce.Models;
using E_Commerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace E_Commerce.Controllers
{
    [Authorize(Roles = "Admin")]
    public class CategoryController : Controller
    {
        private readonly MyDbContext _myDbContext;
        private readonly AddImage _addImage;
        public CategoryController(MyDbContext myDbContext, AddImage addImage)
        {
            _myDbContext = myDbContext;
            _addImage = addImage;
        }
        public async Task<IActionResult> Index()
        {
            List<Category> categories = await _myDbContext.Categories.OrderByDescending(x => x.Id).ToListAsync();
            return View(categories);
        }
        public IActionResult Add()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Add(Category category, IFormFile Image)
        {
            ModelState.Remove("Image");
            if (!ModelState.IsValid)
            {
                return Json(ModelState);
            }
            string fileName = "default.png";
            if (Image != null)
            {
                ImageUploadResult result = await _addImage.UploadImageAsync(Image, "CategoryImages", null);
                if (!result.Success)
                {
                    ModelState.AddModelError("Image", result.ErrorMessage);
                    return View(category);
                }
                fileName = result.FileName;
            }

            category.Image = fileName;
            await _myDbContext.Categories.AddAsync(category);
            await _myDbContext.SaveChangesAsync();

            return RedirectToAction("Index");
        }

        public async Task<IActionResult> Edit(int id)
        {
            Category category = await _myDbContext.Categories.FindAsync(id);
            return View(category);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(Category category, IFormFile Image)
        {
            string imagename = category.Image;
            string slug = category.Slug;
            //var category = category;
            ModelState.Remove("Image");
            if (!ModelState.IsValid)
            {
                return View(category);
            }
            string fileName = category.Image;
            if(Image != null)
            {
                ImageUploadResult result = await _addImage.UploadImageAsync(Image, "CategoryImages", fileName);
                if (!result.Success)
                {
                    ModelState.AddModelError("Image", result.ErrorMessage);
                    return View(category);
                }
                fileName = result.FileName;
            }
            category.Image = fileName;
            _myDbContext.Categories.Update(category);
            await _myDbContext.SaveChangesAsync();

            return RedirectToAction("Index");
        }

        public async Task<JsonResult> CheckActive(int? categoryId)
        {
            if (categoryId == null)
            {
                return Json(new { success = false, message = "Id is required" });
            }

            Category category = await _myDbContext.Categories.FindAsync(categoryId);

            if (category == null)
            {
                return Json(new { success = false, message = "Category not found" });
            }

            if (category.IsActive)
            {
                category.IsActive = false;
            }
            else if (!category.IsActive)
            {
                category.IsActive = true;
            }

            await _myDbContext.SaveChangesAsync();

            return Json(new
            {
                success = true,
                message = "Status Updated Successfully",
                isActive = category.IsActive
            });

        }
    }
}
