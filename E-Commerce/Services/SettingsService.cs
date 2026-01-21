using E_Commerce.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace E_Commerce.Services
{
    public class SettingsService
    {
        private readonly MyDbContext _myDbContext;
        private readonly IMemoryCache _cache;

        private const string Cachekey = "APP_SETTINGS";
        public SettingsService(MyDbContext myDbContext, IMemoryCache cache)
        {
            _myDbContext = myDbContext;
            _cache = cache;
        }

        public async Task<Settings> GetSettingsAsync()
        {
            if (!_cache.TryGetValue(Cachekey, out Settings settings))
            {
                settings = await _myDbContext.Settings.FirstOrDefaultAsync();

                _cache.Set(Cachekey, settings, TimeSpan.FromMinutes(30));
            }

            return settings;
        } 

        public void ClearCache()
        {
            _cache.Remove(Cachekey);
        }
    }
}
