using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Threading.Tasks;
using E_Commerce.Models;
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace E_Commerce.Controllers
{
    //[Authorize(Roles = "Admin")]
    public class CustomersController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public CustomersController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        // GET: Customer/Index
        public async Task<IActionResult> Index(string search = "", int page = 1, int pageSize = 10)
        {
            ViewBag.CurrentPage = page;
            ViewBag.PageSize = pageSize;
            ViewBag.SearchTerm = search;

            var query = _userManager.Users.AsQueryable();

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u =>
                    u.FirstName.Contains(search) ||
                    u.LastName.Contains(search) ||
                    u.Email.Contains(search) ||
                    u.PhoneNumber.Contains(search));
            }

            // Get total count for pagination
            var totalCustomers = await _userManager.Users.CountAsync();
            ViewBag.TotalCustomers = totalCustomers;
            ViewBag.TotalPages = (int)Math.Ceiling(totalCustomers / (double)pageSize);

            // Apply pagination
            var customers = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return View(customers);
        }

        // GET: Customer/Details/5
        public async Task<IActionResult> Details(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var customer = await _userManager.FindByIdAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            return View(customer);
        }

        // POST: Customer/ToggleStatus/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ToggleStatus(string id)
        {
            if (id == null)
            {
                return Json(new { success = false, message = "Customer not found." });
            }

            var customer = await _userManager.FindByIdAsync(id);
            if (customer == null)
            {
                return Json(new { success = false, message = "Customer not found." });
            }

            customer.Status = !customer.Status;
            customer.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(customer);
            if (result.Succeeded)
            {
                return Json(new { success = true, status = customer.Status });
            }

            return Json(new { success = false, message = "Failed to update status." });
        }

        // POST: Customer/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            if (id == null)
            {
                return Json(new { success = false, message = "Customer not found." });
            }

            var customer = await _userManager.FindByIdAsync(id);
            if (customer == null)
            {
                return Json(new { success = false, message = "Customer not found." });
            }

            // Note: We're not actually deleting the user, just marking them as inactive
            // If you want to hard delete, use: var result = await _userManager.DeleteAsync(customer);
            customer.Status = false;
            customer.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(customer);
            if (result.Succeeded)
            {
                return Json(new { success = true, message = "Customer deactivated successfully." });
            }

            return Json(new { success = false, message = "Failed to deactivate customer." });
        }

        // GET: Customer/GetStats
        public async Task<IActionResult> GetStats()
        {
            var totalCustomers = await _userManager.Users.CountAsync();
            var activeCustomers = await _userManager.Users.CountAsync(u => u.Status);
            var newCustomersToday = await _userManager.Users.CountAsync(u => u.CreatedAt.Date == DateTime.UtcNow.Date);

            return Json(new
            {
                total = totalCustomers,
                active = activeCustomers,
                newToday = newCustomersToday,
                inactive = totalCustomers - activeCustomers
            });
        }
    }
}