using Microsoft.AspNetCore.Mvc;

namespace E_Commerce.Controllers
{
    public class UploadController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Image(List<IFormFile> videos)
        {
            return Json(new
            {
                count = videos.Count,
                allFiles = Request.Form.Files.Count,
                names = videos.Select(x => x.FileName).ToList()
            });
        }
    }
}
