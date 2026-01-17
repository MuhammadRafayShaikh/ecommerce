using Microsoft.AspNetCore.Hosting;

namespace E_Commerce.Services
{
    public class AddImage
    {
        private readonly IWebHostEnvironment webHostEnvironment;
        public AddImage(IWebHostEnvironment webHostEnvironment)
        {
            this.webHostEnvironment = webHostEnvironment;
        }
        public async Task<ImageUploadResult> UploadImageAsync(IFormFile Image, string FolderName, string oldFileName)
        {
            if (Image == null || Image.Length == 0)
            {
                return new ImageUploadResult { Success = false, ErrorMessage = "Image is required" };
            }

            if (!Directory.Exists(FolderName))
            {
                Directory.CreateDirectory(FolderName);
            }

            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var fileExtension = Path.GetExtension(Image.FileName).ToLower();

            var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            var mimeType = Image.ContentType.ToLower();

            if (!allowed.Contains(fileExtension) || !allowedMimeTypes.Contains(mimeType))
            {
                return new ImageUploadResult { Success = false, ErrorMessage = "Invalid file type. Allowed: jpg, jpeg, png, webp." };
            }

            var ImageName = Path.GetFileNameWithoutExtension(Image.FileName)
                            + DateTime.Now.ToString("yyyyMMddHHmmss") + fileExtension;

            var path = Path.Combine(webHostEnvironment.WebRootPath, FolderName);
            var ImagePath = Path.Combine(path, ImageName);

            if (oldFileName != null)
            {
                if (oldFileName != "default.png")
                {
                    if (File.Exists(Path.Combine(path, oldFileName)))
                    {
                        System.IO.File.Delete(Path.Combine(path, oldFileName));
                    }
                }
            }

            using (var stream = new FileStream(ImagePath, FileMode.Create))
            {
                await Image.CopyToAsync(stream);
            }

            return new ImageUploadResult { Success = true, FileName = ImageName };
        }
    }
}
