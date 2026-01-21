using E_Commerce.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public class CartCountViewComponent : ViewComponent
{
    private readonly MyDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public CartCountViewComponent(
        MyDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        int count = 0;

        if (User.Identity.IsAuthenticated)
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);

            if (user != null)
            {
                count = await _context.CartItems
                    .Include(x => x.Cart)
                    .Where(x => x.Cart.UserId == user.Id)
                    .Select(x => x.ProductId)
                    .Distinct()
                    .CountAsync();
            }
        }

        return View(count);
    }

}
